# SOP-05 — Marketing Module

**Version**: 1.0
**Module**: Marketing
**Status**: Active

---

## Purpose
Manage Myers Digital's own lead generation, pipeline, content, and marketing performance using the Marketing Module.

## Trigger
Any directive involving Myers Digital's own leads, campaigns, content, or marketing metrics.

## Steps

### 1. Load Module Context
```
AIOS — KPI Snapshots WHERE Module = "marketing"
AIOS — Business Context WHERE Domain = "Marketing"
AIOS — Module Memory WHERE Module = "marketing" AND Date > -14d
```

### 2. Pipeline Assessment
- Count leads MTD vs. target
- Identify lead sources performing above/below benchmark
- Flag any content gaps (0 pieces in 7 days = immediate action)

### 3. Campaign Review
- Review active campaigns against performance benchmarks
- Flag underperformers for Dustin decision
- Identify high-performing content to amplify

### 4. Content Opportunities
- Surface top 2 content opportunities from pipeline data
- Route to Transcript Miner if new calls available
- Route to Newsletter Skill if newsletter is due

### 5. Fire Automations
- Hot lead (score > 80) → `SAL-01` + Dustin notification
- Scheduled content → `MKT-02`

### 6. Output and Write Back
Format per `skills/modules/marketing/SKILL.md`. Write to Notion Module Memory and KPI Snapshots.
