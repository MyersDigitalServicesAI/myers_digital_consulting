# SOP-30 — Competitive Intel

**Version**: 1.0
**Skill**: Competitive Intel Agent
**Status**: Active
**Last Reviewed**: 2026-05-19

---

## Purpose

Track the AI ops and GHL agency competitive landscape, profile named competitors on demand, build prospect battlecards, and surface pricing and positioning gaps — all logged to Notion so the intelligence compounds over time.

---

## Trigger Phrases

| Dustin Says | Protocol |
|---|---|
| "Profile [competitor]" | Protocol 1 — Competitor Profile |
| "Who is [competitor]?" | Protocol 1 — Competitor Profile |
| "Prospect is comparing us to [competitor]" | Protocol 2 — Battlecard |
| "How do I handle [competitor] on a call?" | Protocol 2 — Battlecard |
| "What's the market doing?" | Protocol 3 — Market Scan |
| "Any new players in the space?" | Protocol 3 — Market Scan |
| "How are we priced vs. the market?" | Protocol 4 — Pricing Intel |
| "Is $X too expensive for this market?" | Protocol 4 — Pricing Intel |
| "Run a competitive scan" | Protocol 3 — Market Scan |

---

## When to Invoke

- Prospect mentions a competitor by name during sales process → immediate battlecard
- New entrant spotted in content feeds → run Protocol 1 profile
- Monthly cadence → Protocol 3 market scan + Notion update
- Pricing objection spike (3+ in one week) → Protocol 4 pricing intel
- Launching in new niche/vertical → Protocol 3 scan with focused query

---

## Monthly Intel Rhythm

| Cadence | Action | Stored In |
|---|---|---|
| Monthly (1st week) | Market scan — GHL AI agency space | Notion Competitor Registry |
| Monthly (1st week) | Pricing intel — done-for-you AI ops | Notion Decision Log |
| On demand | Competitor profile — any named competitor | Notion Competitor Registry |
| On demand | Battlecard — prospect comparison | Notion Sales Pipeline (attached to deal) |
| Quarterly | Full registry review — update threat levels | Notion Competitor Registry |

---

## Steps (Standard Run)

1. Load skill: `skills/custom/competitive-intel/SKILL.md`
2. Identify which protocol applies (see trigger phrases above)
3. Provide required inputs (competitor name + URL for Protocol 1; prospect context for Protocol 2)
4. Agent runs web research using WebSearch + WebFetch
5. Review output — flag any data points that need verification
6. Approve for logging → agent writes to Notion Competitor Registry
7. If battlecard: attach to the relevant deal in Notion Sales Pipeline
8. If market scan: share strategic signal with Director for routing decisions

---

## Notion Databases Used

- `AIOS Competitor Registry` — all competitor profiles, threat levels, last reviewed
- `AIOS Sales Pipeline` — battlecards attached to active deals
- `AIOS Decision Log` — strategic decisions triggered by intel findings

---

## Integration With Other Agents

| Agent | How Intel Feeds In |
|---|---|
| AIOS Sales Workstation | Pulls battlecards during prospect handling |
| Director | Uses market scan signals for positioning decisions |
| Marketing Module | Uses competitor gap analysis for content angles |
| Analytics Module | Cross-references pricing intel with conversion data |

---

## Related SOPs

- `SOP-29` — AIOS Sales (battlecards used in sales process)
- `SOP-05` — Marketing Module (positioning and content strategy)
- `SOP-10` — Analytics Module (conversion data cross-reference)
