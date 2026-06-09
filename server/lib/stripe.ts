import Stripe from "stripe";

let client: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    client = new Stripe(key, {
      appInfo: { name: "Myers Digital AIOS Portal" },
    });
  }
  return client;
}

/** Test-only: reset the cached client so env changes take effect. */
export function resetStripeClient(): void {
  client = null;
}
