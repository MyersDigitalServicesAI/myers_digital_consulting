# AIOS Webhook Setup Guide
# All 25 Zapier Zaps + GHL Webhook Configuration
# Myers Digital Consulting

**Prerequisites**: Zapier Professional ✅ | GHL Agency ✅ | Slack ✅ | Stripe ✅ | Gmail ✅

---

## Before You Start — One-Time Zapier Setup

### Connect all apps in Zapier first (do this once):
1. Zapier → **My Apps** → Add connection for each:
   - **GoHighLevel** (search "HighLevel" in Zapier)
   - **Slack**
   - **Gmail**
   - **Stripe**
   - **Notion** (use your workspace API key)
   - **Webhooks by Zapier** (built-in, no auth needed)
   - **Schedule by Zapier** (built-in, no auth needed)

### Notion Automation Log DB ID:
```
44bab4bf-b1c7-44f4-b845-33064b8b5fd2
```
Every Zap's final step logs here. Keep this handy.

### Webhook URL storage:
As you build each Zap, paste its Catch Hook URL into a Notion page called `AIOS Connector Registry` — one row per Zap (ID, name, URL, status).

---

## How Every Inbound Webhook Zap Works

**Pattern for all webhook-triggered Zaps:**
```
Trigger: Webhooks by Zapier → Catch Hook
         (copy the URL → paste into GHL or your code)
   ↓
Action 1: [primary action — GHL / Slack / Gmail]
   ↓
Action 2: [secondary action if needed]
   ↓
Final Action: Notion → Create Database Item → Automation Log
```

---

## SERIES 1 — SALES ZAPS (SAL)

---

### SAL-01 — Lead Captured

**Purpose**: Every new lead from the website goes immediately into GHL + Slack.

**Zapier setup:**
1. **Trigger**: Webhooks by Zapier → Catch Hook
   - Save this URL as `SAL-01 webhook URL`
   - Paste it into your website form's webhook field (GHL form settings → Notifications → Webhook)

2. **Action 1**: GoHighLevel → Create/Update Contact
   - First Name: `{{first_name}}`
   - Last Name: `{{last_name}}`
   - Email: `{{email}}`
   - Phone: `{{phone}}`
   - Pipeline: **AIOS Sales Pipeline**
   - Stage: **Inquiry**
   - Tags: `aios-lead`

3. **Action 2**: Slack → Send Channel Message
   - Channel: `#aios-alerts`
   - Message:
     ```
     🔔 *New AIOS Lead — SAL-01*
     Name: {{first_name}} {{last_name}}
     Email: {{email}}
     Phone: {{phone}}
     Source: {{source}}
     → GHL record created. Qualify within 24 hours.
     ```

4. **Final Action**: Notion → Create Database Item
   - Database: `44bab4bf-b1c7-44f4-b845-33064b8b5fd2`
   - Zap ID: `SAL-01`
   - Status: `Success`
   - Module: `CRM`
   - Notes: `Lead captured: {{email}}`

**GHL side**: Go to your website form → Settings → Notifications → add `SAL-01 webhook URL`.

---

### SAL-02 — Discovery Call Booked

**Purpose**: When someone books a discovery call, send confirmation and prep brief.

**Zapier setup:**
1. **Trigger**: GoHighLevel → New Appointment
   - Calendar: your discovery call calendar
   - Filter: Status = `confirmed`

2. **Action 1**: Gmail → Send Email
   - To: `{{contact_email}}`
   - Subject: `Your Call with Dustin is Confirmed`
   - Body:
     ```
     Hi {{contact_name}},

     Your discovery call is confirmed for {{appointment_time}}.

     Join link: {{location_or_zoom_link}}

     To get the most from our 30 minutes:
     - Think about where you're losing the most time in your business
     - Have a rough sense of your monthly revenue
     - Come ready to see the system live

     See you then.
     Dustin
     ```

3. **Action 2**: Slack → Send Direct Message to Dustin
   - Message:
     ```
     📅 *Discovery call booked — SAL-02*
     Contact: {{contact_name}} ({{contact_email}})
     Time: {{appointment_time}}
     → Load their GHL record before the call.
     ```

4. **Final Action**: Notion → Create Database Item (Automation Log)
   - Zap ID: `SAL-02` | Status: `Success` | Module: `CRM`
   - Notes: `Discovery call booked: {{contact_name}} — {{appointment_time}}`

---

### SAL-03 — Proposal Sent

**Purpose**: When Dustin marks a deal "Proposal Sent" in GHL, start the follow-up clock.

