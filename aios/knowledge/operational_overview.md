# Operational Overview — Myers Digital Consulting
**Version**: 1.0 | **Date**: 2026-05-26

---

## Business Operations Summary

Myers Digital Consulting operates as a lean, AI-first consulting agency. The operator (Dustin Myers) runs the business with AI agents handling the majority of operational tasks — routing, reporting, content creation, client management, and delivery tracking — autonomously.

---

## Client Lifecycle

```
LEAD → QUALIFIED → DEMO → PROPOSAL → CLOSED WON → ONBOARDING → ACTIVE CLIENT → MONTHLY REVIEW
```

### 1. Lead Acquisition
- **Sources**: Meta Ads, LinkedIn organic, newsletter, referrals
- **Auto-routing**: New leads from Meta → GHL webhook → CRM agent creates record
- **SLA**: Qualify within 24 hours

### 2. Qualification
- 3 qualifying questions (revenue, pain, GHL status)
- AiosSales agent runs qualification automatically for web inquiries
- Score: 2/3 positive → qualified; <2 → politely disengage

### 3. Discovery Demo
- 30-minute live demo — no slides, system live
- Director shows 3 real business scenarios
- Outcome logged → Day 1 follow-up auto-queued

### 4. Proposal → Close
- Custom proposal built by AiosSales agent
- Follow-up sequence: D1, D3, D7 post-demo
- Closed Won fires: SAL-04 → DEL-02 chain

### 5. Onboarding (10-day build)
- **Day 1–2**: GHL sub-account + CRM/pipeline setup
- **Day 3–4**: Missed Call Text-Back + Calendar
- **Day 5**: Lead Capture Funnel live
- **Day 6–7**: SMS + Email Automation
- **Day 8**: Workflow Automation
- **Day 9**: Reputation Management
- **Day 10**: Analytics Dashboard + client launch call

### 6. Active Client (Monthly)
- Monthly client report by 5th of each month
- Monthly check-in call (first Monday of month)
- Health score monitored weekly by CRM agent
- Churn risk > 15% ARR → immediate escalation

---

## Recurring Operations

| Frequency | Operation | Owner | Automation |
|---|---|---|---|
| Daily 7 AM | KPI Digest | Analytics Agent | DAT-01 |
| Daily 9 AM | Transcript Mining | TranscriptMiner Agent | — |
| Monday 7 AM | Cost Breakdown Report | CostBreakdown Agent | — |
| Monday 8 AM | Weekly Business Report | Director Agent | — |
| Monday 8:30 AM | Content Calendar Planning | ContentCalendar Agent | MKT-02 |
| Tuesday 9 AM | Social Posts Drafted | SocialMediaManager | — |
| Tuesday 10 AM | Newsletter Draft | Marketing → NewsletterWriter | — |
| Thursday 8 AM | Publish Approved Content | SocialMediaManager | — |
| Friday 4 PM | Ad Performance Review | AdPerformance Agent | — |
| 1st of Month | Bookkeeping Trigger | Bookkeeping Agent | OPS-01 |
| 1st Monday | Monthly Finance Report | Director → Finance | FIN-04 |
| 1st of Month | Monthly Client Reports | Operations Agent | DEL-04 |

---

## SLA Standards

| Metric | Target |
|---|---|
| New lead response | < 24 hours |
| Client communication response | < 4 business hours |
| GHL onboarding delivery | 10 business days |
| Monthly report delivery | By 5th of each month |
| Critical support ticket | < 4 hours |
| Standard support ticket | < 24 hours |

---

## Escalation Thresholds

Immediate Dustin notification required when:
- Security breach or suspicious login detected
- Financial variance > 20% from monthly forecast
- Legal deadline within 72 hours
- Client churn risk on any account > 15% of total ARR
- GHL system failure affecting active client builds
- Any failed automation that blocks client delivery

---

## Pain Points Being Actively Solved

1. **Content bottleneck** — Director now routes to ContentCalendar + SocialMedia + NewsletterWriter automatically
2. **Manual reporting** — Analytics agent runs daily/weekly/monthly with zero intervention
3. **Sales follow-up gaps** — AiosSales agent manages full sequence
4. **Ad management overhead** — MetaAds + GoogleAds agents monitor and adjust
5. **Bookkeeping lag** — Monthly trigger auto-fires; Bookkeeping agent categorizes on demand
