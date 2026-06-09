// Plan catalog for the AIOS subscription.
// Mirrors the live Stripe products: Foundation / Operator / Architect.
// Plan keys match the values stored in tenants.plan.

export type PlanKey = "starter" | "growth" | "full_stack";
export type BillingInterval = "month" | "year";

export interface PlanDefinition {
  key: PlanKey;
  name: string;
  tagline: string;
  /** USD cents */
  monthlyAmount: number;
  /** USD cents */
  annualAmount: number;
  features: string[];
  highlighted?: boolean;
}

export const PLAN_KEYS: PlanKey[] = ["starter", "growth", "full_stack"];

export const PLANS: Record<PlanKey, PlanDefinition> = {
  starter: {
    key: "starter",
    name: "AIOS — Foundation",
    tagline: "Entry tier. Tailored SOPs and an intake-driven operations architecture.",
    monthlyAmount: 250_000,
    annualAmount: 2_500_000,
    features: [
      "Client-specific SOP library",
      "Intake-driven operations architecture",
      "Core department coverage",
      "Ongoing portal access",
    ],
  },
  growth: {
    key: "growth",
    name: "AIOS — Operator",
    tagline: "Mid tier. Expanded department coverage and priority generation.",
    monthlyAmount: 500_000,
    annualAmount: 5_000_000,
    features: [
      "Everything in Foundation",
      "Expanded department coverage",
      "Deeper automation recommendations",
      "Priority SOP generation",
    ],
    highlighted: true,
  },
  full_stack: {
    key: "full_stack",
    name: "AIOS — Architect",
    tagline: "Top tier. Full operations architecture with white-glove support.",
    monthlyAmount: 750_000,
    annualAmount: 7_500_000,
    features: [
      "Everything in Operator",
      "Full operations architecture",
      "All departments activated",
      "White-glove implementation support",
    ],
  },
};

export function isPlanKey(value: unknown): value is PlanKey {
  return typeof value === "string" && PLAN_KEYS.includes(value as PlanKey);
}

export function isBillingInterval(value: unknown): value is BillingInterval {
  return value === "month" || value === "year";
}

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

// ─── API response shapes ──────────────────────────────────────────────────────

export interface BillingInvoiceSummary {
  id: string;
  number: string | null;
  status: string | null;
  /** USD cents */
  total: number;
  currency: string;
  created: number;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
}

export interface BillingStatusResponse {
  configured: boolean;
  plan: PlanKey | string | null;
  paid: boolean;
  subscriptionStatus: string | null;
  billingInterval: BillingInterval | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasStripeCustomer: boolean;
  invoices: BillingInvoiceSummary[];
}

export interface CheckoutSessionResponse {
  url: string;
}

export interface PortalSessionResponse {
  url: string;
}
