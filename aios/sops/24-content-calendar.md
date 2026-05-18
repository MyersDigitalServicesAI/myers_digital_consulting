# SOP-24 — Content Calendar

**Version**: 1.0
**Skill**: Content Calendar
**Status**: Active

---

## Purpose
Coordinate the entire Myers Digital content machine — from hook mining on Monday to publishing on Thursday. Ensures the TranscriptMiner, NewsletterWriter, ScrollStopperAd, and SocialMediaManager agents work as a unified system.

## Trigger
Runs automatically Monday at 8:30 AM. Also triggered manually via Director when campaign planning is needed.

## Weekly Flow

```
MONDAY 8:30 AM
  ├── Check Notion Module Memory for hooks scored 7+
  ├── Assign top hook to: newsletter + Meta ad + LinkedIn
  ├── Fill all platform content slots for the week
  ├── Route newsletter brief → NewsletterWriter agent
  └── Route Meta ad brief → ScrollStopperAd agent

TUESDAY 9:00 AM
  ├── SocialMediaManager drafts all posts
  └── All saved to Notion as "Awaiting Review"

WEDNESDAY
  └── Dustin reviews and approves content

THURSDAY 8:00 AM
  └── Approved content publishes

FRIDAY 4:00 PM
  ├── AdPerformance pulls week's metrics
  └── Top-performing hook type logged for next week's planning
```

## Notion Content Calendar Fields
Each record: date · platform · content_type · hook_source · copy · status · published_at · performance_notes

## Content Repurposing Rule
Every newsletter → 3 LinkedIn posts + 2 Instagram captions + 1 Meta ad variant
Every client win → 1 proof post (LinkedIn) + 1 Instagram story + 1 newsletter paragraph

## Webhook Trigger
`POST /webhooks/social/draft-week` — trigger full week planning from a specific hook
