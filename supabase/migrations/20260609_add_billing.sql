-- Applied to aios-platform-prod (biiusbjjuulgomzwtjzz) on 2026-06-09
-- as migration "add_billing_columns_and_events".

-- Billing: subscription lifecycle fields on tenants
alter table public.tenants
  add column if not exists subscription_status text,
  add column if not exists billing_interval text
    check (billing_interval is null or billing_interval in ('month', 'year')),
  add column if not exists current_period_end timestamptz,
  add column if not exists cancel_at_period_end boolean not null default false;

create index if not exists tenants_stripe_customer_id_idx
  on public.tenants (stripe_customer_id);
create index if not exists tenants_stripe_subscription_id_idx
  on public.tenants (stripe_subscription_id);

-- Billing: processed Stripe webhook events (idempotency + audit trail)
create table if not exists public.billing_events (
  id text primary key,                -- Stripe event id (evt_...)
  type text not null,
  tenant_id uuid references public.tenants(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now()
);

create index if not exists billing_events_tenant_id_idx
  on public.billing_events (tenant_id);

-- Service-role access only (no policies defined)
alter table public.billing_events enable row level security;
