-- BASELINE — full portal schema as it exists in aios-platform-prod
-- (biiusbjjuulgomzwtjzz), dumped from the live database on 2026-06-10.
--
-- This file is ALREADY APPLIED in production (the tables predate versioned
-- migrations in this repo). It exists so the database can be rebuilt in a
-- new environment: run this first, then the dated migrations EXCEPT
-- 20260609_add_billing.sql (its columns/tables are already included below).
-- Every statement is idempotent, so running it against prod is a no-op.

-- ─── Tenants ──────────────────────────────────────────────────────────────────

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  slug text not null unique,
  status text not null default 'onboarding'
    check (status in ('onboarding', 'active', 'paused')),
  plan text,
  stripe_customer_id text,
  stripe_subscription_id text,
  paid boolean not null default false,
  approved_by_admin boolean not null default false,
  created_at timestamptz not null default now(),
  contact_email text,
  contact_name text,
  -- Billing lifecycle (added 2026-06-09, see docs/BILLING.md)
  subscription_status text,
  billing_interval text
    check (billing_interval is null or billing_interval in ('month', 'year')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false
);

create index if not exists tenants_stripe_customer_id_idx
  on public.tenants (stripe_customer_id);
create index if not exists tenants_stripe_subscription_id_idx
  on public.tenants (stripe_subscription_id);

-- ─── Membership (Supabase auth user → tenant) ─────────────────────────────────

create table if not exists public.tenant_members (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'client',
  primary key (tenant_id, user_id)
);

-- RLS helper: tenant ids the current auth user belongs to
create or replace function public.my_tenant_ids()
returns setof uuid
language sql
stable security definer
as $$
  select tenant_id from public.tenant_members where user_id = auth.uid()
$$;

-- ─── Onboarding ───────────────────────────────────────────────────────────────

create table if not exists public.onboarding_links (
  token text primary key,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  expires_at timestamptz,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists links_tenant_idx
  on public.onboarding_links (tenant_id);

create table if not exists public.intake_responses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  departments text[] not null default '{}'::text[],
  submitted_at timestamptz not null default now()
);

create index if not exists intake_tenant_idx
  on public.intake_responses (tenant_id);

-- ─── Generated deliverables ───────────────────────────────────────────────────

create table if not exists public.company_profiles (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  summary text,
  positioning text,
  biggest_leverage text,
  generated_at timestamptz not null default now()
);

create table if not exists public.sops (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  department text not null,
  title text,
  body jsonb not null,
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'failed')),
  generated_at timestamptz not null default now()
);

create index if not exists sops_tenant_idx on public.sops (tenant_id);

create table if not exists public.workspace_status (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  notion_workspace boolean not null default false,
  databases_built boolean not null default false,
  ghl_configured boolean not null default false,
  zapier_core_active boolean not null default false,
  agents_configured boolean not null default false,
  voice_training_complete boolean not null default false,
  system_test_passed boolean not null default false,
  go_live_confirmed boolean not null default false,
  intake_submitted_at timestamptz,
  sops_generated_at timestamptz,
  updated_at timestamptz not null default now()
);

-- ─── Discovery engine (interview → blueprint → workflows → reports) ──────────

create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  phase integer not null default 1 check (phase in (1, 2)),
  status text not null default 'active'
    check (status in ('active', 'complete', 'analyzing', 'ready_for_s2')),
  messages jsonb not null default '[]'::jsonb,
  intake_snapshot jsonb,
  pre_analysis jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (tenant_id, phase)
);

create index if not exists interview_sessions_tenant
  on public.interview_sessions (tenant_id, phase);

create table if not exists public.os_blueprints (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique references public.tenants(id) on delete cascade,
  blueprint jsonb not null,
  generated_at timestamptz default now()
);

create table if not exists public.workflow_maps (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique references public.tenants(id) on delete cascade,
  workflows jsonb not null default '[]'::jsonb,
  process_registry jsonb not null default '[]'::jsonb,
  summary jsonb not null default '{}'::jsonb,
  generated_at timestamptz default now()
);

create table if not exists public.engine_reports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  engine text not null
    check (engine in ('acquire', 'convert', 'deliver', 'retain', 'grow', 'operate')),
  report jsonb not null,
  generated_at timestamptz default now(),
  unique (tenant_id, engine)
);

create index if not exists engine_reports_tenant_engine
  on public.engine_reports (tenant_id, engine);

-- ─── Billing events (Stripe webhook idempotency + audit) ─────────────────────

create table if not exists public.billing_events (
  id text primary key,
  type text not null,
  tenant_id uuid references public.tenants(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now()
);

create index if not exists billing_events_tenant_id_idx
  on public.billing_events (tenant_id);

-- ─── Row-level security ──────────────────────────────────────────────────────
-- The server uses the service-role key (bypasses RLS). These policies exist
-- so the browser anon-key client can only ever read its own tenant's rows.
-- Tables without policies (tenant_members, onboarding_links, billing_events)
-- are RLS-enabled with no policies = service-role only.

alter table public.tenants enable row level security;
alter table public.tenant_members enable row level security;
alter table public.onboarding_links enable row level security;
alter table public.intake_responses enable row level security;
alter table public.company_profiles enable row level security;
alter table public.sops enable row level security;
alter table public.workspace_status enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.os_blueprints enable row level security;
alter table public.workflow_maps enable row level security;
alter table public.engine_reports enable row level security;
alter table public.billing_events enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'members read own tenant') then
    create policy "members read own tenant" on public.tenants
      for select using (id in (select my_tenant_ids()));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'members read own intake') then
    create policy "members read own intake" on public.intake_responses
      for select using (tenant_id in (select my_tenant_ids()));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'members read own profile') then
    create policy "members read own profile" on public.company_profiles
      for select using (tenant_id in (select my_tenant_ids()));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'members read own sops') then
    create policy "members read own sops" on public.sops
      for select using (tenant_id in (select my_tenant_ids()));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'tenant_member_read_own_status') then
    create policy "tenant_member_read_own_status" on public.workspace_status
      for select using (tenant_id in (
        select tenant_members.tenant_id from tenant_members
        where tenant_members.user_id = auth.uid()
      ));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'interview_sessions' and policyname = 'tenant_isolation') then
    create policy "tenant_isolation" on public.interview_sessions
      for select using (tenant_id in (select my_tenant_ids()));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'os_blueprints' and policyname = 'tenant_isolation') then
    create policy "tenant_isolation" on public.os_blueprints
      for select using (tenant_id in (select my_tenant_ids()));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'workflow_maps' and policyname = 'tenant_isolation') then
    create policy "tenant_isolation" on public.workflow_maps
      for select using (tenant_id in (select my_tenant_ids()));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'engine_reports' and policyname = 'tenant_isolation') then
    create policy "tenant_isolation" on public.engine_reports
      for select using (tenant_id in (select my_tenant_ids()));
  end if;
end $$;
