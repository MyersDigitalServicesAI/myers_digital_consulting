# Myers Digital Consulting — AIOS

AI Operating System for Myers Digital Consulting. Claude is the brain. Notion is the memory. Zapier is the hands. GHL is the revenue engine.

## System Architecture

```
Operator → Claude Director Agent
               ↓
    ┌──────────────────────────┐
    │   Notion Context Layer   │  ← memory, SOPs, KPIs, logs
    └──────────────────────────┘
               ↓
    ┌──────────────────────────┐
    │   Business Modules (8)   │  ← CRM, Finance, Marketing, Ops, HR, Legal, Analytics, Security
    └──────────────────────────┘
               ↓
    ┌──────────────────────────┐
    │   Custom Skills (8)      │  ← Myers Digital-specific agents
    └──────────────────────────┘
               ↓
    ┌──────────────────────────┐
    │   Zapier Automation      │  ← execution layer (GHL, Slack, Notion, email)
    └──────────────────────────┘
```

## Quick Start

1. Set up Notion databases (see `sops/02-notion-setup.md`)
2. Configure Zapier webhooks (see `sops/03-zapier-setup.md`)
3. Load skills into Claude (see `skills/` directory)
4. Issue your first Director command

## Skills Index

| Skill | File | Purpose |
|---|---|---|
| AIOS Director | `skills/director/SKILL.md` | Master orchestration |
| Notion Context | `skills/notion-context/SKILL.md` | Business memory layer |
| Zapier Automation | `skills/zapier-automation/SKILL.md` | Execution engine |
| CRM Module | `skills/modules/crm/SKILL.md` | Client & revenue health |
| Finance Module | `skills/modules/finance/SKILL.md` | CFO-level financial ops |
| Marketing Module | `skills/modules/marketing/SKILL.md` | CMO-level growth ops |
| Operations Module | `skills/modules/operations/SKILL.md` | COO-level delivery ops |
| HR Module | `skills/modules/hr/SKILL.md` | People & talent |
| Legal Module | `skills/modules/legal/SKILL.md` | Contracts & compliance |
| Analytics Module | `skills/modules/analytics/SKILL.md` | Business intelligence |
| Security Module | `skills/modules/security/SKILL.md` | Access & threat management |
| Meeting Transcript Task Creator | `skills/custom/meeting-transcript-task-creator/SKILL.md` | Auto-task from meetings |
| GEO/SEO Auditor | `skills/custom/geo-seo-auditor/SKILL.md` | Visibility gap analysis |
| Transcript Miner & Ad Builder | `skills/custom/transcript-miner-ad-builder/SKILL.md` | Content from calls |
| Sales Call Coach | `skills/custom/sales-call-coach/SKILL.md` | Live call scoring |
| Bookkeeping Categorizer | `skills/custom/bookkeeping-categorizer/SKILL.md` | Expense automation |
| Dustin Voice Skill | `skills/custom/dustin-voice-skill/SKILL.md` | Brand voice layer |
| Newsletter Skill | `skills/custom/newsletter-skill/SKILL.md` | Newsletter builder |
| Scroll-Stopper Ad Skill | `skills/custom/scroll-stopper-ad-skill/SKILL.md` | Ad creative builder |

## SOPs Index

| SOP | File |
|---|---|
| Master AIOS Overview | `sops/00-master-aios-overview.md` |
| Director Agent | `sops/01-director-agent.md` |
| Notion Setup | `sops/02-notion-setup.md` |
| Zapier Setup | `sops/03-zapier-setup.md` |
| CRM Module | `sops/04-crm-module.md` |
| Marketing Module | `sops/05-marketing-module.md` |
| Operations Module | `sops/06-operations-module.md` |
| Finance Module | `sops/07-finance-module.md` |
| HR Module | `sops/08-hr-module.md` |
| Legal Module | `sops/09-legal-module.md` |
| Analytics Module | `sops/10-analytics-module.md` |
| Security Module | `sops/11-security-module.md` |
| Meeting Transcript Task Creator | `sops/12-meeting-transcript-task-creator.md` |
| GEO/SEO Auditor | `sops/13-geo-seo-auditor.md` |
| Transcript Miner & Ad Builder | `sops/14-transcript-miner-ad-builder.md` |
| Sales Call Coach | `sops/15-sales-call-coach.md` |
| Bookkeeping Categorizer | `sops/16-bookkeeping-categorizer.md` |
| Dustin Voice Skill | `sops/17-dustin-voice-skill.md` |
| Newsletter Skill | `sops/18-newsletter-skill.md` |
| Scroll-Stopper Ad Skill | `sops/19-scroll-stopper-ad-skill.md` |
| GHL Sales Playbook | `sops/20-ghl-sales-playbook.md` |
