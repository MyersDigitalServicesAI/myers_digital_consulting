# SOP-03 — Zapier Automation Setup

**Version**: 1.0
**Module**: Zapier Automation
**Status**: Active

---

## Purpose
Configure all Zapier automations in the Myers Digital AIOS execution layer.

## Prerequisites
- Zapier Professional plan ($49/mo) — required for multi-step Zaps
- Webhook by Zapier enabled
- Notion MCP connected
- GHL account connected to Zapier
- Slack workspace connected

## Setup Process (per Zap)

### Step 1: Create the Zap
1. Log into Zapier
2. Click "Create Zap"
3. Name it using the registry key (e.g., `SAL-01 Lead Captured`)

### Step 2: Set Trigger
- **Trigger app**: Webhooks by Zapier → Catch Hook
- Copy the webhook URL
- Store webhook URL in Notion `Connector Registry` page

### Step 3: Build Action Chain
Follow the action sequence in `skills/zapier-automation/SKILL.md` for each Zap.

### Step 4: Final Action — Log Back to AIOS
Every Zap's last step: POST result back to AIOS via webhook, which logs to `AIOS — Automation Log`.

### Step 5: Test
1. Send test payload from AIOS terminal
2. Verify Notion `Automation Log` entry created
3. Confirm external action completed
4. Document test in `AIOS — SOP Library`

## Priority Zaps to Configure First

| Priority | Zap | Why |
|---|---|---|
| 1 | `SAL-01` Lead Captured | Immediate revenue impact |
| 2 | `SAL-04` Deal Closed Won | Triggers client onboarding |
| 3 | `DEL-01` New Client Onboarded | Starts GHL setup |
| 4 | `DAT-01` Daily KPI Digest | Dustin's morning briefing |
| 5 | `FIN-02` Payment Received | MRR tracking |

## Error Handling
- Failed Zaps → `#aios-alerts` Slack channel
- Failed Zaps → Notion `Automation Log` Status = "Failed"
- Priority "urgent" failures → Director auto-escalation + Dustin DM
- Retry logic: 3 attempts, then human notification
