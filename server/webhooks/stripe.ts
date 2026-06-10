import type { Request, Response } from "express";
import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "../lib/stripe.ts";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabase-admin.ts";
import { isPlanKey, isBillingInterval } from "../../shared/billing.ts";
import { sendEmail, buildPaymentFailedEmail } from "../lib/email.ts";

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
