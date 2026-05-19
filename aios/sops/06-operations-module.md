# SOP-06 — Operations Module

**Version**: 1.0
**Module**: Operations
**Status**: Active

---

## Purpose
Oversee GHL implementation delivery, client SLAs, capacity, and operational efficiency.

## Trigger
Any directive involving delivery timelines, client setups, SLA compliance, or capacity.

## Myers Digital GHL Onboarding Process

### For Starter Package (Target: 5 business days)
- [ ] Day 1: Create GHL sub-account, configure CRM pipeline stages, import existing contacts
- [ ] Day 2: Set up missed call text-back, connect phone number
- [ ] Day 3: Configure appointment calendar, confirmation sequences
- [ ] Day 4: Build review request workflow
- [ ] Day 5: Test all automations, train client, go-live

### For Growth Package (Target: 10 business days)
All Starter steps plus:
- [ ] Day 3-5: Build lead capture funnel (headline, form, thank-you page)
- [ ] Day 5-7: Build SMS and email automation sequences
- [ ] Day 7-9: Configure workflow automation for top 3 processes
- [ ] Day 9-10: Analytics dashboard setup, client training

### For Scale Package (Target: 15 business days)
All Growth steps plus:
- [ ] Day 8-11: AI Conversation Management setup and training
- [ ] Day 10-12: Sales funnel build (VSL or offer page)
- [ ] Day 11-13: Call tracking setup across all marketing channels
- [ ] Day 12-14: Multi-channel messaging configuration
- [ ] Day 14-15: Full system test, database reactivation campaign, go-live

## SLA Standards
- Client response time: < 4 business hours
- Setup delivery: per package timeline above
- Monthly report delivery: by 5th of each month
- Support ticket resolution: < 24 hours (< 4 hours for critical)

## SLA Alert Thresholds

| Package | Delivery Target | Alert At | Breach (DEL-01 fires) |
|---|---|---|---|
| Starter | 5 business days | > 7 days | > 14 days |
| Growth | 10 business days | > 14 days | > 21 days |
| Scale | 15 business days | > 21 days | > 30 days |

## Escalation
- SLA breach → `DEL-01` Zapier alert → Director notification (see SOP-27)
- Capacity > 85% → `OPS-02` + HR module trigger
