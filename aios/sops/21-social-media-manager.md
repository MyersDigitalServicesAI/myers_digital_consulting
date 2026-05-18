# SOP-21 — Social Media Manager

**Version**: 1.0
**Skill**: Social Media Manager
**Status**: Active

---

## Purpose
Run Myers Digital's organic social presence on LinkedIn, Facebook, and Instagram — publishing consistent content in Dustin's voice to grow the audience of service business owners and generate inbound leads.

## Weekly Rhythm
- **Monday 8:30 AM**: Content Calendar agent plans the week's posts (automated)
- **Tuesday 9:00 AM**: Social posts drafted and saved to Notion (automated)
- **Wednesday**: Dustin reviews and approves posts
- **Thursday 8:00 AM**: Approved posts published (automated)
- **Friday 4:00 PM**: Ad Performance review includes organic metrics

## Posting Schedule

| Platform | Frequency | Best Times | Content Type |
|----------|-----------|-----------|--------------|
| LinkedIn | 3–5×/week | Tue–Thu 8–10 AM | Proof, education, BTS |
| Instagram | 5–7×/week | Daily 7–9 AM | Results, reels, stories |
| Facebook | 3×/week | Mon/Wed/Fri | Repurposed LinkedIn |
| Twitter/X | Daily | Morning | Short hooks |

## Steps — Weekly Post Production

1. Content Calendar agent pulls top hook from Notion Module Memory
2. Load skill: `skills/custom/social-media-manager/SKILL.md`
3. Draft posts for all platform slots using hook as foundation
4. Apply Dustin Voice Skill to all copy
5. Save all drafts to Notion Content Calendar → status: "Awaiting Review"
6. Dustin reviews Wednesday — approves, edits, or rejects
7. Approved posts publish Thursday via `post_to_social` tool (or Zapier SOC-01–04)
8. Log published post IDs to Notion for analytics tracking
9. Friday: pull performance metrics, log to KPI Snapshots

## DM / Engagement Protocol
- Check for inbound DMs daily
- Any DM mentioning pricing, interest, or "how do I" → notify Dustin immediately (high urgency — these are leads)
- Reply to every comment within 2 business hours
- Never engage defensively with criticism

## Webhook Trigger
`POST /webhooks/social/post` — publish a specific post immediately
`POST /webhooks/social/draft-week` — trigger full week draft from a hook

## Performance Targets
| Metric | Target |
|--------|--------|
| LinkedIn impressions/post | > 500 |
| LinkedIn engagement rate | > 3% |
| DMs per week | > 5 |
| Instagram reach/post | > 300 |
