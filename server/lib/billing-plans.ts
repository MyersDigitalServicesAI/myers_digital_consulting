import type { PlanKey } from "../../shared/billing.ts";

/** "month" = the recurring subscription price; "setup" = the one-time setup fee. */
export type PriceKind = "month" | "setup";

// Live price IDs from the Myers Digital Consulting Stripe account
// (products: AIOS — Starter / Growth / Full Stack, founding-client pricing).
// Override per-environment with STRIPE_PRICE_<PLAN>_<KIND> env vars,
// e.g. STRIPE_PRICE_STARTER_MONTH / STRIPE_PRICE_STARTER_SETUP for test mode.
const DEFAULT_PRICE_IDS: Record<PlanKey, Record<PriceKind, string>> = {
  starter: {
    month: "price_1ThAvcQcX9Psp3epVwqB1Yip", // $1,497/mo
    setup: "price_1ThAveQcX9Psp3epFn4t7RyA", // $3,500 one-time
  },
  growth: {
    month: "price_1ThAvfQcX9Psp3ep1OTZ5ATc", // $2,997/mo
    setup: "price_1ThAvgQcX9Psp3epxyQfiO4P", // $5,000 one-time
  },
  full_stack: {
    month: "price_1ThAviQcX9Psp3ep1CLoRYda", // $4,997/mo
    setup: "price_1ThAvjQcX9Psp3epWmkeCpiZ", // $7,500 one-time
  },
};

export function resolvePriceId(plan: PlanKey, kind: PriceKind): string {
  const envKey = `STRIPE_PRICE_${plan.toUpperCase()}_${kind.toUpperCase()}`;
  return process.env[envKey] || DEFAULT_PRICE_IDS[plan][kind];
}
