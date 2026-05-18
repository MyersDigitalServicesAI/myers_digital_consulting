# SOP-25 — Ad Performance Monitor

**Version**: 1.0
**Skill**: Ad Performance Monitor
**Status**: Active

---

## Purpose
Aggregate paid ad performance across Meta, Google, and LinkedIn — identify winners, flag budget waste, and recommend specific actions every Friday.

## Trigger
- **Automated**: Runs every Friday at 4:00 PM
- **Manual**: `POST /webhooks/ads/performance` from Dustin or Zapier

## Weekly Review Steps
1. Pull Meta Ads insights for last 7 days via `get_meta_ad_insights`
2. Pull Google Ads performance via `get_google_ad_performance`
3. Calculate blended CPL (total spend / total leads, all platforms)
4. Score each creative 1–10 (CTR + CPL + lead quality)
5. Identify highest and lowest performers
6. Run `recommend_budget_action` for each active campaign
7. Generate `generate_ad_performance_report` and write to Notion KPI Snapshots
8. Notify Dustin via Slack with summary + 3 recommended actions

## Real-Time Alerts (trigger immediately)
- Any campaign spending > $100/day with 0 conversions
- CPL doubles week-over-week on any platform
- Any ad account balance running low (< 3 days of budget remaining)
- Any creative achieves CTR > 3% (scale opportunity)

## Budget Allocation Defaults
- 50% Meta Ads (cold traffic)
- 25% Google Search (high-intent)
- 15% Meta Retargeting (warm)
- 10% LinkedIn (B2B)
Rebalance monthly toward cheapest CPL platform.

## Webhook Trigger
`POST /webhooks/ads/performance` — triggers review immediately
`POST /webhooks/ads/meta-alert` — handles live Zapier alerts from Meta

## Performance Benchmarks
| Platform | Target CPL | Pause CPL | Scale CPL |
|----------|-----------|-----------|-----------|
| Meta | < $30 | > $50 | < $20 |
| Google | < $40 | > $65 | < $25 |
| LinkedIn | < $75 | > $120 | < $50 |
