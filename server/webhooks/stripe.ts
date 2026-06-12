import type { Request, Response } from "express";
import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "../lib/stripe.ts";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabase-admin.ts";
import { notifySlack } from "../lib/notify.ts";
import { PLANS, isPlanKey, isBillingInterval } from "../../shared/billing.ts";
import { nanoid } from "nanoid";
import {
  sendEmail,
  buildInviteEmail,
  buildPaymentFailedEmail,
} from "../lib/email.ts";

// Subscription statuses that grant portal access. past_due keeps access during
// the dunning window; Stripe cancels the subscription if retries are exhausted.
const PAID_STATUSES = new Set(["active", "trialing", "past_due"]);

export interface TenantBillingUpdate {
  tenantId: string;
  fields: Record<string, unknown>;
}

export interface StripeEventDeps {
  findTenantIdBySubscription(subscriptionId: string): Promise<string | null>;
  findTenantIdByCustomer(customerId: string): Promise<string | null>;
}

/** Pre-basil API versions expose current_period_end on the subscription;
 *  2025-03-31+ moves it onto each subscription item. */
export function getPeriodEnd(subscription: Stripe.Subscription): string | null {
  const legacy = (subscription as unknown as { current_period_end?: number })
    .current_period_end;
  const fromItem = subscription.items?.data?.[0]?.current_period_end;
  const epoch = legacy ?? fromItem;
  return epoch ? new Date(epoch * 1000).toISOString() : null;
}

/** Pre-basil: invoice.subscription; basil+: invoice.parent.subscription_details. */
export function getInvoiceSubscriptionId(
  invoice: Stripe.Invoice
): string | null {
  const inv = invoice as unknown as {
    subscription?: string | { id: string } | null;
    parent?: {
      subscription_details?: {
        subscription?: string | { id: string } | null;
      } | null;
    } | null;
  };
  const raw =
    inv.subscription ?? inv.parent?.subscription_details?.subscription;
  if (!raw) return null;
  return typeof raw === "string" ? raw : raw.id;
}

function asId(
  value: string | { id: string } | null | undefined
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/**
 * Map a Stripe event to a tenant billing update. Pure decision logic —
 * lookups are injected so this is unit-testable without Stripe or Supabase.
 * Returns null when the event requires no action.
 */
export async function deriveTenantUpdate(
  event: Stripe.Event,
  deps: StripeEventDeps
): Promise<TenantBillingUpdate | null> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const tenantId = session.metadata?.tenant_id;
      if (!tenantId || session.mode !== "subscription") return null;

      const plan = session.metadata?.plan;
      const interval = session.metadata?.interval;
      return {
        tenantId,
        fields: {
          stripe_customer_id: asId(session.customer),
          stripe_subscription_id: asId(session.subscription),
          ...(isPlanKey(plan) ? { plan } : {}),
          ...(isBillingInterval(interval)
            ? { billing_interval: interval }
            : {}),
          paid: true,
          subscription_status: "active",
          cancel_at_period_end: false,
          // Payment is approval — self-serve checkouts create the tenant
          // unapproved, and this is what unlocks portal content for them.
          approved_by_admin: true,
        },
      };
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const tenantId =
        (await deps.findTenantIdBySubscription(sub.id)) ??
        sub.metadata?.tenant_id ??
        null;
      if (!tenantId) return null;

      return {
        tenantId,
        fields: {
          stripe_subscription_id: sub.id,
          subscription_status: sub.status,
          cancel_at_period_end: sub.cancel_at_period_end ?? false,
          current_period_end: getPeriodEnd(sub),
          paid: PAID_STATUSES.has(sub.status),
          ...(isBillingInterval(
            sub.items?.data?.[0]?.price?.recurring?.interval
          )
            ? { billing_interval: sub.items.data[0].price.recurring?.interval }
            : {}),
        },
      };
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const tenantId =
        (await deps.findTenantIdBySubscription(sub.id)) ??
        sub.metadata?.tenant_id ??
        null;
      if (!tenantId) return null;

      return {
        tenantId,
        fields: {
          paid: false,
          subscription_status: "canceled",
          cancel_at_period_end: false,
          status: "paused",
        },
      };
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (!getInvoiceSubscriptionId(invoice)) return null;
      const customerId = asId(
        invoice.customer as string | { id: string } | null
      );
      const tenantId = customerId
        ? await deps.findTenantIdByCustomer(customerId)
        : null;
      if (!tenantId) return null;

      return { tenantId, fields: { subscription_status: "past_due" } };
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      if (!getInvoiceSubscriptionId(invoice)) return null;
      const customerId = asId(
        invoice.customer as string | { id: string } | null
      );
      const tenantId = customerId
        ? await deps.findTenantIdByCustomer(customerId)
        : null;
      if (!tenantId) return null;

      return {
        tenantId,
        fields: { paid: true, subscription_status: "active" },
      };
    }

    default:
      return null;
  }
}

