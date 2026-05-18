# SOP-22 — Meta Ads Manager

**Version**: 1.0
**Skill**: Meta Ads Manager
**Status**: Active

---

## Purpose
Manage Myers Digital's Facebook and Instagram paid campaigns — from launching new creative to daily optimization and weekly reporting. Always spending where data says to spend.

## Campaign Structure
- **Cold layer**: Lookalike 1–3% from client list — $30–50/day — goal: CPL < $30
- **Warm layer**: Website visitors 30 days — $20/day — goal: re-engage
- **Hot layer**: Lead form openers, 75%+ video viewers — $15/day — goal: drive bookings

## New Campaign Launch Steps
1. ScrollStopperAd agent builds 2 creative variants (Revenue Gap + Speed Problem)
2. Meta Ads Manager creates campaign in PAUSED state via `create_meta_campaign`
3. Sets audience targeting (service biz owners 35–55, home services interests)
4. Attaches 2 creative variants as separate ads in same ad set
5. Dustin reviews and activates
6. GHL webhook connected to Meta Lead Form (ADS-01)

## Daily Optimization Rules (automated)
- Pull insights every morning via `get_meta_ad_insights`
- If CPL > $50 after $100 spend → pause via `pause_meta_ad` + notify Dustin
- If frequency > 4.0 → pause ad set, request new creative from ScrollStopperAd
- If CTR > 2.5% + CPL < $20 → recommend 20% budget increase to Dustin

## Weekly Reporting (Friday 4 PM)
- Total spend, leads, CPL per campaign
- Best-performing creative hook
- Recommended actions for next week
- Written to Notion KPI Snapshots

## Webhook Trigger
`POST /webhooks/ads/meta-lead` — routes Meta lead form submission to GHL CRM agent
`POST /webhooks/ads/meta-alert` — handles Zapier-triggered spend/performance alerts
`POST /webhooks/ads/performance` — triggers full performance review

## Performance Benchmarks
| Metric | Target | Pause | Scale |
|--------|--------|-------|-------|
| CTR | > 1.5% | < 0.8% | > 2.5% |
| CPL | < $30 | > $50 | < $20 |
| Frequency | < 3.0 | > 4.0 | — |
