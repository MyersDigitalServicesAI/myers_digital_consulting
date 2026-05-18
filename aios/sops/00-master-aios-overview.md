# SOP-00 — Myers Digital AIOS Master Overview

**Version**: 1.0
**Owner**: Dustin Myers
**Status**: Active
**Last Reviewed**: 2026-05-18

---

## What Is AIOS?

AIOS (AI Operating System) is the intelligence infrastructure that runs Myers Digital Consulting. It is Claude operating as a COO/CEO-level executive agent across all business functions — routing decisions, synthesizing data, triggering automations, and maintaining business memory.

**The stack:**
- **Claude** = The brain (Director + all modules)
- **Notion** = The memory (databases, SOPs, KPIs, logs)
- **Zapier** = The hands (automation execution layer)
- **GoHighLevel** = The revenue engine (client delivery platform)

---

## System Principles

1. **One input point** — All directives enter through the Director. Never skip to a module directly.
2. **Notion first** — Before any action, pull context from Notion. After any action, write back to Notion.
3. **Zapier executes** — Claude decides. Notion logs. Zapier does.
4. **Modules are specialists** — Each module is a C-suite-level specialist. Respect domain boundaries.
5. **Dustin is Level 9** — Full access to all modules including Security. No approval gates for Dustin.

---

## Daily Operating Rhythm

| Time | Automated Action |
|---|---|
| 7:00 AM | Analytics Daily Digest fires (DAT-01) — Dustin gets Slack summary |
| 9:00 AM | Transcript Miner runs if new transcripts detected |
| Monday 8:00 AM | Weekly Report fires (DAT-03) — full business review |
| 1st of Month | Monthly P&L report (FIN-04) + Client reports (DEL-04) |

---

## Quick Command Reference

| Dustin Says | AIOS Routes To |
|---|---|
| "How's the business?" | Analytics → all modules → Director synthesis |
| "Who's at risk of churning?" | CRM Module |
| "Revenue this month?" | Finance Module |
| "Are we on track with deliveries?" | Operations Module |
| "Review this sales call" | Sales Call Coach |
| "Mine this transcript for content" | Transcript Miner & Ad Builder |
| "Audit [client] website" | GEO/SEO Auditor |
| "Extract tasks from this meeting" | Meeting Transcript Task Creator |
| "Write this email in my voice" | Dustin Voice Skill |
| "Build a newsletter about [topic]" | Newsletter Skill |
| "Turn this into ads" | Scroll-Stopper Ad Skill |
| "Categorize these transactions" | Bookkeeping Categorizer |

---

## Escalation Contacts

| Scenario | Action |
|---|---|
| Security incident | Immediate Dustin notification + Security Module |
| Financial variance > 20% | Finance Module + Director escalation |
| Client churn risk > 15% ARR | CRM Module + Dustin Slack |
| Legal deadline < 72 hours | Legal Module + Dustin notification |
| GHL system outage | Operations Module + client comms |

---

## Related SOPs
- `01-director-agent.md` — Director routing and decision protocol
- `02-notion-setup.md` — Database setup and maintenance
- `03-zapier-setup.md` — Automation configuration and testing