const supabaseDeps: StripeEventDeps = {
  async findTenantIdBySubscription(subscriptionId) {
    const { data } = await supabaseAdmin
      .from("tenants")
      .select("id")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();
    return (data?.id as string | undefined) ?? null;
  },
  async findTenantIdByCustomer(customerId) {
    const { data } = await supabaseAdmin
      .from("tenants")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    return (data?.id as string | undefined) ?? null;
  },
};

/**
 * Portal invite for a self-serve buyer: if the tenant has no members yet,
 * create an onboarding link (+ workspace_status row) and email it. No-op for
 * tenants whose users already joined the portal.
 */
async function sendSelfServeInvite(
  tenantId: string,
  opts: {
    company: string;
    contactEmail: string | null;
    contactName: string | null;
  }
): Promise<void> {
  try {
    const { count } = await supabaseAdmin
      .from("tenant_members")
      .select("user_id", { count: "exact", head: true })
      .eq("tenant_id", tenantId);
    if ((count ?? 0) > 0 || !opts.contactEmail) return;

    const token = nanoid(32);
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    await supabaseAdmin.from("onboarding_links").insert({
      token,
      tenant_id: tenantId,
      expires_at: expiresAt,
      used: false,
    });
    await supabaseAdmin
      .from("workspace_status")
      .upsert({ tenant_id: tenantId }, { onConflict: "tenant_id", ignoreDuplicates: true });

    const baseUrl = process.env.APP_URL ?? "https://myersdigitalconsulting.com";
    const invite = buildInviteEmail({
      companyName: opts.company,
      contactName: opts.contactName,
      joinUrl: `${baseUrl}/portal/join?token=${token}`,
    });
    await sendEmail({
      to: opts.contactEmail,
      subject: invite.subject,
      html: invite.html,
    });
  } catch (err) {
    console.error("[stripe-webhook] self-serve invite error:", err);
  }
}

/**
 * Fire-and-forget follow-ups after a tenant billing update: Slack alerts for
 * money events, and the Director closed-won onboarding chain on a new
 * subscription. Runs off the request path — failures are logged, never
 * surfaced to Stripe (the webhook has already been acknowledged).
 */
export async function runBillingAutomations(
  event: Stripe.Event,
  tenantId: string
): Promise<void> {
  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("company_name, plan, contact_email, contact_name")
    .eq("id", tenantId)
    .maybeSingle();
  const company = (tenant?.company_name as string | undefined) ?? tenantId;
  const planKey = tenant?.plan as string | undefined;
  const planName = isPlanKey(planKey) ? PLANS[planKey].name : (planKey ?? "unknown plan");

  switch (event.type) {
    case "checkout.session.completed": {
      await notifySlack(`💰 New AIOS subscription: ${company} — ${planName}`);

      // Self-serve buyers have no portal account yet — issue an invite link
      // so payment leads straight into onboarding. Admin-provisioned tenants
      // already received theirs at provision time (they have members or a
      // pending link by then, but a duplicate link is harmless: single-use each).
      await sendSelfServeInvite(tenantId, {
        company,
        contactEmail: (tenant?.contact_email as string | null) ?? null,
        contactName: (tenant?.contact_name as string | null) ?? null,
      });

      // Kick off the closed-won onboarding chain (same flow as
      // POST /webhooks/sales/closed-won). Dynamic import keeps the agents
      // framework out of this module's import graph for unit tests.
      if (process.env.ANTHROPIC_API_KEY) {
        try {
          const { createDirectorAgent } = await import("../agents/director.ts");
          const director = createDirectorAgent();
          await director.run(
            `New client closed via Stripe Checkout: ${company} subscribed to ${planName}. Route to Sales agent to fire the SAL-04 → DEL-02 onboarding chain, then route to Operations to provision the GHL sub-account. The setup fee and first month were already collected through Stripe — no invoice needed.`,
            JSON.stringify({
              client_name: company,
              package_tier: planKey,
              contact_email: tenant?.contact_email ?? null,
            })
          );
        } catch (err) {
          console.error("[stripe-webhook] closed-won automation error:", err);
        }
      }
      return;
    }

    case "invoice.payment_failed": {
      await notifySlack(
        `⚠️ Payment failed: ${company} (${planName}) is now past_due. Stripe will retry; they keep access during dunning.`
      );
      return;
    }

    case "customer.subscription.deleted": {
      await notifySlack(
        `🚫 Subscription canceled: ${company} (${planName}). Tenant paused.`
      );
      return;
    }

    default:
      return;
  }
}

