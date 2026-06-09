import type { BillingInterval, PlanKey } from "../../shared/billing.ts";

// Live price IDs from the Myers Digital Consulting Stripe account
// (products: AIOS — Foundation / Operator / Architect).
// Override per-environment with STRIPE_PRICE_<PLAN>_<INTERVAL> env vars,
// e.g. STRIPE_PRICE_STARTER_MONTH for test mode.
const DEFAULT_PRICE_IDS: Record<PlanKey, Record<BillingInterval, string>> = {
  starter: {
    month: "price_1TcxeqQcX9Psp3ep5ZZ2B43E",
    year: "price_1TcxezQcX9Psp3epA3xXS3nR",
  },
  growth: {
    month: "price_1TcxezQcX9Psp3epJyBdLwQA",
    year: "price_1Tcxf0QcX9Psp3epVKS7otjJ",
  },
  full_stack: {
    month: "price_1Tcxf0QcX9Psp3eppc66tvRQ",
    year: "price_1Tcxf1QcX9Psp3epntVZ893Y",
  },
};

export function resolvePriceId(plan: PlanKey, interval: BillingInterval): string {
  const envKey = `STRIPE_PRICE_${plan.toUpperCase()}_${interval.toUpperCase()}`;
  return process.env[envKey] || DEFAULT_PRICE_IDS[plan][interval];
}
