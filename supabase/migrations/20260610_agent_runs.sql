-- Applied to aios-platform-prod (biiusbjjuulgomzwtjzz) on 2026-06-10
-- as migration "add_agent_runs".

-- Audit trail for every BaseAgent execution (webhooks, scheduler, portal
-- SOP generation). Written fire-and-forget by server/agents/framework/
-- base-agent.ts; powers cost tracking and failure investigation.
create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent text not null,
  model text not null,
  task text,
  success boolean not null,
  error text,
  output_preview text,
  iterations integer,
  tool_call_count integer not null default 0,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cost_usd numeric(10, 6) not null default 0,
  duration_ms integer,
  created_at timestamptz not null default now()
);

create index if not exists agent_runs_agent_created_idx
  on public.agent_runs (agent, created_at desc);
create index if not exists agent_runs_created_idx
  on public.agent_runs (created_at desc);

-- Service-role access only (no policies defined)
alter table public.agent_runs enable row level security;
