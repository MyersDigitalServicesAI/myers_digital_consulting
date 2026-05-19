# SOP-29 — AIOS Sales

**Version**: 1.0
**Skill**: AIOS Sales Workstation
**Status**: Active
**Last Reviewed**: 2026-05-19

---

## Purpose

Systematize the entire AIOS sales process — from inbound inquiry to closed client — so Dustin can move fast, qualify ruthlessly, and close without chasing.

---

## Trigger Phrases

| Dustin Says | Action |
|---|---|
| "Someone just filled out the demo form" | Run qualification, draft response |
| "Draft a proposal for [prospect]" | Build custom proposal from inputs |
| "How do I respond to [objection]" | Load objection playbook |
| "Follow up with [prospect]" | Draft next follow-up in sequence |
| "What's my sales pipeline?" | Pull GHL + Notion pipeline status |
| "Close [prospect]" | Draft final close message |
| "Disqualify [prospect]" | Log loss reason, add to nurture list |

---

## Full Sales Process

### Stage 1 — Inquiry (0–24 hours)

1. Prospect submits demo form or reaches out directly
2. AIOS Sales Agent qualifies using 3-question framework
3. If qualified: book demo, send calendar link, log to GHL
4. If not qualified: log to nurture list, send polite redirect
5. Log to Notion Sales Pipeline

### Stage 2 — Demo (Day 1–7 post-inquiry)

**Pre-demo prep (load into context):**
- Prospect's business type, revenue, pain point
- Recommended tier based on qualifying info
- Any social proof most relevant to their industry

**Demo structure (30 minutes):**
1. 5 min — Confirm their situation ("So you're running X doing Y — biggest bottleneck is Z?")
2. 10 min — Show Director routing a real business scenario live
3. 10 min — Walk the 3 agents most relevant to their pain
4. 5 min — Show the automation schedule (DAT-01, DEL-04, etc.)
5. Close: "Does this solve what you described?" → move to proposal

### Stage 3 — Proposal (Day 1 post-demo)

Send same day or next morning. Use the Proposal Builder in the AIOS Sales Skill.
- Keep it under 1 page
- Lead with their pain, not the feature list
- Include founding price lock status

### Stage 4 — Follow-Up (Days 1, 3, 7 post-proposal)

Follow-up sequences defined in AIOS Sales Skill. Never follow up more than 3 times without a decision.

### Stage 5 — Close

- Closed Won → fire SAL-04 → triggers DEL-02 (onboarding email)
- Closed Lost → log reason + add to 90-day nurture list

---

## White-Label / Partner Inquiries

When an agency or consultant asks about reselling AIOS to their own clients:

1. Qualify using standard ICP (but focus on their client roster, not their own revenue)
2. Explain the Partner Program:
   - Myers Digital builds and maintains the AIOS instance
   - Partner white-labels under their own brand
   - Partner pays Myers Digital wholesale; charges client retail
   - Setup: $5,000–$10,000 per client instance
   - Monthly: $500–$1,500 per client instance (partner keeps the margin spread)
3. Minimum commitment: 3 client deployments within 90 days
4. Dustin approval required before any Partner agreement is signed

---

## Key Metrics to Track

| Metric | Target |
|---|---|
| Inquiry → Demo Rate | > 60% |
| Demo → Proposal Rate | > 70% |
| Proposal → Close Rate | > 40% |
| Avg Days to Close | < 14 days |
| Lost Deal Recovery (90-day) | > 20% |

---

## Notion Databases Used

- `AIOS Sales Pipeline` — all prospects, stages, next actions
- `AIOS Decision Log` — close/lost decisions with reasoning
- `AIOS Client Registry` — all closed won clients (handed to Operations)

---

## Related SOPs

- `SOP-04` — CRM Module (pipeline management)
- `SOP-06` — Operations Module (post-close delivery)
- `SOP-27` — Client Delivery Automations (DEL-02 fires on close)
- `SOP-17` — Dustin Voice Skill (all prospect-facing copy)