**Zapier setup:**
1. **Trigger**: GoHighLevel → Opportunity Stage Changed
   - Pipeline: AIOS Sales Pipeline
   - New Stage: **Proposal Sent**

2. **Action 1**: GoHighLevel → Add Tag to Contact
   - Tag: `proposal-sent`

3. **Action 2**: Slack → Send Direct Message to Dustin
   - Message:
     ```
     📋 *Proposal sent — SAL-03*
     Contact: {{contact_name}}
     → Day 2 follow-up due: {{follow_up_date}}
     → Add to "Proposal Sent" sequence in GHL if not already running.
     ```

4. **Final Action**: Notion → Create Database Item (Automation Log)
   - Zap ID: `SAL-03` | Status: `Success` | Module: `CRM`
   - Notes: `Proposal sent: {{contact_name}}`

---

### SAL-04 — Deal Closed Won

**Purpose**: Triggers the entire onboarding chain. Most important Sales Zap.

**Zapier setup:**
1. **Trigger**: GoHighLevel → Opportunity Stage Changed
   - Pipeline: AIOS Sales Pipeline
   - New Stage: **Closed Won**

2. **Action 1**: Slack → Send Channel Message
   - Channel: `#aios-delivery`
   - Message:
     ```
     🎉 *Deal Closed Won — SAL-04*
     Client: {{contact_name}}
     Package: {{opportunity_name}}
     Value: {{opportunity_monetary_value}}
     → DEL-02 (onboarding email) will fire. Start GHL build.
     ```

3. **Action 2**: Webhooks by Zapier → POST (trigger DEL-02)
   - URL: `[DEL-02 webhook URL — fill in after you build DEL-02]`
   - Payload:
     ```json
     {
       "client_name": "{{contact_name}}",
       "client_email": "{{contact_email}}",
       "package_type": "{{opportunity_name}}",
       "kickoff_date": "{{today + 2 business days}}"
     }
     ```

4. **Final Action**: Notion → Create Database Item (Automation Log)
   - Zap ID: `SAL-04` | Status: `Success` | Module: `CRM`
   - Notes: `Closed Won: {{contact_name}} — {{opportunity_name}}`

---

## SERIES 2 — CLIENT DELIVERY ZAPS (DEL)

---

### DEL-01 — SLA Breach Alert

**Purpose**: Fires when a GHL project goes past SLA threshold. Most critical ops Zap.

**SLA thresholds** (days since kickoff):
- Starter: 14 days | Growth: 21 days | Scale: 30 days

**Zapier setup:**
1. **Trigger**: Webhooks by Zapier → Catch Hook
   - Save as `DEL-01 webhook URL`
   - This is called from your GHL workflow or manually when you detect a breach

2. **Action 1**: Slack → Send Direct Message (to Dustin)
   - Message:
     ```
     🚨 *SLA BREACH — DEL-01*
     Client: {{client_name}}
     Package: {{package_type}}
     Days elapsed: {{days_elapsed}} (SLA: {{sla_days}} days)
     Blocker: {{blocker_reason}}
     → Action required: contact client within 2 hours.
     ```

3. **Action 2**: Slack → Send Channel Message
   - Channel: `#aios-alerts`
   - Message:
     ```
     🚨 *DEL-01 SLA Breach* | {{client_name}} | {{package_type}} | Day {{days_elapsed}}/{{sla_days}} | {{blocker_reason}}
     ```

4. **Final Action**: Notion → Create Database Item (Automation Log)
   - Zap ID: `DEL-01` | Status: `Success` | Module: `Operations`
   - Notes: `SLA breach: {{client_name}} | {{package_type}} | Day {{days_elapsed}}`

**GHL workflow trigger**: Create a GHL Workflow → Trigger: `Opportunity Age` → Condition: age > 14 days (Starter) / 21 days (Growth) / 30 days (Scale) → Action: Send Webhook → URL: `DEL-01 webhook URL` with payload fields.

---

### DEL-02 — Client Onboarding Email

**Purpose**: Sends the welcome email the moment SAL-04 fires.

**Zapier setup:**
1. **Trigger**: Webhooks by Zapier → Catch Hook
   - Save as `DEL-02 webhook URL`
   - This URL goes into SAL-04 Action 3 above

2. **Action 1**: Gmail → Send Email
   - To: `{{client_email}}`
   - Subject: `Welcome to Myers Digital — Your Onboarding Starts Now 🚀`
   - Body: *(use welcome email from `aios/resources/client-onboarding-kit/welcome-email.md`)*

