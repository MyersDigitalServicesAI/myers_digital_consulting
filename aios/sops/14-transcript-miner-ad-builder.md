# SOP-14 — Transcript Miner & Ad Creative Builder

**Version**: 1.0
**Skill**: Transcript Miner & Ad Builder
**Status**: Active

---

## Purpose
Extract high-converting content hooks from call transcripts and build newsletters, carousels, and ad creative in Myers Digital's brand voice.

## Trigger
- **Scheduled**: 9:00 AM daily if new transcripts available
- **On-demand**: Callan requests content from a specific call

## Input Requirements
- Sales call or meeting transcript (text or audio-to-text)
- Target audience for the content (Myers Digital's client target: service business owners)
- Intended output type (newsletter, carousel, ad, or all three)

## Steps

1. Load skills: `skills/custom/transcript-miner-ad-builder/SKILL.md` + `skills/custom/callan-voice-skill/SKILL.md`
2. Provide transcript to Claude
3. Claude mines transcript and scores hooks
4. Claude builds all three content types from top hooks
5. Filter all output through Callan Voice Skill
6. Review and approve before publishing
7. Save approved content to Google Drive `/Content Library/[Month]`
8. Post to `#content` Slack channel for scheduling

## Content Cadence Goal
- 1 newsletter per week (minimum)
- 2-3 LinkedIn posts per week
- 1 ad variant per week (test against existing creative)

## Performance Tracking
Track in Notion `AIOS — KPI Snapshots`:
- Newsletter open rate (target: > 35%)
- Newsletter click rate (target: > 5%)
- LinkedIn post engagement rate
- Ad CTR and CPL
