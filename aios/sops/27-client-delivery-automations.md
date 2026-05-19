# SOP-27 — Client Delivery Automations (DEL Series)

**Version**: 1.0
**Module**: Operations
**Status**: Active
**Last Reviewed**: 2026-05-19

---

## Purpose

Define the four automated client delivery workflows (DEL-01 through DEL-04) that govern the full lifecycle from client onboarding through monthly reporting. These automations are executed via Zapier using the `aios-del-automations` skill.

---

## Automation Registry

| Zap ID | Name | Trigger | Channels |
|---|---|---|---|
| `DEL-01` | SLA Breach Alert | Delivery exceeds SLA threshold | Slack DM (Dustin) + #aios-alerts |
| `DEL-02` | Client Onboarding Email | New client Closed Won (via SAL-04) | Gmail → client + #aios-delivery |
| `DEL-03` | GHL Sub-Account Ready | GHL sub-account configured and live | Gmail → client + #aios-delivery |
| `DEL-04` | Monthly Client Report | 1st business day of each month | Gmail → client |

All automations log to the **Notion Automation Log** (DB: `44bab4bf-b1c7-44f4-b845-33064b8b5fd2`).

---

## DEL-01 — SLA Breach Alert

### SLA Thresholds

| Package | Delivery Target | Alert Threshold | Breach Threshold |
|---|---|---|---|
| Starter | 5 business days | > 7 days | > 14 days |
| Growth | 10 business days | > 14 days | > 21 days |
| Scale | 15 business days | > 21 days | > 30 days |

**Alert threshold** fires an internal warning. **Breach threshold** fires DEL-01 and requires immediate Director escalation.

### Required Inputs

| Field | Description |
|---|---|
| `client_name` | Full client name |
| `client_email` | Client email address |
| `package_type` | Starter / Growth / Scale |
| `days_elapsed` | Business days since kickoff |
| `sla_days` | SLA breach threshold for this package |
| `blocker_reason` | Brief description of what is causing the delay |

### Execution Steps

1. DM Dustin on Slack with breach details and action required
2. Post alert to `#aios-alerts` channel
3. Log event to Notion Automation Log (`Status: Success` or `Failed`)

### Response Protocol

- Dustin must acknowledge within **2 hours**
- Director must log resolution path to Notion within **4 hours**
- If no resolution within 24 hours → escalate to client with honest delay notice

---

## DEL-02 — Client Onboarding Email

### Trigger Chain

```
Deal Closed Won → SAL-04 fires → DEL-02 fires
```

### Required Inputs

| Field | Description |
|---|---|
| `client_name` | Full client name |
| `client_email` | Client email address |
| `package_type` | Starter / Growth / Scale |
| `kickoff_date` | Scheduled kickoff date (e.g., "Monday, May 20") |
| `onboarding_doc_url` | Optional intake form URL |

### Execution Steps

1. Send welcome email via Gmail with kickoff date and next steps
2. Notify `#aios-delivery` to begin GHL sub-account setup
3. Log event to Notion Automation Log

### Post-Automation Checklist

- [ ] Slack intake form link to client
- [ ] Create project in Notion Project Tracker with SLA clock started
- [ ] Assign GHL build to team member
- [ ] Book kickoff call (if not already scheduled)

---

## DEL-03 — GHL Sub-Account Ready

### Trigger

Manual trigger by team member when GHL sub-account is fully configured and tested.

### Required Inputs

| Field | Description |
|---|---|
| `client_name` | Full client name |
| `client_email` | Client email address |
| `ghl_login_url` | Direct GHL login URL for client |
| `ghl_username` | Client's GHL username |
| `package_type` | Starter / Growth / Scale |

### Execution Steps

1. Send platform access email via Gmail with login credentials and setup summary
2. Notify `#aios-delivery` that delivery clock is stopped and SLA is met
3. Log event to Notion Automation Log

### Pre-Send QA Checklist

- [ ] CRM pipeline stages configured correctly
- [ ] Lead capture forms tested and live
- [ ] Automation workflows activated and tested
- [ ] Client login tested end-to-end
- [ ] Reporting dashboard accessible

---

## DEL-04 — Monthly Client Report

### Schedule

Fires on the **1st business day of each month** for all active clients.

### Required Inputs

| Field | Description |
|---|---|
| `client_name` | Full client name |
| `client_email` | Client email address |
| `report_month` | Month being reported (e.g., "April 2026") |
| `leads_generated` | Total leads for the month |
| `conversion_rate` | Conversion rate as a percentage |
| `top_performing_campaign` | Name of best-performing campaign |
| `key_win` | Single biggest win for the month |
| `next_month_focus` | Primary focus area for next month |

### Execution Steps

1. Send monthly performance report via Gmail with KPIs and next steps
2. Log event to Notion Automation Log

### Data Sources

Pull report data from:
- GHL analytics dashboard (leads, conversions)
- Windsor.ai connectors (ad spend, ROAS, campaign performance)
- Notion Client KPI database

### SLA

Monthly reports must be sent **by the 5th of each month**. If DEL-04 fires on the 1st and data is incomplete, flag to Director immediately.

---

## Error Handling

If any DEL automation step fails:

1. Log to Notion Automation Log with `Status: Failed` and error details
2. Post to `#aios-alerts`: `🚨 DEL automation failed: {zap_id} | Client: {client_name} | Error: {error_message}`
3. DEL-01 failures are **critical** — escalate immediately to Dustin via direct Slack DM

---

## Related SOPs

- `SOP-04` — CRM Module (SAL-04 trigger chain into DEL-02)
- `SOP-06` — Operations Module (SLA standards and GHL onboarding process)
- `SOP-03` — Zapier Setup (webhook and action configuration)
