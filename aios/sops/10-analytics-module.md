# SOP-10 — Analytics Module

**Version**: 1.0
**Module**: Analytics
**Status**: Active

---

## Purpose
Provide cross-module business intelligence, trend analysis, and the daily/weekly digest for Myers Digital.

## Trigger
Any directive involving reporting, trends, or business health overview.

## Daily Digest (DAT-SOP-01)
**Fires at 7:00 AM daily via `DAT-01` Zapier**

1. Pull all KPI Snapshots (Period = "current") from Notion
2. Compare to previous day's values
3. Flag any metric that moved > 10% in 24 hours
4. Check Automation Log for any failed Zaps
5. Generate digest in Analytics Module format
6. Post to #aios-daily Slack channel

## Weekly Report (DAT-SOP-02)
**Fires Monday 8:00 AM via `DAT-03` Zapier**

1. Pull all KPIs for the week (current vs. prior week)
2. Compute WoW deltas for all metrics
3. Identify top 3 trends (positive and negative)
4. Surface 1 cross-module insight (e.g., "Marketing leads up but pipeline coverage down — follow-up gap?")
5. Recommend 2 focus areas for the coming week
6. Email to Callan + post to Slack

## Anomaly Detection (DAT-SOP-03)
**Continuous via DAT-02**

Anomaly triggers:
- Any KPI crossing its Alert threshold
- MRR declining 2 months in a row
- Delivery rate dropping below 85%
- 0 new leads in 5+ business days
- 3+ failed Zapier automations in 24 hours

Response: Director escalation + Callan notification.
