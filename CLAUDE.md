# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Myers Digital Consulting's **AIOS** (AI Operating System): a multi-agent backend where Claude is the brain, Notion is the memory, Zapier is the hands, and GHL (GoHighLevel) is the revenue engine. A `Director` agent receives tasks (via HTTP webhooks or cron) and routes them to ~24 specialist agents (CRM, Finance, Marketing, etc.). A small React marketing site ships alongside it.

Note: there are two distinct layers with the same vocabulary. `aios/` is **documentation/specification** (Markdown SKILLs and SOPs, the design of the org). `server/agents/` is the **running TypeScript implementation**. The agents load their system prompts from the `aios/skills/**/SKILL.md` files at runtime — so the docs and the code are coupled.

## Commands

Package manager is **pnpm** (`packageManager: pnpm@10.26.0`).

```bash
pnpm install            # install
pnpm dev                # Vite dev server for the client only (no backend)
pnpm build              # vite build (client → dist/public) + esbuild bundle (server → dist/index.js)
pnpm start              # run the built server: node dist/index.js (serves API + static client)
pnpm check              # tsc --noEmit — the typecheck/lint gate (there is no eslint)
pnpm format             # prettier --write .

npx tsx server/agents/test-e2e.ts   # E2E suite over all 24 agents; writes aios-e2e-results.txt
```

There is no `pnpm test` script — run the E2E suite directly with `tsx` as above. It uses **mock Claude responses when `ANTHROPIC_API_KEY` is unset**, so it runs offline and is the fastest way to verify the agent wiring after a change.

To run the server in dev with the backend, build first or run `npx tsx server/index.ts`. Set `AIOS_SCHEDULER=disabled` to stop cron jobs from firing during local work.

## Architecture

### Agent runtime (`server/agents/`)

- **`framework/base-agent.ts`** — `BaseAgent` is the core. `run(task, context)` drives an agentic tool-use loop (max **15 iterations**) against the Anthropic SDK with `thinking: { type: "adaptive" }`. It loads its system prompt from `aios/skills/<skillPath>` (falls back to a generic prompt if the file is missing) and tracks token usage + estimated cost. Default model is `claude-sonnet-4-6`; the Director overrides to `claude-opus-4-8`.
- **`director.ts`** — `DirectorAgent` plus the **agent registry**. Specialist agents call `registerAgent(name, factory)` as an import side effect; the Director's `route_to_agent` tool looks them up by name and runs them. The `enum` of routable agents in `route_to_agent`'s schema must be kept in sync when adding/removing agents.
- **`modules/`** — the 8 executive module agents (crm, finance, marketing, operations, analytics, hr, legal, security). Each is ~20 lines: extend `BaseAgent`, point `skillPath` at the matching `aios/skills/modules/<x>/SKILL.md`, register tools, then `registerAgent(...)`.
- **`custom/`** — the specialist skill agents (transcript-miner, sales-call-coach, newsletter-writer, scroll-stopper-ad, bookkeeping, geo-seo-auditor, meeting-transcript, social-media-manager, meta/google-ads-manager, content-calendar, ad-performance, cost-breakdown, workspace-architect, aios-sales).
- **`framework/tools/`** — tool suites registered onto agents:
  - `standard.ts` → `registerStandardTools` = Notion (`notion_read`, `notion_write`, `log_decision`) + Zapier (`zapier_fire`, `notify_dustin`). Almost every agent gets these.
  - `ghl.ts`, `social-apis.ts` → opt-in suites for agents that touch GHL or social platforms.

**Adding an agent** = create the factory file (extend `BaseAgent`, set `skillPath`, register tools, call `registerAgent`), export it from `agents/index.ts`, add it to the `route_to_agent` enum in `director.ts`, and add the import + (if triggered externally) a route/cron entry. Also create the corresponding `aios/skills/.../SKILL.md` or the agent runs on the generic fallback prompt.

### Graceful degradation pattern

Every tool checks for its API key/env var and, if missing, returns a descriptive stub result (e.g. `"Would write to X. Set NOTION_API_KEY to activate."`) instead of throwing. This is intentional: the whole system runs end-to-end with zero credentials for testing, and goes live as keys are added. Preserve this pattern when writing new tools.

### Entry point & triggers (`server/index.ts`)

Express 5 app that: mounts `/webhooks` (the primary way work enters the system), exposes `/health`, serves the built client from `dist/public`, and starts the cron scheduler.

- **`webhooks/index.ts`** — HTTP entry points that instantiate an agent and call `.run(...)`. Long-running jobs (`seo-audit`, `transcript`, ads alerts) acknowledge immediately with `res.json({ received: true })` and process in `setImmediate(...)` because GHL/Meta expect a fast response. Synchronous endpoints (`sales-call`, `meeting`) return the agent output directly.
- **`scheduler/index.ts`** — `node-cron` jobs (daily digest, weekly report, newsletter, content calendar, ad review, monthly finance/bookkeeping). Each job is wrapped in `runSafe(...)` so one failure doesn't kill the scheduler. Gated by `AIOS_SCHEDULER !== "disabled"`.

### Notion memory layer (`framework/tools/notion.ts`)

The canonical memory is **8 Notion databases**. Database IDs are **hardcoded as defaults** in `notion.ts` (`DB_MAP`) and overridable via `NOTION_DB_*` env vars. `notion_write` maps field names to Notion property types per-database via a schema table, so when changing what an agent writes, update that schema map too. Client Registry and GHL Project Tracker DB IDs ship empty in `.env.example` and need to be created/pasted to activate those writes.

### Frontend (`client/`)

React 19 + Vite 7 + Tailwind v4 + shadcn-style Radix UI primitives (in `components/ui/`) + `wouter` for routing. It's a small marketing/landing site (`pages/Home.tsx`), not the agent UI. Path aliases: `@/*` → `client/src`, `@shared/*` → `shared`. The agents have no web UI — they're driven by webhooks and cron.

## Conventions

- **ESM with explicit `.ts` import extensions** (`import ... from "./director.ts"`). `tsconfig` sets `allowImportingTsExtensions` + `moduleResolution: bundler`. Keep the `.ts` in relative imports.
- `pnpm check` (tsc) is the only static gate — there is no eslint. Run it before considering work done.
- Agent business behavior lives in the Markdown SKILL/SOP files under `aios/`, not in the TS. Prompt/logic changes for an agent usually mean editing its `aios/skills/.../SKILL.md`, not the factory.
- `claude-opus-4-8` for the Director (orchestration); `claude-sonnet-4-6` for specialists. The cost-estimate math in `base-agent.ts` branches on whether the model name includes `"opus"`.

## Deployment

Railway via Nixpacks (`railway.toml`): build `pnpm install && pnpm run build`, start `pnpm start`, healthcheck `/health`. All secrets come from env vars — see `.env.example` for the full set (Anthropic, Notion, Slack, GHL, Zapier webhooks per business function, and optional direct social/ad platform APIs).
