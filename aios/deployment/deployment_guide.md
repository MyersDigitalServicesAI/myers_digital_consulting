# Deployment Guide — Myers Digital AIOS
**Version**: 1.0 | **Date**: 2026-05-26
**Platform**: Railway (primary) | Local (dev)

---

## Architecture Overview

```
Client (React/Vite)  →  Express Server  →  AIOS Agents (20x)
                                        ↓
                                   Notion (Memory)
                                   Zapier (Automation)
                                   GHL (CRM/Delivery)
```

---

## Quick Deploy (Railway)

The project is configured for zero-config Railway deployment via `railway.toml`.

### 1. Environment Variables

Set all required variables in Railway dashboard:

```
ANTHROPIC_API_KEY=sk-ant-...
NOTION_API_KEY=secret_...
NOTION_DB_CLIENT_REGISTRY=...
NOTION_DB_FINANCE_TRACKER=...
NOTION_DB_KPI_SNAPSHOTS=...
NOTION_DB_CONTENT_CALENDAR=...
NOTION_DB_GHL_TRACKER=...
NOTION_DB_TEAM_REGISTRY=...
NOTION_DB_AUTOMATION_LOG=...
NOTION_DB_MODULE_MEMORY=...
AIOS_SCHEDULER=enabled
NODE_ENV=production
```

### 2. Deploy Command

```bash
git push origin main
```

Railway auto-deploys on every push to main.

### 3. Build Pipeline

```
pnpm install → pnpm build → node dist/server/index.js
```

Build output:
- `dist/server/` — compiled TypeScript server
- `dist/public/` — built React frontend

---

## Local Development

```bash
# Install dependencies
pnpm install

# Start development server (hot reload)
pnpm dev

# Run e2e agent tests
npx tsx server/agents/test-e2e.ts
```

Development server runs at `http://localhost:3000`

---

## Health Check

```bash
GET /health

# Response:
{
  "status": "ok",
  "aios": "running",
  "anthropic": "configured",
  "notion": "configured"
}
```

---

## Webhook Endpoints Reference

| Method | Endpoint | Agent | Description |
|---|---|---|---|
| POST | `/webhooks/director` | Director | General task dispatch |
| POST | `/webhooks/ghl/new-lead` | CRM | GHL new lead event |
| POST | `/webhooks/sales-call` | SalesCallCoach | Submit call for scoring |
| POST | `/webhooks/transcript` | TranscriptMiner | Submit transcript for mining |
| POST | `/webhooks/meeting` | MeetingTranscript | Submit meeting for tasks |
| POST | `/webhooks/seo-audit` | GeoSeoAuditor | Request client audit |
| POST | `/webhooks/social/post` | SocialMediaManager | Publish a post |
| POST | `/webhooks/social/draft-week` | ContentCalendar | Draft week's content |
| POST | `/webhooks/ads/meta-lead` | Director → CRM | Meta lead form |
| POST | `/webhooks/ads/meta-alert` | MetaAdsManager | Meta campaign alert |
| POST | `/webhooks/ads/performance` | AdPerformance | Ad performance review |
| POST | `/webhooks/cost/breakdown` | CostBreakdown | AIOS cost analysis |
| POST | `/webhooks/workspace/audit` | WorkspaceArchitect | Workspace audit |
| POST | `/webhooks/workspace/optimize` | WorkspaceArchitect | Optimize a file |
| POST | `/webhooks/sales/inquiry` | AiosSales | New AIOS prospect |
| POST | `/webhooks/sales/demo-complete` | AiosSales | Post-demo follow-up |
| POST | `/webhooks/sales/closed-won` | Director | New client onboarding chain |

---

## Scheduler Activation

The scheduler activates automatically when `AIOS_SCHEDULER=enabled`. To disable in dev:

```
AIOS_SCHEDULER=disabled
```

Scheduled jobs (11 total) are documented in `aios/automation/scheduler_config.json`.

---

## Scaling Notes

- **Single instance**: Current Railway deployment — suitable for < 100 concurrent webhook calls
- **Scaling trigger**: When concurrent webhook load exceeds 50 req/min, add Railway horizontal scaling
- **Database**: No SQL database required — Notion handles all persistence
- **Agent concurrency**: Each webhook call spawns a new agent instance — stateless design supports parallelism

---

## Monitoring

- **Health endpoint**: `GET /health` — monitors from Railway dashboard
- **Agent logs**: Console output — visible in Railway logs
- **Decision audit**: Notion Automation Log DB — all decisions logged
- **Cost tracking**: Analytics agent tracks daily spend — alerts at $5/day threshold
- **Errors**: All webhook errors caught + logged to console; fatal errors restart via Railway

---

## Rollback

```bash
# Revert to last working deploy
git revert HEAD
git push origin main

# Or pin to specific commit in Railway dashboard
```
