# Process Map — Myers Digital Consulting AIOS
**Version**: 1.0 | **Date**: 2026-05-26

---

## Core Business Processes

---

### PROCESS 1: Client Acquisition Pipeline

```
AWARENESS
  ↓ (Meta Ads / LinkedIn / Newsletter / Referral)
LEAD CAPTURE
  ↓ (GHL webhook fires → CRM agent creates record)
QUALIFICATION [AiosSales Agent]
  ↓ (3 questions: revenue, pain, GHL status)
  ├─ < 2/3 positive → DISQUALIFY (log + nurture)
  └─ ≥ 2/3 positive → QUALIFIED
        ↓
     DEMO BOOKED [AiosSales Agent]
        ↓ (calendar invite + Dustin context brief)
     DEMO DELIVERED [Dustin]
        ↓
     FOLLOW-UP SEQUENCE [AiosSales Agent]
        ├─ D+1: Value recap email
        ├─ D+3: Case result + CTA
        └─ D+7: Final value + price lock urgency
              ↓
           PROPOSAL SENT [AiosSales Agent]
              ├─ D+2: "Any questions?"
              ├─ D+5: Objection anticipation
              └─ D+10: Final close or disqualify
                    ↓
                 CLOSED WON → ONBOARDING CHAIN
                 CLOSED LOST → LOG + NURTURE LIST
```

---

### PROCESS 2: Client Onboarding (10-Day Build)

```
CLOSED WON EVENT
  ↓
SAL-04 fires → DEL-02 chain activates
  ↓
DAY 1-2: GHL sub-account provisioned
  - CRM + pipeline configured
  - Invoice sent (Finance agent)
  - Welcome sequence fired
  ↓
DAY 3-4: Core automation built
  - Missed Call Text-Back
  - Calendar booking
  ↓
DAY 5: Lead Capture Funnel
  - Landing page live
  - Forms connected to CRM
  ↓
DAY 6-7: Nurture Automation
  - SMS sequences
  - Email automation
  ↓
DAY 8: Workflow Automation
  - Internal automation rules
  ↓
DAY 9: Reputation Management
  - Review request sequences
  ↓
DAY 10: Launch
  - Analytics dashboard live
  - Client launch call
  - Handoff to monthly management
```

---

### PROCESS 3: Weekly Content Engine

```
MONDAY 8:30 AM
  ↓ ContentCalendar Agent runs
  - Pulls top hook from Notion Module Memory
  - Plans full week: LinkedIn (5), FB (3), IG (5)
  - Briefs Newsletter + Ad agents
  ↓
TUESDAY 9:00 AM
  ↓ SocialMediaManager drafts all posts
  - All posts saved as "Awaiting Review"
  ↓
TUESDAY 10:00 AM
  ↓ NewsletterWriter drafts
  - 7-part framework
  - 2 subject line variants
  - Saved for Wednesday review
  ↓
WEDNESDAY: Dustin reviews + approves
  ↓
THURSDAY 8:00 AM
  ↓ SocialMediaManager publishes approved posts
  - Post IDs logged to Notion
  ↓
FRIDAY 4:00 PM
  ↓ AdPerformance Review runs
  - Week's results analyzed
  - Recommendations to Notion + Dustin
```

---

### PROCESS 4: Intelligence Flywheel

```
SALES CALL HAPPENS
  ↓
POST /webhooks/transcript (or Zapier)
  ↓
TranscriptMiner mines for hooks (7+ threshold)
  ↓
Hooks saved to Notion Module Memory
  ↓
ContentCalendar pulls top hook (Monday)
  ├─ → Newsletter brief (NewsletterWriter)
  ├─ → Meta ad brief (ScrollStopperAd)
  └─ → LinkedIn + social posts (SocialMediaManager)
        ↓
     Content published
        ↓
     Lead generated
        ↓
     Another sales call → LOOP
```

---

### PROCESS 5: Financial Operations

```
MONTHLY TRIGGER (1st of month)
  ↓ Bookkeeping agent notifies Dustin
DUSTIN exports bank/CC transactions
  ↓
POST /webhooks/cost/breakdown (or Dustin uploads)
  ↓
Bookkeeping agent categorizes:
  - Business expenses (100% deductible)
  - Mixed (flagged for review)
  - Personal (flagged, non-deductible)
  ↓
Export prepared for QBO import
  ↓
FIRST MONDAY (Finance Report)
  ↓ Director routes to Finance
  - MRR by tier calculated
  - Total revenue (setup + MRR)
  - Net profit + margin
  - Overdue invoices flagged
  - Written to Notion KPI Snapshots
  - Dustin notified via Slack
```

---

### PROCESS 6: Escalation Chain

```
ANY AGENT DETECTS THRESHOLD BREACH
  ↓
Immediate Director notification
  ↓
Director assesses:
  ├─ Security breach → SEC-01 + Dustin Slack (immediate)
  ├─ Financial variance > 20% → FIN escalation + Dustin (same day)
  ├─ Legal deadline < 72h → LEG-01 + Dustin (immediate)
  └─ Churn risk > 15% ARR → CRM escalation + Dustin (same day)
        ↓
     Dustin reviews + approves response
        ↓
     Director coordinates resolution
        ↓
     Incident logged to Notion
```

---

## Bottleneck Register

| Process | Current Bottleneck | Status |
|---|---|---|
| Transcript submission | Manual upload (no auto-record) | Known — Zapier Loom integration planned |
| Social approval | Dustin reviews Tuesday drafts | Acceptable — 1 approval point |
| Bookkeeping | Dustin exports manually | Known — bank feed connection planned |
| GHL builds | Contractor dependency for complex builds | Managed — Alex Rivera assigned |