/**
 * Express handler for POST /webhooks/stripe.
 * Must be mounted with express.raw({ type: "application/json" }) BEFORE any
 * JSON body parser — signature verification needs the exact raw payload.
 */
export async function stripeWebhookHandler(
  req: Request,
  res: Response
): Promise<void> {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    res.status(503).json({ error: "Stripe webhook not configured" });
    return;
  }
  if (!isSupabaseConfigured()) {
    res.status(503).json({ error: "Database not configured" });
    return;
  }

  const signature = req.headers["stripe-signature"];
  if (typeof signature !== "string") {
    res.status(400).json({ error: "Missing stripe-signature header" });
    return;
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      req.body as Buffer,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.warn("[stripe-webhook] signature verification failed:", err);
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  // Idempotency: the event id is the primary key, so a duplicate delivery
  // fails the insert and is acknowledged without reprocessing.
  const { error: insertErr } = await supabaseAdmin
    .from("billing_events")
    .insert({
      id: event.id,
      type: event.type,
      payload: { livemode: event.livemode, created: event.created },
    });
  if (insertErr) {
    if (insertErr.code === "23505") {
      res.json({ received: true, duplicate: true });
      return;
    }
    console.error("[stripe-webhook] failed to record event:", insertErr);
    res.status(500).json({ error: "Failed to record event" });
    return;
  }

  try {
    const update = await deriveTenantUpdate(event, supabaseDeps);

    if (update) {
      const { error: updateErr } = await supabaseAdmin
        .from("tenants")
        .update(update.fields)
        .eq("id", update.tenantId);
      if (updateErr) throw new Error(updateErr.message);

      await supabaseAdmin
        .from("billing_events")
        .update({ tenant_id: update.tenantId })
        .eq("id", event.id);

      console.log(
        `[stripe-webhook] ${event.type} → tenant ${update.tenantId} updated`
      );

      setImmediate(() => {
        runBillingAutomations(event, update.tenantId).catch((err) =>
          console.error("[stripe-webhook] automation error:", err)
        );
      });

      // Dunning notice — after the ack so Stripe isn't kept waiting.
      // No-op when email isn't configured.
      if (event.type === "invoice.payment_failed") {
        const tenantId = update.tenantId;
        setImmediate(async () => {
          try {
            const { data } = await supabaseAdmin
              .from("tenants")
              .select("company_name, contact_email")
              .eq("id", tenantId)
              .single();
            if (!data?.contact_email) return;
            const baseUrl =
              process.env.APP_URL ?? "https://myersdigitalconsulting.com";
            const mail = buildPaymentFailedEmail({
              companyName: data.company_name as string,
              billingUrl: `${baseUrl}/portal/billing`,
            });
            await sendEmail({
              to: data.contact_email as string,
              subject: mail.subject,
              html: mail.html,
            });
          } catch (err) {
            console.error("[stripe-webhook] payment-failed email error:", err);
          }
        });
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error(`[stripe-webhook] processing error for ${event.type}:`, err);
    // Remove the idempotency record so Stripe's retry can reprocess
    await supabaseAdmin.from("billing_events").delete().eq("id", event.id);
    res.status(500).json({ error: "Event processing failed" });
  }
}
