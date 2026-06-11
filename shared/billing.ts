// Plan catalog for the AIOS subscription.
// Mirrors the public founding-client offer on the website (Home.tsx #pricing)
// and the live Stripe products: AIOS — Starter / Growth / Full Stack.
// Plan keys match the values stored in tenants.plan.

export type PlanKey = "starter" | "growth" | "full_stack";
export type BillingInterval = "month" | "year";

export interface PlanDefinition {
  key: PlanKey;
  name: string;
  tagline: string;
  /** Monthly subscription, USD cents */
  monthlyAmount: number;
  /** One-time setup fee charged at first checkout, USD cents */
  setupAmount: number;
  features: string[];
  highlighted?: boolean;
}

export const PLAN_KEYS: PlanKey[] = ["starter", "growth", "full_stack"];

export const PLANS: Record<PlanKey, PlanDefinition> = {
  starter: {
    key: "starter",
    name: "AIOS — Starter",
    tagline:
      "Owners who want visibility and automation without the full content machine.",
    monthlyAmount: 149_700,
    setupAmount: 350_000,
    features: [
      "Director + CRM + Analytics",
      "Meeting Transcript Agent",
      "GEO/SEO Auditor",
      "Bookkeeping Categorizer",
    ],
  },
  growth: {
    key: "growth",
    name: "AIOS — Growth",
    tagline: "Businesses generating leads and content who want it all automated.",
    monthlyAmount: 299_700,
    setupAmount: 500_000,
    features: [
      "Everything in Starter",
      "Marketing + Content Calendar",
      "Social Media Manager",
      "Meta Ads + Transcript Miner",
      "Newsletter Writer + Ad Builder",
    ],
    highlighted: true,
  },
  full_stack: {
    key: "full_stack",
    name: "AIOS — Full Stack",
    tagline:
      "Agency owners and high-volume service businesses who want total autonomy.",
    monthlyAmount: 499_700,
    setupAmount: 750_000,
    features: [
      "All 22 agents active",
      "Complete automation stack",
      "All platforms wired",
      "Full Zapier + GHL integration",
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
