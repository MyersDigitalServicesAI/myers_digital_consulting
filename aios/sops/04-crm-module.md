# SOP-04 — CRM Module

**Version**: 1.0
**Module**: CRM
**Status**: Active

---

## Purpose
Manage Myers Digital's client relationships, revenue health, churn prevention, and pipeline using the CRM Module.

## Trigger
Any directive involving client health, pipeline, revenue, renewals, or upsell opportunities.

## Inputs Required
- Notion `AIOS — Client Registry` (current)
- Notion `AIOS — KPI Snapshots` (CRM metrics)
- GHL pipeline data (if available)
- Recent module memory (last 14 days)

## Steps

### 1. Load Module Context
Pull from Notion:
```
AIOS — KPI Snapshots WHERE Module = "crm"
AIOS — Client Registry WHERE Status = "Active"
AIOS — Module Memory WHERE Module = "crm" AND Date > -14d
```

### 2. Run Health Scoring
Score each active client using the churn risk rubric in `skills/modules/crm/SKILL.md`.

### 3. Identify Priorities
- Clients with score > 80 → immediate intervention
- Clients with score 60-80 → proactive outreach
- Renewals due < 30 days → renewal sequence
- Upsell candidates → Callan notification

### 4. Fire Automations
- Score > 60 → Churn intervention sequence
- Renewal < 30 days → Renewal Zap
- Deal closed won → `SAL-04`

### 5. Output Director Brief
Format per `skills/modules/crm/SKILL.md` output format.

### 6. Write Back to Notion
- Update `AIOS — Module Memory`
- Update `AIOS — KPI Snapshots` for any changed metrics
- Log any intervention to `AIOS — Decision Log`

## Escalation Criteria
- Any client with churn score > 80 → Director escalation
- MRR decline 2 months in a row → Director escalation
- NRR < 100% → Director brief to Callan
