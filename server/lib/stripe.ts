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
      // Pin to the version this SDK bundles and types against, so the account's
      // dashboard default can't shift the webhook payload shape out from under
      // the compatibility shims in webhooks/stripe.ts. Keep this in sync with
      // the SDK's bundled ApiVersion on upgrades.
      apiVersion: "2026-05-27.dahlia",
      appInfo: { name: "Myers Digital AIOS Portal" },
    });
  }
  return client;
}

/** Test-only: reset the cached client so env changes take effect. */
export function resetStripeClient(): void {
  client = null;
}
