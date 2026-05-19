# AIOS White-Label Template
## Myers Digital Consulting — Client Deployment Framework

This template is the rebrandable foundation for deploying AIOS for any business. All `{PLACEHOLDER}` values must be replaced with the client's specifics before deployment.

---

## What This Template Contains

```
aios-template/
├── CLAUDE.md           ← Root behavioral instructions (load every session)
├── MEMORY.md           ← Root factual memory (load every session)
├── skills/
│   ├── director/SKILL.md         ← Director Agent (routing brain)
│   ├── notion-context/SKILL.md   ← Memory pull protocol
│   └── modules/
│       ├── crm/SKILL.md
│       ├── finance/SKILL.md
│       ├── operations/SKILL.md
│       ├── marketing/SKILL.md
│       ├── analytics/SKILL.md
│       ├── hr/SKILL.md
│       ├── legal/SKILL.md
│       └── security/SKILL.md
└── sops/
    ├── 00-master-overview.md
    └── [module SOPs — generated during setup]
```

---

## Setup Steps

### Step 1 — Complete the Intake Form
Client fills out `aios/resources/client-onboarding-kit/intake-form.md`.
All {PLACEHOLDER} values come from this form.

### Step 2 — Replace Placeholders
Find and replace every `{PLACEHOLDER}` across all template files:

| Placeholder | Replace With |
|---|---|
| `{BUSINESS_NAME}` | Client's company name |
| `{OWNER_NAME}` | Owner's first name |
| `{OWNER_EMAIL}` | Owner's email address |
| `{BUSINESS_TYPE}` | Industry / niche description |
| `{PACKAGE_TYPE}` | Starter / Growth / Full Stack |
| `{MONTHLY_REVENUE}` | Approximate MRR |
| `{TEAM_SIZE}` | Number of people |
| `{GHL_ACCOUNT_ID}` | GHL sub-account ID |
| `{NOTION_WORKSPACE_URL}` | Client's Notion workspace URL |
| `{SLACK_CHANNEL}` | Client's primary Slack channel |
| `{PRIMARY_PAIN}` | Top operational pain from intake form |
| `{VOICE_STYLE}` | Communication style (from intake form Q15) |
| `{SERVICE_PACKAGES}` | Client's own service packages/tiers |
| `{SLA_DAYS}` | Delivery SLA days per package |

### Step 3 — Configure Notion Databases
Follow SOP-02 (Notion Setup) using the client's workspace. Import the 8 database templates.

### Step 4 — Wire Zapier
Follow SOP-03 (Zapier Setup). Enable only the Zaps included in the client's package tier.

**Starter**: DAT-01, DEL-01, DEL-04, OPS-02
**Growth**: Above + SAL-01, SAL-02, SAL-04, MKT-02, DAT-02
**Full Stack**: All 25 Zaps active

### Step 5 — Activate Specialist Agents
Load and test each specialist skill file for the client's package tier.

### Step 6 — Voice Calibration
Run 3 test outputs through the Voice Layer. Client reviews and approves before go-live.

### Step 7 — System Test
Follow the Setup Checklist (`client-onboarding-kit/setup-checklist.md`). All checkboxes must be complete before handoff.

---

## Package Agent Matrix

| Agent | Starter | Growth | Full Stack |
|---|---|---|---|
| Director | ✅ | ✅ | ✅ |
| CRM | ✅ | ✅ | ✅ |
| Analytics | ✅ | ✅ | ✅ |
| Finance | — | ✅ | ✅ |
| Operations | — | ✅ | ✅ |
| Marketing | — | ✅ | ✅ |
| HR | — | — | ✅ |
| Legal | — | — | ✅ |
| Security | — | — | ✅ |
| Meeting Transcript Agent | ✅ | ✅ | ✅ |
| GEO/SEO Auditor | ✅ | ✅ | ✅ |
| Bookkeeping Categorizer | ✅ | ✅ | ✅ |
| Transcript Miner & Ad Builder | — | ✅ | ✅ |
| Newsletter Writer | — | ✅ | ✅ |
| Content Calendar | — | ✅ | ✅ |
| Social Media Manager | — | ✅ | ✅ |
| Sales Call Coach | — | — | ✅ |
| Scroll-Stopper Ad Builder | — | — | ✅ |
| Meta Ads Manager | — | — | ✅ |
| Google Ads Manager | — | — | ✅ |
| Ad Performance Monitor | — | — | ✅ |
| Cost Breakdown Analyst | ✅ | ✅ | ✅ |
| Workspace Architect | ✅ | ✅ | ✅ |

---

## White-Label Partner Notes

If deploying for a partner agency's client (not a direct Myers Digital client):
- All files remain as-is from this template
- Partner's branding replaces Myers Digital branding in CLAUDE.md and email templates
- Partner receives a copy of this repo + setup documentation
- Myers Digital retains the master template — updates propagate on partner request
- Support goes through the partner; partner escalates to Myers Digital if needed

---

## Maintenance Schedule

| Cadence | Action |
|---|---|
| Weekly | Review Automation Log for failures |
| Monthly | Run Workspace Architect audit |
| Quarterly | Voice recalibration check |
| As needed | Add new agents as client grows |
