# SOP-15 — Sales Call Coach

**Version**: 1.0
**Skill**: Sales Call Coach
**Status**: Active

---

## Purpose
Score sales calls against the Myers Digital GHL Sales Playbook, identify missed opportunities, and script specific fixes.

## Trigger
Dustin shares a sales call transcript or recording for review.

## Input Requirements
- Call transcript (text) or recording (auto-transcribed)
- Prospect name and business type
- Outcome (closed, follow-up, lost, or pending)

## Steps

1. Load skill: `skills/custom/sales-call-coach/SKILL.md`
2. Provide transcript to Claude
3. Claude scores the call across 6 categories (total 100 points)
4. Review: wins, missed opportunities, hidden objections
5. For each missed opportunity, get the exact scripted fix
6. Log call score and notes to Notion `AIOS — Decision Log`
7. Update prospect record in GHL CRM with coaching notes

## Scoring Benchmarks
| Score | Grade | Action |
|---|---|---|
| 85-100 | A | Document as training example |
| 70-84 | B | Note top 2 improvements |
| 55-69 | C | Full debrief, practice fixes |
| < 55 | D | Script review before next call |

## Common Missed Opportunities to Watch For
1. **Not calculating the revenue gap** — always do the math out loud ($X/day, $Y/month, $Z/year)
2. **Presenting price before stacking value** — GHL features first, price last
3. **Skipping the close** — always attempt a close with a specific ask
4. **Letting "I need to think about it" end the call** — use the Hormozi pattern to unpack it
5. **Not mapping pain to specific GHL tools** — be specific (missed calls → Missed Call Text-Back + AI Chat)

## Connection to GHL Playbook
Every coaching session references the Myers Digital GHL Sales Playbook (SOP-20). The 17 GHL tools, 3 packages, and 5 objection scripts are the evaluation baseline.
