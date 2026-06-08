# SOP-26 — Cost Breakdown Analyst

**Version**: 1.0
**Skill**: Cost Breakdown Analyst
**Status**: Active

---

## Purpose
Track and report the operational cost of every AIOS agent — what each one costs per run, per day, and per month — so Dustin always knows the ROI of the system and can act on cost spikes before they compound.

## Trigger
- **Automated**: Runs every Monday at 7:00 AM (before the weekly business report)
- **Manual**: `POST /webhooks/cost/breakdown` from Dustin or Zapier

## Weekly Analysis Steps
1. Call `get_cost_model` to fetch the full agent cost table (sorted by daily cost descending)
2. Identify top 5 agents by daily cost driver
3. Identify top 5 agents by cost-per-run (high cost, low frequency agents)
4. Calculate total daily, monthly, and annual projections
5. Check against budget thresholds (see below)
6. Write KPI Snapshot to Notion: metric = "AIOS Weekly Spend", value = total daily cost
7. Write Module Memory entry with full breakdown
8. Notify Dustin via Slack with summary + recommendations

## Budget Thresholds
| Condition | Action |
|-----------|--------|
| Daily total > $5.00 | Alert Dustin immediately via Slack |
| Single run > $0.50 | Flag agent for context caching review |
| Monthly > $150.00 | Escalate to Director for budget review |

## Webhook Trigger
`POST /webhooks/cost/breakdown` — runs full on-demand cost analysis with optimization recommendations

## Agent Cost Benchmarks
**Director**: `claude-opus-4-8` · Input: $5.00/1M · Output: $25.00/1M
**All other 23 agents**: `claude-sonnet-4-6` · Input: $3.00/1M · Output: $15.00/1M

| Agent | Model | Est. Input/Run | Est. Output/Run | Cost/Run | Runs/Day | Daily Cost |
|-------|-------|---------------|-----------------|----------|----------|------------|
| Director | Opus 4.8 | 8,500 | 4,500 | $0.1550 | 5.0 | $0.7750 |
| SalesCallCoach | Sonnet 4.6 | 9,500 | 5,500 | $0.1110 | 2.0 | $0.2220 |
| AiosSales | Sonnet 4.6 | 9,000 | 5,000 | $0.1020 | 2.0 | $0.2040 |
| CRM | Sonnet 4.6 | 6,500 | 2,500 | $0.0570 | 3.0 | $0.1710 |
| MeetingTranscript | Sonnet 4.6 | 7,000 | 3,500 | $0.0735 | 2.0 | $0.1470 |
| MetaAdsManager | Sonnet 4.6 | 8,500 | 4,500 | $0.0930 | 1.0 | $0.0930 |
| TranscriptMiner | Sonnet 4.6 | 8,500 | 4,000 | $0.0855 | 1.0 | $0.0855 |
| SocialMediaManager | Sonnet 4.6 | 8,000 | 4,000 | $0.0840 | 1.0 | $0.0840 |
| Analytics | Sonnet 4.6 | 7,000 | 3,500 | $0.0735 | 1.0 | $0.0735 |
| GeoSEOAuditor | Sonnet 4.6 | 9,000 | 5,000 | $0.1020 | 0.5 | $0.0510 |
| NewsletterWriter | Sonnet 4.6 | 9,500 | 6,000 | $0.1185 | 0.14 | $0.0166 |
| ScrollStopperAd | Sonnet 4.6 | 9,000 | 5,000 | $0.1020 | 0.14 | $0.0143 |
| ContentCalendar | Sonnet 4.6 | 9,000 | 5,000 | $0.1020 | 0.14 | $0.0143 |
| AdPerformance | Sonnet 4.6 | 9,000 | 5,000 | $0.1020 | 0.14 | $0.0143 |
| GoogleAdsManager | Sonnet 4.6 | 8,000 | 4,000 | $0.0840 | 0.14 | $0.0118 |
| WorkspaceArchitect | Sonnet 4.6 | 8,000 | 4,000 | $0.0840 | 0.14 | $0.0118 |
| CostBreakdown | Sonnet 4.6 | 7,500 | 4,000 | $0.0825 | 0.14 | $0.0116 |
| Marketing | Sonnet 4.6 | 6,500 | 2,500 | $0.0570 | 0.14 | $0.0080 |
| Security | Sonnet 4.6 | 6,500 | 2,500 | $0.0570 | 0.14 | $0.0080 |
| Operations | Sonnet 4.6 | 5,500 | 2,000 | $0.0465 | 0.14 | $0.0065 |
| HR | Sonnet 4.6 | 5,500 | 2,000 | $0.0465 | 0.14 | $0.0065 |
| Finance | Sonnet 4.6 | 7,000 | 3,000 | $0.0660 | 0.07 | $0.0046 |
| Bookkeeping | Sonnet 4.6 | 7,000 | 3,000 | $0.0660 | 0.07 | $0.0046 |
| Legal | Sonnet 4.6 | 6,500 | 2,500 | $0.0570 | 0.07 | $0.0040 |

**Total estimated daily cost: ~$2.04 · Monthly: ~$61.28 · Annual: ~$735.38**
*29% cost reduction vs all-Opus baseline ($2.89/day → $2.04/day)*

## Optimization Opportunities
1. **Prompt caching** on Director, SalesCallCoach, NewsletterWriter — system prompts are stable, caching saves ~80% on input tokens for repeated runs
2. **Model downgrade** for Bookkeeping and MeetingTranscript reminder flows → `claude-haiku-4-5` ($0.25/$1.25 per 1M) cuts cost 20x on simple tasks
3. **Batch webhook triggers** — if multiple leads arrive within 5 minutes, process as a batch rather than individual CRM runs
