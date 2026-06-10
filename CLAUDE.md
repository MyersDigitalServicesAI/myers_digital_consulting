# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Myers Digital Consulting's full-stack app: a marketing site + multi-tenant AIOS client portal (React) and an Express server that hosts an Anthropic-powered multi-agent system ("AIOS"), webhook endpoints, Stripe billing, and cron automations. The `aios/` directory holds the agents' system prompts (SKILL.md files) and business knowledge — it is content consumed at runtime, not just docs.

## Commands

Package manager is **pnpm** (pinned via `packageManager` in package.json). Node 22 is required (`.node-version`) — supabase-js needs native WebSocket; keep `.node-version`, CI, and Railway in sync.

```bash
pnpm install
pnpm dev          # Vite dev server (client only, port 3000)
npx tsx server/index.ts   # run the Express server directly (no dev script for it)
pnpm check        # typecheck (tsc --noEmit)
pnpm test         # vitest run (server/**/*.test.ts and shared/**/*.test.ts only)
pnpm vitest run server/routes/billing.test.ts   # single test file
pnpm build        # vite build (client → dist/public) + esbuild bundle (server → dist/index.js)
pnpm start        # production server (serves API + built client)
pnpm format       # prettier --write .
```

CI (`.github/workflows/ci.yml`) runs `pnpm check`, `pnpm test`, `pnpm build` on every PR — all three must pass.

## Architecture

One Express 5 process serves everything in production: static client from `dist/public`, portal API, webhooks, and the cron scheduler.

```
client/src/        React 19 + Vite + wouter + Tailwind 4 + shadcn/ui (components/ui/)
server/            Express 5, ESM, imports use explicit .ts extensions
  agents/          Anthropic agent system (see below)
  routes/          /api/portal/* (Supabase JWT auth) and /api/portal/billing/*
  webhooks/        /webhooks/* — external entry points that dispatch tasks to agents
  scheduler/       node-cron jobs that run agents on a schedule
  middleware/      portal-auth.ts (Supabase JWT → tenant/role), admin auth via PORTAL_ADMIN_SECRET
  lib/             supabase-admin (service role), stripe, billing-plans, email (Resend; no-op when unconfigured)
shared/            Types/constants used by both client and server (plan catalog in billing.ts)
aios/              Agent system prompts (skills/**/SKILL.md), SOPs, business knowledge
aios-template/     Sanitized AIOS template for client deployments
supabase/migrations/  SQL migrations (applied manually to the remote project)
docs/BILLING.md    Stripe billing design — read before touching billing code
```

Path aliases: `@` → `client/src`, `@shared` → `shared` (configured in both vite.config.ts and vitest.config.ts).

### Agent system (server/agents/)

- `framework/base-agent.ts` — `BaseAgent` runs an Anthropic tool-use loop (max 15 iterations, default model `claude-sonnet-4-6`). Each agent's **system prompt is loaded from `aios/skills/<skillPath>/SKILL.md` at runtime** — editing a SKILL.md changes agent behavior without code changes.
- `director.ts` — Director agent (`claude-opus-4-8`) with a `route_to_agent` tool that delegates to specialist agents via a registry. Module/custom agents self-register by calling `registerAgent()` at import time, so **importing `server/agents/index.ts` is what populates the registry** — webhooks and the scheduler both do this. New agents must be added to the enum in director.ts's `route_to_agent` tool, exported from `agents/index.ts`, and given a SKILL.md.
- `framework/tools/` — shared tool implementations (Notion, Zapier webhooks, GHL, social APIs) registered onto agents.
- Agents write decisions/memory to Notion and fire Zapier webhooks for execution; env vars for all integrations are documented in `.env.example`.

### Request flow gotchas

- The Stripe webhook (`/webhooks/stripe`) is mounted with `express.raw` **before** `express.json()` in `server/index.ts` — signature verification needs the raw body. Don't reorder middleware.
- All other `/webhooks/*` routes require the `AIOS_WEBHOOK_SECRET` shared secret (`x-aios-secret` header or `?secret=`), enforced by `server/middleware/webhook-auth.ts`. Production fails closed if the env var is unset; dev allows unauthenticated calls with a warning.
- Agent-dispatching webhooks respond immediately and run agents via `setImmediate` (callers like GHL/Zapier expect fast acks).
- The scheduler starts unless `AIOS_SCHEDULER=disabled` — keep it disabled in dev/test or cron jobs will call the Anthropic API.
- Every `BaseAgent.run()` is recorded to the `agent_runs` table (cost, tokens, success/error) — fire-and-forget, skipped when Supabase isn't configured.
- Agent spend is budget-capped: `AIOS_MAX_RUN_COST_USD` (default $5) stops a runaway tool loop mid-run; `AIOS_DAILY_BUDGET_USD` (default $50, UTC, computed from `agent_runs`) refuses new runs once crossed. System prompts and the conversation prefix are prompt-cached (`cache_control`) across loop iterations. `AIOS_DIRECTOR_MODEL` overrides the Director's model (default `claude-opus-4-8`).

### Portal & billing

- Auth: Supabase (client uses `VITE_SUPABASE_*` anon key; server uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS). `portalAuth` middleware resolves JWT → user → tenant membership.
- Subscription enforcement: content routes (`/sops`, `/workspace-status`, `/onboarding/submit`) also pass through `requireActiveTenant`, which returns 402 for `paused` tenants (the Stripe webhook sets `status: "paused"` on cancellation). `/me` and `/billing/*` stay accessible so a lapsed client can re-subscribe; `PortalGuard` redirects paused tenants to `/portal/billing`.
- Tenancy: `tenants` table drives portal state (`status`, `plan`, `paid`, subscription fields). Stripe webhook events are recorded in `billing_events` for idempotency.
- Plan display data lives in `shared/billing.ts`; Stripe price IDs resolve in `server/lib/billing-plans.ts` (live IDs by default, override with `STRIPE_PRICE_<PLAN>_<INTERVAL>` env vars for test mode).
- Client routes under `/portal/*` are guarded by `PortalGuard` (see `client/src/App.tsx`). `/portal/admin` is the operator console — gated by `PORTAL_ADMIN_SECRET` (entered in the UI, sent as `x-admin-secret`), not Supabase auth.
- Transactional email (`server/lib/email.ts`, Resend REST API): client invites on admin provision, payment-failed dunning from the Stripe webhook, SOPs-ready notification after intake generation. Every send is a graceful no-op when `RESEND_API_KEY`/`EMAIL_FROM` are unset.

### Deployment

- **Railway** runs the full server (`railway.toml`: build via pnpm, healthcheck `/health`).
- **Vercel** and **GitHub Pages** (`.github/workflows/deploy.yml`) serve static client-only builds — server features (portal API, webhooks, agents) only work on Railway.

## Conventions

- ESM everywhere (`"type": "module"`); server-side relative imports include the `.ts` extension (required for tsx/esbuild).
- pnpm has a patched dependency (`patches/wouter@3.7.1.patch`) and version overrides in package.json — don't remove them casually.
- Prettier is the formatter (`.prettierrc`); no ESLint config exists.
- `aios/CLAUDE.md` and `aios-template/CLAUDE.md` are runtime instructions for the AIOS Director agent product, **not** guidance for working in this repo.
- Supabase migrations in `supabase/migrations/` are applied manually to the remote project (`aios-platform-prod`); migration files note when/where they were applied. `00000000000000_baseline.sql` is the full schema as deployed (idempotent) — to rebuild an environment, run it first, then the dated migrations except `20260609_add_billing.sql` (already folded into the baseline).
