# SOP-02 — Notion AIOS Setup

**Version**: 1.0
**Module**: Notion Context
**Status**: Active

---

## Purpose
Set up and maintain the 8 Notion databases that serve as Myers Digital's AIOS memory layer.

## Databases to Create

### Database 1: `AIOS — Business Context`
**Properties:**
- Name (title)
- Domain (select): CRM, Finance, Marketing, Operations, HR, Legal, Security, GHL-Platform
- Last Updated (date)
- Module Owner (select)
- Priority (select): High, Medium, Low
- Status (select): Active, Archived

**Initial pages to create:**
- Myers Digital Business Model
- GHL Platform Overview
- Service Package Details (Starter/Growth/Scale)
- Target Client Profile
- Competitive Landscape

### Database 2: `AIOS — KPI Snapshots`
**Properties:**
- Metric Name (title)
- Module (select): all modules
- Value (number)
- Target (number)
- Period (select): current, last_month, last_quarter
- Variance % (formula)
- Status (select): 🟢 On Track, 🟡 Watch, 🔴 Action

**Initial KPIs to enter:**
- MRR (Finance)
- Active Clients (CRM)
- Pipeline Value (CRM/Marketing)
- Delivery Rate (Operations)
- Churn Rate (CRM)
- Lead Count MTD (Marketing)

### Database 3: `AIOS — Decision Log`
**Properties:**
- Decision (title)
- Module(s) (multi-select)
- Date (date)
- Priority (select)
- Outcome (text)
- Zapier Triggered (checkbox)
- Trigger ID (text)

### Database 4: `AIOS — SOP Library`
**Properties:**
- SOP Name (title)
- Module (select)
- Version (text)
- Status (select): Active, Draft, Archived
- Owner (person)
- Last Reviewed (date)
- File Link (URL)

**Initial entries:** Create one entry per SOP in the `sops/` directory.

### Database 5: `AIOS — Module Memory`
**Properties:**
- Summary (title)
- Module (select)
- Operator Input (text)
- Director Response (text)
- Timestamp (date)
- Session ID (text)
- Escalated (checkbox)

**Retention:** Archive entries older than 90 days.

### Database 6: `AIOS — Automation Log`
**Properties:**
- Trigger Name (title)
- Zap ID (text)
- Module (select)
- Payload Summary (text)
- Status (select): Fired, Failed, Pending
- Timestamp (date)
- Result (text)

### Database 7: `AIOS — Client Registry`
**Properties:**
- Client Name (title)
- Package (select): Starter, Growth, Scale
- MRR (number)
- Status (select): Active, At Risk, Churned
- Health Score (number, 0-100)
- GHL Sub-Account (URL)
- Onboard Date (date)
- Renewal Date (date)
- Primary Contact (text)
- Industry (select)

### Database 8: `AIOS — GHL Project Tracker`
**Properties:**
- Project Name (title)
- Client (relation → Client Registry)
- Package (select)
- Tools Deployed (multi-select: all 17 GHL tools)
- Status (select): Planning, In Progress, Complete, On Hold
- Go-Live Date (date)
- Setup Revenue (number)
- Notes (text)

## Maintenance Schedule
| Frequency | Task |
|---|---|
| Daily | KPI Snapshots updated by Zapier automations |
| Weekly | Review Module Memory for anomalies |
| Monthly | Archive Decision Log entries > 90 days old |
| Quarterly | Review and update all SOP Library entries |
