---
name: myers-digital-zapier-automation
description: >
  Zapier as the Myers Digital AIOS automation execution layer. Use whenever a Director decision or module
  output requires triggering external actions — GHL workflows, Slack notifications, Notion updates,
  client emails, or any external automation. Claude thinks, Notion remembers, Zapier acts.
compatibility:
  requires: [Zapier account with Webhook by Zapier enabled]
  trigger_method: Webhooks (HTTP POST to Zapier catch hooks)
---

# Myers Digital — Zapier Automation Layer

Zapier is the **execution engine**. All AIOS automation flows through Zapier via webhook triggers.

---

## Architecture

```
Dustin's Directive
      ↓
Claude (Director) — routes and decides
      ↓
Notion — context pulled, decision logged
      ↓
Zapier Webhook — fires the action
      ↓
GHL / Slack / Email / Notion
      ↓
Result → logged back to AIOS Automation Log
```

---

## Myers Digital Zap Registry

### CLIENT DELIVERY ZAPS

| Zap | Trigger | Actions |
|---|---|---|
| `DEL-01` SLA Breach Alert | Delivery exceeds threshold (14/21/30 days) | Slack DM Dustin → #aios-alerts → Notion log |
| `DEL-02` Client Onboarding Email | SAL-04 Closed Won fires | Gmail welcome email → #aios-delivery notify → Notion log |
| `DEL-03` GHL Sub-Account Ready | GHL build complete and tested | Gmail access email → #aios-delivery notify → Notion log |
| `DEL-04` Monthly Client Report | Scheduled (1st business day of month) | Gmail report email → Notion log |

> Skill: `aios-del-automations` — see SOP-27 for full DEL automation documentation.

### SALES ZAPS

| Zap | Trigger | Actions |
|---|---|---|
| `SAL-01` Lead Captured | Website form submit | Add to GHL → Slack notify Dustin → Notion log |
| `SAL-02` Discovery Call Booked | Calendar booking | Confirmation sequence → Prep brief → Notion |
| `SAL-03` Proposal Sent | Director approval | Track in CRM → Follow-up sequence → Notion |
| `SAL-04` Deal Closed Won | CRM stage change | Onboarding trigger → Finance notify → Slack celebrate |

### FINANCE ZAPS

| Zap | Trigger | Actions |
|---|---|---|
| `FIN-01` Invoice Created | Director trigger | Create in system → Email client → Notion log |
| `FIN-02` Payment Received | Stripe webhook | Update MRR in Notion → Slack notify → Log |
| `FIN-03` Budget Variance Alert | KPI > 20% variance | Slack alert → Notion flag → Director escalation |
| `FIN-04` Monthly P&L | Scheduled (1st) | Synthesize → Email Dustin → Notion log |

### MARKETING ZAPS

| Zap | Trigger | Actions |
|---|---|---|
| `MKT-01` Lead Score > 80 | CRM scoring | Notify CRM module → Slack → Notion |
| `MKT-02` Content Published | Schedule trigger | Post to channels → Track → Notion |
| `MKT-03` Campaign Launched | Director approval | Activate → Log Notion → Slack |

### OPERATIONS ZAPS

| Zap | Trigger | Actions |
|---|---|---|
| `OPS-01` SLA Breach | Monitoring alert | Slack escalation → Notion incident log → Director |
| `OPS-02` Capacity Alert | Utilization > 85% | Slack alert → Notion flag → HR trigger |
| `OPS-03` SOP Updated | Notion change | Notify team → Version archive → Slack |

### ANALYTICS ZAPS

| Zap | Trigger | Actions |
|---|---|---|
| `DAT-01` Daily KPI Digest | Scheduled 7am | Pull KPIs → Synthesize → Slack digest |
| `DAT-02` Anomaly Detected | Threshold crossed | Notion flag → Slack → Director escalation |
| `DAT-03` Weekly Report | Monday 8am | Full report → Email Dustin |

---

## Webhook Payload Standard

```json
{
  "aios_event": {
    "zap_key": "sal_lead_captured",
    "module": "crm",
    "priority": "standard",
    "timestamp": "ISO-8601",
    "session_id": "SID-XXXXXXXX"
  },
  "data": {},
  "notion_log_id": "page-id-to-update",
  "director_context": "reason this was triggered"
}
```

---

## Error Handling

1. Zapier sends failure to `#aios-alerts` Slack channel
2. AIOS logs failure to Notion Automation Log (Status = "Failed")
3. Priority = "urgent" → Director auto-escalation
4. Retry logic: 3 attempts before Dustin notification
