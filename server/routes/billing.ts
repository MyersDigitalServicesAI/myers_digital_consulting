import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase-admin.ts";
import { getStripe, isStripeConfigured } from "../lib/stripe.ts";
import { resolvePriceId } from "../lib/billing-plans.ts";
import { portalAuth, type PortalRequest } from "../middleware/portal-auth.ts";
import type {
  BillingInvoiceSummary,
  BillingStatusResponse,
  PlanKey,
} from "../../shared/billing.ts";
import type { Tenant } from "../../shared/portal.types.ts";

// The public offer is monthly-only (founding pricing) with a one-time setup
// fee — there is no annual interval at checkout.
export const checkoutSchema = z.object({
  plan: z.enum(["starter", "growth", "full_stack"]),
});

function appUrl(): string {
  return (process.env.APP_URL ?? "https://myersdigitalconsulting.com").replace(
    /\/$/,
    ""
  );
}

async function getTenant(tenantId: string): Promise<Tenant | null> {
  const { data } = await supabaseAdmin
    .from("tenants")
    .select("*")
    .eq("id", tenantId)
    .single();
  return (data as Tenant | null) ?? null;
}

/**
 * Find or create the Stripe customer for a tenant, persisting the id.
 * tenant_id metadata is the durable link back to our database.
 */
async function ensureStripeCustomer(tenant: Tenant): Promise<string> {
  const stripe = getStripe();

  if (tenant.stripe_customer_id) {
    try {
      const existing = await stripe.customers.retrieve(tenant.stripe_customer_id);
      if (!existing.deleted) return tenant.stripe_customer_id;
    } catch {
      // stale id (e.g. test-mode id against live key) — create a fresh customer
    }
  }

  const customer = await stripe.customers.create({
    name: tenant.company_name,
    email: tenant.contact_email ?? undefined,
    metadata: { tenant_id: tenant.id },
  });

  await supabaseAdmin
    .from("tenants")
    .update({ stripe_customer_id: customer.id })
    .eq("id", tenant.id);

  return customer.id;
}

export function tenantHasActiveSubscription(tenant: Tenant): boolean {
  return Boolean(
    tenant.stripe_subscription_id &&
      ["active", "trialing", "past_due"].includes(tenant.subscription_status ?? "")
  );
}

/**
 * Create a Stripe Checkout session for a tenant: monthly subscription plus the
 * one-time setup fee. The setup fee is skipped for returning customers (a
 * previous subscription means their AIOS was already built).
 */
export async function createCheckoutSessionUrl(
  tenant: Tenant,
  plan: PlanKey
): Promise<string | null> {
  const stripe = getStripe();
  const customerId = await ensureStripeCustomer(tenant);
  const metadata = { tenant_id: tenant.id, plan, interval: "month" };
  const isReturningCustomer = Boolean(tenant.stripe_subscription_id);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      { price: resolvePriceId(plan, "month"), quantity: 1 },
      ...(isReturningCustomer
        ? []
        : [{ price: resolvePriceId(plan, "setup"), quantity: 1 }]),
    ],
    subscription_data: { metadata },
    metadata,
    allow_promotion_codes: true,
    billing_address_collection: "required",
    ...(process.env.STRIPE_AUTOMATIC_TAX === "true"
      ? {
          automatic_tax: { enabled: true },
          customer_update: { address: "auto" as const },
        }
      : {}),
    success_url: `${appUrl()}/portal/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}/portal/billing?checkout=cancelled`,
  });

  return session.url ?? null;
}

export function createBillingRouter(): Router {
  const router = Router();

  // All billing endpoints require an authenticated portal member
  router.use(portalAuth as never);

  // POST /api/portal/billing/checkout — start a subscription via Stripe Checkout
  router.post("/checkout", async (req, res) => {
    if (!isStripeConfigured()) {
      res.status(503).json({ error: "Billing not configured" });
      return;
    }

    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid plan" });
      return;
    }
    const { plan } = parsed.data;

    const pr = req as PortalRequest;
    const tenant = await getTenant(pr.portalTenantId);
    if (!tenant) {
      res.status(404).json({ error: "Tenant not found" });
      return;
    }

    if (tenantHasActiveSubscription(tenant)) {
      res.status(409).json({
        error:
          "An active subscription already exists. Use the billing portal to change plans.",
      });
      return;
    }

    try {
      const url = await createCheckoutSessionUrl(tenant, plan);
      if (!url) {
        res.status(502).json({ error: "Stripe did not return a checkout URL" });
        return;
      }
      res.json({ url });
    } catch (err) {
      console.error("[billing] checkout error:", err);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // POST /api/portal/billing/portal-session — Stripe customer portal
  router.post("/portal-session", async (req, res) => {
    if (!isStripeConfigured()) {
      res.status(503).json({ error: "Billing not configured" });
      return;
    }

    const pr = req as PortalRequest;
    const tenant = await getTenant(pr.portalTenantId);
    if (!tenant?.stripe_customer_id) {
      res.status(404).json({ error: "No billing account yet — subscribe first" });
      return;
    }

    try {
      const session = await getStripe().billingPortal.sessions.create({
        customer: tenant.stripe_customer_id,
        return_url: `${appUrl()}/portal/billing`,
      });
      res.json({ url: session.url });
    } catch (err) {
      console.error("[billing] portal-session error:", err);
      res.status(500).json({ error: "Failed to create billing portal session" });
    }
  });

  // GET /api/portal/billing/status — subscription state + recent invoices
  router.get("/status", async (req, res) => {
    const pr = req as PortalRequest;
    const tenant = await getTenant(pr.portalTenantId);
    if (!tenant) {
      res.status(404).json({ error: "Tenant not found" });
      return;
    }

    let invoices: BillingInvoiceSummary[] = [];
    if (isStripeConfigured() && tenant.stripe_customer_id) {
      try {
        const list = await getStripe().invoices.list({
          customer: tenant.stripe_customer_id,
          limit: 12,
        });
        invoices = list.data.map((inv) => ({
          id: inv.id ?? "",
          number: inv.number ?? null,
          status: inv.status ?? null,
          total: inv.total,
          currency: inv.currency,
          created: inv.created,
          hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
          invoicePdf: inv.invoice_pdf ?? null,
        }));
      } catch (err) {
        console.error("[billing] invoice list error:", err);
      }
    }

    const response: BillingStatusResponse = {
      configured: isStripeConfigured(),
      plan: tenant.plan,
      paid: tenant.paid,
      subscriptionStatus: tenant.subscription_status,
      billingInterval: tenant.billing_interval,
      currentPeriodEnd: tenant.current_period_end,
      cancelAtPeriodEnd: tenant.cancel_at_period_end,
      hasStripeCustomer: Boolean(tenant.stripe_customer_id),
      invoices,
    };
    res.json(response);
  });

  return router;
}