3. **Action 2**: Slack → Send Channel Message
   - Channel: `#aios-delivery`
   - Message:
     ```
     ✅ *New Client Onboarded — DEL-02*
     Client: {{client_name}}
     Package: {{package_type}}
     Kickoff: {{kickoff_date}}
     → Create GHL sub-account. Start delivery clock.
     ```

4. **Final Action**: Notion → Create Database Item (Automation Log)
   - Zap ID: `DEL-02` | Status: `Success` | Module: `Operations`
   - Notes: `Onboarding email sent: {{client_name}} | {{package_type}} | {{kickoff_date}}`

---

### DEL-03 — GHL Sub-Account Ready

**Purpose**: Sends platform access email when the GHL build is complete.

**Zapier setup:**
1. **Trigger**: Webhooks by Zapier → Catch Hook
   - Save as `DEL-03 webhook URL`
   - Fire manually (or from GHL workflow) when build is complete and tested

2. **Action 1**: Gmail → Send Email
   - To: `{{client_email}}`
   - Subject: `Your Myers Digital Platform is Live! 🎉`
   - Body: *(use DEL-03 email from SOP-27)*

3. **Action 2**: Slack → Send Channel Message
   - Channel: `#aios-delivery`
   - Message:
     ```
     🚀 *GHL Live — DEL-03*
     Client: {{client_name}} | Package: {{package_type}}
     Access email sent. Delivery clock: STOPPED ✅
     ```

4. **Final Action**: Notion → Create Database Item (Automation Log)
   - Zap ID: `DEL-03` | Status: `Success` | Module: `Operations`

---

### DEL-04 — Monthly Client Report

**Purpose**: Sends every active client their monthly performance report on the 1st.

**Zapier setup:**
1. **Trigger**: Schedule by Zapier → Every Month → Day 1, Time: 9:00 AM

2. **Action 1**: Notion → Find Database Items
   - Database: your Client Registry
   - Filter: Status = `Active`
   *(This will loop — Zapier will run Action 2 for each active client)*

3. **Action 2**: Gmail → Send Email (looped per client)
   - To: `{{client_email}}`
   - Subject: `{{report_month}} Performance Report — Myers Digital`
   - Body: *(pull from Notion KPI Snapshots for this client)*

4. **Final Action**: Notion → Create Database Item (Automation Log)
   - Zap ID: `DEL-04` | Status: `Success` | Module: `Operations`
   - Notes: `Monthly reports sent — {{today}}`

---

## SERIES 3 — FINANCE ZAPS (FIN)

---

### FIN-01 — Invoice Created

**Trigger**: Webhooks by Zapier → Catch Hook (fire from Director when Dustin says "create invoice")

**Actions**:
1. Your invoicing tool (Stripe/QuickBooks) → Create Invoice for `{{client_email}}` amount `{{amount}}`
2. Gmail → Send invoice email to `{{client_email}}`
3. Notion → Log to Automation Log

---

### FIN-02 — Payment Received

**Trigger**: Stripe → New Payment (or Charge Succeeded)
- Filter: Amount > 0, Status = `succeeded`

**Actions**:
1. Notion → Find client record → Update MRR field
2. Slack → `#aios-alerts`:
   ```
   💰 *Payment received — FIN-02*
   Client: {{customer_email}}
   Amount: ${{amount}}
   → MRR updated in Notion.
   ```
3. Notion → Log to Automation Log

---

### FIN-03 — Budget Variance Alert

**Trigger**: Webhooks by Zapier → Catch Hook (fired by Analytics agent when KPI variance > 20%)

**Actions**:
1. Slack → DM Dustin:
   ```
   ⚠️ *Budget Variance Alert — FIN-03*
   Metric: {{metric_name}}
   Expected: {{expected_value}}
   Actual: {{actual_value}}
   Variance: {{variance_pct}}%
   → Finance module review required.
   ```
2. Notion → Flag item in KPI Snapshots database
3. Notion → Log to Automation Log

---

### FIN-04 — Monthly P&L Report

**Trigger**: Schedule by Zapier → Every Month → Day 1, Time: 7:00 AM (fires before DEL-04)

**Actions**:
1. Notion → Retrieve all KPI Snapshots for the prior month
2. Gmail → Send P&L summary to `dustin@myersdigitalconsulting.com`
3. Slack → DM Dustin: `📊 Monthly P&L ready — check email.`
4. Notion → Log to Automation Log

---

## SERIES 4 — MARKETING ZAPS (MKT)

---

### MKT-01 — Lead Score > 80

**Trigger**: Webhooks by Zapier → Catch Hook (fired by CRM module when scoring runs)

