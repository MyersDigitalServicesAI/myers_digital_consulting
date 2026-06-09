# AIOS Portal — Stripe Billing

Subscription billing for the AIOS client portal, built on Stripe Checkout,
the Stripe customer portal, and signature-verified webhooks.

## Plans

Plan keys stored in `tenants.plan` map to the live Stripe products:

| Plan key     | Stripe product    | Monthly  | Annual (2 months free) |
| ------------ | ----------------- | -------- | ---------------------- |
| `starter`    | AIOS — Foundation | $2,500   | $25,000                |
| `growth`     | AIOS — Operator   | $5,000   | $50,000                |
| `full_stack` | AIOS — Architect  | $7,500   | $75,000                |

Display data lives in `shared/billing.ts`; Stripe price IDs are resolved in
`server/lib/billing-plans.ts` (live IDs by default, overridable per
environment with `STRIPE_PRICE_<PLAN>_<INTERVAL>` env vars — use test-mode
price IDs in development).

## Payment flow

1. A client signs in to the portal and opens **Billing** (`/portal/billing`).
2. `POST /api/portal/billing/checkout` creates (or reuses) a Stripe customer
   tied to the tenant (`metadata.tenant_id`) and returns a Checkout URL.
3. Stripe redirects back to `/portal/billing?checkout=success|cancelled`.
4. The `checkout.session.completed` webhook marks the tenant `paid`, stores
   the customer/subscription IDs, and records plan + interval.
5. Renewals, failures, plan changes, and cancellations arrive as webhooks and
   are synced onto the tenant row.

Payment methods, plan changes, invoices, and cancellation are self-served
through the Stripe customer portal (`POST /api/portal/billing/portal-session`).

## API

All routes require a portal JWT (Supabase auth) except the webhook.

| Route                                      | Purpose                                  |
| ------------------------------------------ | ---------------------------------------- |
| `POST /api/portal/billing/checkout`        | Start Checkout (`{plan, interval}`)      |
| `POST /api/portal/billing/portal-session`  | Open the Stripe customer portal          |
| `GET /api/portal/billing/status`           | Subscription state + recent invoices     |
| `POST /webhooks/stripe`                    | Stripe webhook (signature-verified)      |

## Webhook handling

`server/webhooks/stripe.ts` — mounted with `express.raw` **before** the JSON
body parser so signatures verify against the exact payload.

| Event                           | Effect on tenant                                            |
| ------------------------------- | ----------------------------------------------------------- |
| `checkout.session.completed`    | `paid=true`, store IDs, set plan/interval, status `active`  |
| `customer.subscription.updated` | Sync status, period end, cancel-at-period-end, paid flag    |
| `customer.subscription.deleted` | `paid=false`, status `canceled`, tenant paused              |
| `invoice.payment_failed`        | Status `past_due` (access kept during dunning)              |
| `invoice.paid`                  | `paid=true`, status `active`                                |

Idempotency: every event ID is inserted into `billing_events` (primary key);
duplicate deliveries are acknowledged without reprocessing. Processing
failures delete the record and return 500 so Stripe retries.

## Database

Migration: `supabase/migrations/20260609_add_billing.sql` (already applied to
`aios-platform-prod`). Adds to `tenants`: `subscription_status`,
`billing_interval`, `current_period_end`, `cancel_at_period_end` (plus
indexes on the Stripe IDs), and creates `billing_events` (RLS enabled, no
policies — service-role access only).

## Environment

| Variable                 | Required | Notes                                       |
| ------------------------ | -------- | ------------------------------------------- |
| `STRIPE_SECRET_KEY`      | yes      | `sk_live_...` in production                 |
| `STRIPE_WEBHOOK_SECRET`  | yes      | From the webhook endpoint in the dashboard  |
| `STRIPE_AUTOMATIC_TAX`   | no       | `"true"` to enable Stripe Tax at checkout   |
| `STRIPE_PRICE_*`         | no       | Price ID overrides (test mode)              |
| `APP_URL`                | yes      | Base URL for checkout redirect/return URLs  |

## Go-live checklist

- [ ] Set `STRIPE_SECRET_KEY` on the production server (Railway).
- [ ] Create the webhook endpoint in the Stripe dashboard pointing to
      `https://<production-server>/webhooks/stripe` with the five events
      listed above; set `STRIPE_WEBHOOK_SECRET` from its signing secret.
      Note: the webhook must hit the **Express server** (Railway), not the
      static Vercel deployment.
- [ ] Enable the customer portal at
      https://dashboard.stripe.com/settings/billing/portal (allow payment
      method updates, plan switches between the three AIOS prices, and
      cancellation).
- [ ] Verify `GET /health` reports `"stripe": "configured"`.
- [ ] Run a live test: provision a tenant, subscribe with a real card, confirm
      the tenant flips to `paid`, then refund/cancel from the dashboard.
- [ ] (Optional) Enable Stripe Tax and set `STRIPE_AUTOMATIC_TAX=true`.

## Local development

Use test-mode keys plus price overrides, and forward webhooks:

```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
# copy the whsec_... it prints into STRIPE_WEBHOOK_SECRET
```

Run tests with `pnpm test` (webhook event mapping, plan resolution, input
validation).
