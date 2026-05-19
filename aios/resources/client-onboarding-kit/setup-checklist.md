# AIOS Client Setup Checklist
# Internal — Myers Digital team use during the 7–10 day build

**Client**: {client_name}
**Package**: {package_type}
**Kickoff Date**: {kickoff_date}
**SLA Target**: {sla_days} business days
**SLA Deadline**: {sla_deadline}
**Assigned**: {team_member}

---

## Phase 1 — Foundation (Days 1–2)

### Notion Workspace
- [ ] Create client Notion workspace (or configure existing)
- [ ] Build all 8 core databases:
  - [ ] Client Registry
  - [ ] GHL Project Tracker
  - [ ] AIOS Automation Log
  - [ ] AIOS Decision Log
  - [ ] AIOS KPI Snapshots
  - [ ] Content Hook Library
  - [ ] AIOS Sales Pipeline
  - [ ] AIOS Team Roster
- [ ] Import client-specific data (contacts, existing clients, revenue history if available)
- [ ] Share workspace with client, confirm access

### AIOS Core Files
- [ ] Create client CLAUDE.md from white-label template
- [ ] Customize all {BUSINESS_NAME}, {OWNER_NAME}, {PACKAGES} placeholders
- [ ] Create client MEMORY.md with initial active projects and core memory
- [ ] Load Director skill into client workspace
- [ ] Confirm skill routing map matches client's business domains

---

## Phase 2 — GHL Integration (Days 2–4)

- [ ] Create GHL sub-account (or configure existing agency account)
- [ ] Set up CRM pipeline stages (customize to client's sales process)
- [ ] Import existing contacts (if migrating)
- [ ] Configure missed call text-back
- [ ] Connect business phone number
- [ ] Set up appointment calendar + confirmation sequences
- [ ] Build review request workflow
- [ ] Test all GHL automations end-to-end

**Growth + Full Stack only:**
- [ ] Build lead capture funnel (headline, form, thank-you page)
- [ ] Build SMS automation sequences (5-touch minimum)
- [ ] Build email automation sequences (welcome + nurture)
- [ ] Configure top 3 workflow automations for client's process

**Full Stack only:**
- [ ] AI Conversation Management setup and training
- [ ] Sales funnel (VSL or offer page)
- [ ] Call tracking across all marketing channels
- [ ] Multi-channel messaging configuration

---

## Phase 3 — Zapier Automation Stack (Days 3–5)

### Core Automations (all tiers)
- [ ] DAT-01 — Daily KPI Digest (7 AM, Slack → Dustin/client)
- [ ] DEL-01 — SLA Breach Alert (threshold: {alert_days} days)
- [ ] DEL-04 — Monthly Client Report (1st business day of month)
- [ ] OPS-02 — Capacity Alert (if applicable)

### Growth + Full Stack
- [ ] SAL-01 — Lead Captured (website form → GHL + Slack)
- [ ] SAL-02 — Discovery Call Booked (calendar → confirm sequence)
- [ ] SAL-04 — Deal Closed Won (CRM stage → onboarding trigger)
- [ ] MKT-02 — Content Published (schedule → multi-channel post)
- [ ] DAT-02 — Anomaly Detection (KPI threshold → Director escalation)

### Full Stack
- [ ] SAL-03 — Proposal Sent (CRM → follow-up sequence)
- [ ] FIN-01 — Invoice Created (Director trigger → client email)
- [ ] FIN-02 — Payment Received (Stripe → MRR update)
- [ ] MKT-03 — Campaign Launched (Director approval → activate)

**Zapier test run:** Trigger each active Zap manually and confirm end-to-end execution.

---

## Phase 4 — Specialist Agents (Days 5–7)

### Starter
- [ ] Meeting Transcript Task Creator — configured and tested
- [ ] GEO/SEO Auditor — configured for client's market + location
- [ ] Bookkeeping Categorizer — loaded with client's expense categories

### Growth
- [ ] All Starter agents, plus:
- [ ] Transcript Miner & Ad Builder — voice sample loaded
- [ ] Newsletter Writer — Dustin Voice equivalent trained for client
- [ ] Content Calendar — first week planned
- [ ] Social Media Manager — all platforms connected

### Full Stack
- [ ] All Growth agents, plus:
- [ ] Meta Ads Manager — account connected, rules configured
- [ ] Google Ads Manager — account connected, bid rules set
- [ ] Sales Call Coach — rubric customized to client's process
- [ ] Scroll-Stopper Ad Skill — brand voice and creative samples loaded
- [ ] Ad Performance Monitor — connected to client ad accounts
- [ ] Cost Breakdown Analyst — all cost sources registered

---

## Phase 5 — Voice Training (Days 6–7)

- [ ] Intake form voice examples reviewed
- [ ] Voice Layer calibrated (3 test outputs in client's voice reviewed and approved)
- [ ] Dustin Voice Skill equivalent personalized for this client
- [ ] At least 2 outputs reviewed by client and confirmed as "on brand"

---

## Phase 6 — Testing & Go-Live (Days 7–10)

### System Test Scenarios
- [ ] Director routes 3 live business scenarios correctly
- [ ] All active Zaps fire and complete without errors
- [ ] Notion logs are being written after each action
- [ ] All specialist agents return clean, on-brand outputs
- [ ] DEL-01 SLA alert fires correctly on test threshold
- [ ] DAT-01 digest fires at 7 AM (test on a real day or simulate)

### Client Handoff
- [ ] Send DEL-03 GHL access email (platform login + credentials)
- [ ] Record 10-min Loom walkthrough of their specific AIOS setup
- [ ] Schedule 30-min handoff call (walk client through Director live)
- [ ] Deliver AIOS Quick Reference Guide (customized from template)
- [ ] Confirm client can successfully route a directive through Director

### Final Checks
- [ ] All SLA timelines confirmed met (log to Notion + Slack #aios-delivery)
- [ ] Delivery clock stopped — log to Notion
- [ ] Client satisfaction confirmed at handoff call
- [ ] Upsell opportunity noted (if applicable) → CRM stage updated

---

## Milestone Log

| Milestone | Date Completed | Notes |
|---|---|---|
| Intake form received | | |
| Notion workspace live | | |
| GHL sub-account created | | |
| Zapier stack activated | | |
| Voice training complete | | |
| System test passed | | |
| Client handoff call done | | |
| Go-live confirmed | | |
