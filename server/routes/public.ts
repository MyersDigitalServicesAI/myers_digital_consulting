import { Router } from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabase-admin.ts";
import { isStripeConfigured } from "../lib/stripe.ts";
import {
  appUrl,
  createCheckoutSessionUrl,
  tenantHasActiveSubscription,
} from "./billing.ts";
import { FOUNDING_SPOTS } from "../../shared/billing.ts";
import type { Tenant } from "../../shared/portal.types.ts";

// Self-serve checkout from the public pricing section: visitor picks a plan,
// gives company + email, and goes straight to Stripe Checkout. The tenant is
// created up-front (unapproved, unpaid) so the checkout.session.completed
// webhook has a tenant_id to activate; payment is what flips approval and
// triggers the portal invite (see server/webhooks/stripe.ts).
export const publicCheckoutSchema = z.object({
  plan: z.enum(["starter", "growth", "full_stack"]),
  companyName: z.string().trim().min(2).max(120),
  contactName: z.string().trim().min(1).max(120).optional(),
  contactEmail: z.string().trim().email().max(254),
});

function makeSlug(companyName: string): string {
  const base = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${nanoid(6)}`;
}

// founding-spots is on the homepage, so cache the count briefly
let spotsCache: { at: number; taken: number } | null = null;
const SPOTS_CACHE_MS = 60_000;

export function createPublicRouter(): Router {
  const router = Router();

  // POST /api/public/checkout — start a subscription without a portal account
  router.post("/checkout", async (req, res) => {
    if (!isStripeConfigured() || !isSupabaseConfigured()) {
      res.status(503).json({ error: "Checkout is not available right now" });
      return;
    }

    const parsed = publicCheckoutSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Please provide a valid company name and email" });
      return;
    }
    const { plan, companyName, contactName } = parsed.data;
    const contactEmail = parsed.data.contactEmail.toLowerCase();

    try {
      // Reuse an existing unpaid tenant for this email (e.g. an abandoned
      // checkout or an admin-provisioned prospect) instead of duplicating.
      const { data: existing } = await supabaseAdmin
        .from("tenants")
        .select("*")
        .ilike("contact_email", contactEmail)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let tenant = (existing as Tenant | null) ?? null;
      if (tenant && tenantHasActiveSubscription(tenant)) {
        res.status(409).json({
          error:
            "This email already has an active subscription — sign in to the portal to manage it.",
        });
        return;
      }

      if (!tenant) {
        const { data: created, error: createErr } = await supabaseAdmin
          .from("tenants")
          .insert({
            company_name: companyName,
            slug: makeSlug(companyName),
            plan,
            contact_email: contactEmail,
            contact_name: contactName ?? null,
            // status defaults to "onboarding"; approved_by_admin stays false
            // until the Stripe webhook confirms payment.
          })
          .select()
          .single();
        if (createErr || !created) {
          throw new Error(createErr?.message ?? "Failed to create tenant");
        }
        tenant = created as Tenant;
      }

      const url = await createCheckoutSessionUrl(tenant, plan, {
        successUrl: `${appUrl()}/checkout/success`,
        cancelUrl: `${appUrl()}/#pricing`,
      });
      if (!url) {
        res.status(502).json({ error: "Stripe did not return a checkout URL" });
        return;
      }
      res.json({ url });
    } catch (err) {
      console.error("[public-checkout] error:", err);
      res.status(500).json({ error: "Failed to start checkout" });
    }
  });

  // GET /api/public/founding-spots — live founding-offer availability
  router.get("/founding-spots", async (_req, res) => {
    if (!isSupabaseConfigured()) {
      res.status(503).json({ error: "Not available" });
      return;
    }

    try {
      if (!spotsCache || Date.now() - spotsCache.at > SPOTS_CACHE_MS) {
        const { count, error } = await supabaseAdmin
          .from("tenants")
          .select("id", { count: "exact", head: true })
          .eq("paid", true);
        if (error) throw new Error(error.message);
        spotsCache = { at: Date.now(), taken: count ?? 0 };
      }
      const taken = spotsCache.taken;
      res.json({
        total: FOUNDING_SPOTS,
        taken,
        left: Math.max(0, FOUNDING_SPOTS - taken),
      });
    } catch (err) {
      console.error("[founding-spots] error:", err);
      res.status(500).json({ error: "Failed to fetch availability" });
    }
  });

  return router;
}
