-- Applied to aios-platform-prod (biiusbjjuulgomzwtjzz) on 2026-06-10
-- as migration "agent_runs_tenant_id".

-- Tenant attribution for agent runs (client-facing activity feed).
-- Null for business-internal runs (scheduler, ops webhooks).
alter table public.agent_runs
  add column if not exists tenant_id uuid references public.tenants(id) on delete set null;

create index if not exists agent_runs_tenant_created_idx
  on public.agent_runs (tenant_id, created_at desc);
