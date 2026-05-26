# AIOS Onboarding Guide — Myers Digital Consulting
**Version**: 1.0 | **Date**: 2026-05-26
**Audience**: Dustin Myers and any new team members working with AIOS

---

## What Is AIOS?

The Myers Digital AI Operating System (AIOS) is a stack of 20 AI agents running on Claude that automates the repetitive, time-consuming work of running Myers Digital Consulting. It handles:

- Daily KPI reporting
- Client health monitoring
- Content creation (newsletters, ads, social posts)
- Sales qualification and follow-up
- Meeting → task extraction
- Bookkeeping prep
- SEO audits
- And 14 other specialized functions

**You talk to the Director. The Director routes to the right agent. The agents execute.**

---

## Getting Started in 5 Steps

### Step 1 — Set Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
# Required — without this, nothing works
ANTHROPIC_API_KEY=sk-ant-...

# Memory layer — without this, agents run without context
NOTION_API_KEY=secret_...
NOTION_DB_CLIENT_REGISTRY=...   # 8 Notion DB IDs
NOTION_DB_FINANCE_TRACKER=...
NOTION_DB_KPI_SNAPSHOTS=...
NOTION_DB_CONTENT_CALENDAR=...
NOTION_DB_GHL_TRACKER=...
NOTION_DB_TEAM_REGISTRY=...
NOTION_DB_AUTOMATION_LOG=...
NOTION_DB_MODULE_MEMORY=...

# Automation layer — set these as you configure each Zapier zap
ZAPIER_WEBHOOK_DEL_01=https://hooks.zapier.com/...
# (25 total — see aios/automation/zapier_webhooks.json)

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

### Step 2 — Set Up Notion (Phase 1)

Follow `aios/sops/02-notion-setup.md` to create all 8 databases. Copy each DB ID into your `.env`.

### Step 3 — Configure Zapier (Phase 2)

Follow `aios/sops/03-zapier-setup.md` to set up all 25 Zapier webhooks. Add each URL to `.env`.

### Step 4 — Connect GHL Webhook

In GHL → Settings → Webhooks → Add:
```
POST https://yourdomain.com/webhooks/ghl/new-lead
```
Every new GHL lead will now automatically create a CRM record via the CRM agent.

### Step 5 — Enable the Scheduler

In `.env`:
```
AIOS_SCHEDULER=enabled
```

This activates 11 scheduled jobs (see `aios/automation/scheduler_config.json`).

---

## How to Talk to AIOS

### Option A: Direct API call (from Zapier or any tool)

```bash
POST /webhooks/director
Content-Type: application/json

{
  "task": "Anything you'd normally do manually",
  "context": "Any additional context"
}
```

**Examples:**
```json
{ "task": "Summit Roofing just signed the Growth package. Coordinate onboarding." }
{ "task": "Generate May 2026 finance report with MRR by tier." }
{ "task": "Run health check on all active clients and flag any churn risks." }
```

### Option B: Specialized webhooks

| Use case | Endpoint | Body |
|---|---|---|
| Submit sales call | `POST /webhooks/sales-call` | `{ "transcript": "...", "rep_name": "Dustin" }` |
| Submit meeting notes | `POST /webhooks/meeting` | `{ "transcript": "...", "meeting_title": "..." }` |
| New AIOS inquiry | `POST /webhooks/sales/inquiry` | `{ "prospect_name": "...", "business_name": "..." }` |
| Client SEO audit | `POST /webhooks/seo-audit` | `{ "business_name": "...", "location": "..." }` |
| Run workspace audit | `POST /webhooks/workspace/audit` | `{ "scope": "full" }` |

---

## Understanding the Agent Roster

| Agent | What It Does | How to Trigger |
|---|---|---|
| **Director** | Routes and synthesizes everything | Any `/webhooks/director` call |
| **CRM** | Client health, pipeline | Director routes, or GHL webhook |
| **Finance** | Revenue, P&L, invoices | Director routes |
| **Marketing** | Content, leads, campaigns | Director routes |
| **Operations** | GHL builds, delivery | Director routes |
| **Analytics** | KPIs, reports | Daily cron + Director |
| **HR** | Contractors, hiring | Director routes |
| **Legal** | Contracts, flags | Director routes |
| **Security** | Incidents | Director routes |
| **TranscriptMiner** | Hook extraction from calls | `/webhooks/transcript` |
| **SalesCallCoach** | Score + coach calls | `/webhooks/sales-call` |
| **NewsletterWriter** | Newsletter drafts | Marketing agent or Director |
| **ScrollStopperAd** | Meta/Google ad copy | Director routes |
| **Bookkeeping** | Transaction categorization | Monthly cron |
| **GeoSeoAuditor** | Client SEO audits | `/webhooks/seo-audit` |
| **MeetingTranscript** | Meeting → tasks | `/webhooks/meeting` |
| **SocialMediaManager** | Social posts | Cron + `/webhooks/social/post` |
| **MetaAdsManager** | Meta campaign management | `/webhooks/ads/meta-alert` |
| **ContentCalendar** | Weekly content plan | Monday cron |
| **WorkspaceArchitect** | CLAUDE.md / MEMORY.md audit | `/webhooks/workspace/audit` |
| **AiosSales** | Prospect → demo → close | `/webhooks/sales/inquiry` |

---

## Escalation — When AIOS Alerts You

AIOS will notify you via Slack immediately when:
- Security breach or suspicious login
- Financial variance > 20% from forecast
- Legal deadline within 72 hours
- Client churn risk on accounts > 15% of ARR
- Any critical GHL or automation failure

**Format of escalation message:**
```
⚠ ESCALATION — [MODULE] — [PRIORITY LEVEL]
Trigger: [what caused this]
Risk: [what happens if unaddressed]
Recommended action: [specific next step]
```

---

## Key Files to Know

| File | Purpose |
|---|---|
| `aios/CLAUDE.md` | Agent behavioral instructions — loaded every session |
| `aios-template/MEMORY.md` | Active projects and core facts template |
| `aios/agents/agent_registry.json` | Complete agent directory |
| `aios/agents/orchestration_map.json` | How Director routes everything |
| `aios/automation/zapier_webhooks.json` | All 25 Zapier webhook definitions |
| `aios/automation/scheduler_config.json` | All 11 scheduled jobs |
| `aios/knowledge/company_profile.md` | Myers Digital business overview |
| `aios/knowledge/dependency_map.json` | What each component depends on |
| `aios/sops/` | Step-by-step SOPs for every function |
| `aios/skills/` | Agent skill files (system prompts) |