**Actions**:
1. GoHighLevel → Add Tag: `hot-lead`
2. Slack → `#aios-alerts`: `🔥 Hot lead: {{contact_name}} scored {{score}}/100 — qualify now.`
3. Notion → Log to Automation Log

---

### MKT-02 — Content Published

**Trigger**: Schedule by Zapier → Every Week → Thursday, 8:00 AM

**Actions**:
1. Notion → Find approved content items (Status = `Approved`)
2. *(Connect your social scheduler — Buffer, Publer, or GHL Social Planner)*
   → Publish to LinkedIn, Facebook, Instagram
3. GoHighLevel → Update Social Planner post status to `Published`
4. Notion → Log to Automation Log

---

### MKT-03 — Campaign Launched

**Trigger**: Webhooks by Zapier → Catch Hook (fired by Director when Dustin approves a campaign)

**Actions**:
1. GoHighLevel → Start Workflow for campaign contacts
2. Slack → `#aios-delivery`: `🚀 Campaign launched: {{campaign_name}}`
3. Notion → Log campaign launch to KPI Snapshots
4. Notion → Log to Automation Log

---

## SERIES 5 — OPERATIONS ZAPS (OPS)

---

### OPS-02 — Capacity Alert

**Trigger**: Webhooks by Zapier → Catch Hook (fired when utilization > 85%)

**Actions**:
1. Slack → DM Dustin:
   ```
   ⚠️ *Capacity Alert — OPS-02*
   Utilization: {{utilization_pct}}%
   Active projects: {{active_count}}
   → HR module: assess contractor need.
   ```
2. Notion → Flag capacity status in Team Roster
3. Notion → Log to Automation Log

---

### OPS-03 — SOP Updated

**Trigger**: Notion → Updated Database Item (watch your SOP Library database)
- Filter: Last Edited Time changed

**Actions**:
1. Slack → `#aios-delivery`:
   ```
   📋 *SOP Updated — OPS-03*
   SOP: {{page_title}}
   Updated by: {{last_edited_by}}
   → Review if this affects your current workflow.
   ```
2. Notion → Log to Automation Log

---

## SERIES 6 — ANALYTICS ZAPS (DAT)

---

### DAT-01 — Daily KPI Digest ⭐ Most Important

**Trigger**: Schedule by Zapier → Every Day → 7:00 AM

**Actions**:
1. Notion → Find most recent KPI Snapshots record
2. Slack → DM Dustin:
   ```
   ☀️ *AIOS Daily Digest — {{today}}*

   💰 MRR: ${{mrr}}
   👥 Active Clients: {{client_count}}
   📋 Open Deliveries: {{open_deliveries}}
   ⚡ Automations (24h): {{automation_count}}
   🔥 Leads (24h): {{new_leads}}
   ⚠️ Alerts: {{alert_count}}

   {{anomaly_note if any}}
   ```
3. Notion → Log to Automation Log

---

### DAT-02 — Anomaly Detected

**Trigger**: Webhooks by Zapier → Catch Hook (fired by Analytics module)

**Actions**:
1. Slack → DM Dustin:
   ```
   🔔 *Anomaly Detected — DAT-02*
   Metric: {{metric_name}}
   Value: {{current_value}} (baseline: {{baseline_value}})
   Deviation: {{deviation_pct}}%
   → Review in Analytics module.
   ```
2. Notion → Flag in KPI Snapshots
3. Notion → Log to Automation Log

---

### DAT-03 — Weekly Business Report

**Trigger**: Schedule by Zapier → Every Week → Monday, 8:00 AM

**Actions**:
1. Notion → Retrieve all KPI Snapshots from the past 7 days
2. Gmail → Send weekly summary to `dustin@myersdigitalconsulting.com`
3. Slack → DM Dustin: `📊 Weekly report in your email.`
4. Notion → Log to Automation Log

---

## GHL WEBHOOK CONFIGURATION

### Where to set up webhooks in GHL:

**Option A — Settings > Integrations > Webhooks** (global, fires on all contacts)
- Best for: SAL-01 (lead captured from any source)
- Path: GHL → Settings → Integrations → Webhooks → + Add Webhook
- Events to map:
  - `Contact Created` → SAL-01 webhook URL
  - `Appointment Created` → SAL-02 webhook URL
  - `Opportunity Status Changed` → SAL-03 or SAL-04 (filter by stage in Zapier)

