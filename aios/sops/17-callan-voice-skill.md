# SOP-17 — Callan Voice Skill

**Version**: 1.0
**Skill**: Callan Voice
**Status**: Active

---

## Purpose
Filter all written outputs through Callan Myers' personal brand voice for authenticity and consistency.

## Trigger
Any output that will be published, sent to clients, or represent Myers Digital externally.

## Apply This Skill To
- Client emails and proposals
- Newsletter drafts
- LinkedIn posts
- Sales scripts and templates
- Website copy updates
- Course or content scripts
- Any content built by Newsletter Skill or Transcript Miner

## Steps

1. Load skill: `skills/custom/callan-voice-skill/SKILL.md`
2. Provide draft content to Claude
3. Claude applies Callan's voice — eliminating avoidances, adding specificity, tightening sentences
4. Review: does it sound like Callan wrote it?
5. Publish or send

## Voice Quick Test
Before publishing, check:
- [ ] Opens with a hook, not an intro or greeting
- [ ] No banned words (leverage, game-changer, circle back, touch base)
- [ ] Short punchy sentences for emphasis
- [ ] Specific numbers and results (not vague claims)
- [ ] One clear CTA at the close
- [ ] Reads like a smart, direct human — not a marketing bot

## Training
The Callan Voice Skill was trained on 10 hours of Callan's actual writing and speaking patterns. If a new document significantly changes Callan's style preferences, update the AVOIDANCES and PHRASING PATTERNS sections in `skills/custom/callan-voice-skill/SKILL.md`.
