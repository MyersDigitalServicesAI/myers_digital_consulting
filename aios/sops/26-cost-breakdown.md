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
All agents run `claude-opus-4-7` · Input: $5.00/1M tokens · Output: $25.00/1M tokens

| Agent | Est. Input Tokens/Run | Est. Output Tokens/Run | Cost/Run | Runs/Day | Daily Cost |
|-------|----------------------|------------------------|----------|----------|------------|
| Director | 8,500 | 4,500 | $0.1550 | 5.0 | $0.7750 |
| SalesCallCoach | 9,500 | 5,500 | $0.1850 | 2.0 | $0.3700 |
| CRM | 6,500 | 2,500 | $0.0950 | 3.0 | $0.2850 |
| MeetingTranscript | 7,000 | 3,500 | $0.1225 | 2.0 | $0.2450 |
| MetaAdsManager | 8,500 | 4,500 | $0.1550 | 1.0 | $0.1550 |
| Analytics | 7,000 | 3,500 | $0.1225 | 1.0 | $0.1225 |
| TranscriptMiner | 8,500 | 4,000 | $0.1425 | 1.0 | $0.1425 |
| SocialMediaManager | 8,000 | 4,000 | $0.1400 | 1.0 | $0.1400 |
| GeoSEOAuditor | 9,000 | 5,000 | $0.1700 | 0.5 | $0.0850 |
| NewsletterWriter | 9,500 | 6,000 | $0.1975 | 0.14 | $0.0277 |
| ScrollStopperAd | 9,000 | 5,000 | $0.1700 | 0.14 | $0.0238 |
| ContentCalendar | 9,000 | 5,000 | $0.1700 | 0.14 | $0.0238 |
| AdPerformance | 9,000 | 5,000 | $0.1700 | 0.14 | $0.0238 |
| GoogleAdsManager | 8,000 | 4,000 | $0.1400 | 0.14 | $0.0196 |
| CostBreakdown | 7,500 | 4,000 | $0.1375 | 0.14 | $0.0193 |
| Marketing | 6,500 | 2,500 | $0.0950 | 0.14 | $0.0133 |
| Security | 6,500 | 2,500 | $0.0950 | 0.14 | $0.0133 |
| Operations | 5,500 | 2,000 | $0.0775 | 0.14 | $0.0109 |
| HR | 5,500 | 2,000 | $0.0775 | 0.14 | $0.0109 |
| Finance | 7,000 | 3,000 | $0.1100 | 0.07 | $0.0077 |
| Bookkeeping | 7,000 | 3,000 | $0.1100 | 0.07 | $0.0077 |
| Legal | 6,500 | 2,500 | $0.0950 | 0.07 | $0.0067 |

**Total estimated daily cost: ~$2.53 · Monthly: ~$75.90 · Annual: ~$910.80**

## Optimization Opportunities
1. **Prompt caching** on Director, SalesCallCoach, NewsletterWriter — system prompts are stable, caching saves ~80% on input tokens for repeated runs
2. **Model downgrade** for Bookkeeping and MeetingTranscript reminder flows → `claude-haiku-4-5` ($0.25/$1.25 per 1M) cuts cost 20x on simple tasks
3. **Batch webhook triggers** — if multiple leads arrive within 5 minutes, process as a batch rather than individual CRM runs