**Option B — Workflow → Send Webhook action** (targeted, fires on specific conditions)
- Best for: DEL-01 (SLA breach by age), MKT-01 (lead score), OPS-02 (capacity)
- Path: GHL → Automation → Workflows → + New Workflow
  1. Trigger: `Opportunity Age` (for SLA) OR `Tag Added` OR `Pipeline Stage Changed`
  2. Condition: set your threshold (e.g., age > 14 days)
  3. Action: `Webhook` → paste the relevant Zapier Catch Hook URL
  4. Body: use JSON format, map GHL fields to the payload keys

### Standard GHL → Zapier payload format:
```json
{
  "contact_id": "{{contact.id}}",
  "contact_name": "{{contact.name}}",
  "contact_email": "{{contact.email}}",
  "contact_phone": "{{contact.phone}}",
  "pipeline_stage": "{{opportunity.stage}}",
  "opportunity_name": "{{opportunity.name}}",
  "opportunity_value": "{{opportunity.monetary_value}}",
  "assigned_user": "{{assigned_user.name}}",
  "created_at": "{{opportunity.created_at}}"
}
```

---

## BUILD ORDER — Recommended Sequence

Set these up in this order so the chain works end-to-end:

| # | Zap | Why this order |
|---|---|---|
| 1 | DAT-01 | Confirms Notion + Slack are wired — daily proof it works |
| 2 | SAL-01 | First revenue touchpoint — every new lead captured |
| 3 | SAL-04 | Closes the loop on won deals |
| 4 | DEL-02 | SAL-04 depends on this URL — build it before testing SAL-04 |
| 5 | DEL-01 | SLA protection — critical for client delivery |
| 6 | DEL-04 | Monthly report automation |
| 7 | FIN-02 | MRR tracking from Stripe |
| 8 | SAL-02 | Discovery call confirmations |
| 9 | SAL-03 | Proposal follow-up |
| 10 | DEL-03 | Go-live email |
| 11 | FIN-01 | Invoice creation |
| 12 | FIN-04 | Monthly P&L |
| 13 | FIN-03 | Budget variance alerts |
| 14 | MKT-01 | Hot lead scoring |
| 15 | MKT-02 | Content publishing |
| 16 | MKT-03 | Campaign launch |
| 17 | OPS-02 | Capacity monitoring |
| 18 | OPS-03 | SOP change notifications |
| 19 | DAT-02 | Anomaly alerts |
| 20 | DAT-03 | Weekly report |

---

## Testing Each Zap

After building each Zap:

1. In Zapier → Test Trigger (send a sample payload)
2. Verify the Slack message arrived in the correct channel/DM
3. Check Notion Automation Log — a new row should appear with Status: `Success`
4. For GHL Zaps: manually trigger from GHL and confirm end-to-end

**Test payload for any webhook Zap (paste into Zapier test):**
```json
{
  "client_name": "Test Client",
  "client_email": "test@testclient.com",
  "package_type": "Growth",
  "days_elapsed": "22",
  "sla_days": "21",
  "blocker_reason": "Test run — ignore"
}
```

---

## Connector Registry (Paste in Notion)

Create a table in Notion with these columns:

| Zap ID | Name | Webhook URL | Status | Last Tested |
|---|---|---|---|---|
| SAL-01 | Lead Captured | [paste URL] | Active | |
| SAL-02 | Discovery Call Booked | — (GHL trigger) | Active | |
| SAL-03 | Proposal Sent | — (GHL trigger) | Active | |
| SAL-04 | Deal Closed Won | — (GHL trigger) | Active | |
| DEL-01 | SLA Breach Alert | [paste URL] | Active | |
| DEL-02 | Client Onboarding Email | [paste URL] | Active | |
| DEL-03 | GHL Sub-Account Ready | [paste URL] | Active | |
| DEL-04 | Monthly Client Report | — (scheduled) | Active | |
| FIN-01 | Invoice Created | [paste URL] | Active | |
| FIN-02 | Payment Received | — (Stripe trigger) | Active | |
| FIN-03 | Budget Variance Alert | [paste URL] | Active | |
| FIN-04 | Monthly P&L | — (scheduled) | Active | |
| MKT-01 | Lead Score >80 | [paste URL] | Active | |
| MKT-02 | Content Published | — (scheduled) | Active | |
| MKT-03 | Campaign Launched | [paste URL] | Active | |
| OPS-02 | Capacity Alert | [paste URL] | Active | |
| OPS-03 | SOP Updated | — (Notion trigger) | Active | |
| DAT-01 | Daily KPI Digest | — (scheduled) | Active | |
| DAT-02 | Anomaly Detected | [paste URL] | Active | |
| DAT-03 | Weekly Report | — (scheduled) | Active | |
