# SOP-12 — Meeting Transcript Task Creator

**Version**: 1.0
**Skill**: Meeting Transcript Task Creator
**Status**: Active

---

## Purpose
Extract tasks, decisions, and follow-ups from meeting transcripts and auto-land them in Notion.

## Trigger
Callan shares a transcript, meeting notes, or recording summary.

## Input Requirements
- Raw transcript (text paste, uploaded file, or Google Meet/Zoom auto-transcript link)
- Meeting name and date
- Attendees (optional — helps with owner assignment)

## Steps

1. Load skill: `skills/custom/meeting-transcript-task-creator/SKILL.md`
2. Provide transcript text to Claude
3. Claude extracts: tasks, owners, deadlines, decisions, open loops
4. Review extracted tasks for accuracy (Callan confirms)
5. Confirmed tasks land in Notion `AIOS — Task Board`
6. Hard-deadline tasks create Google Calendar events

## Notion Task Board Setup
Create a database called `AIOS — Task Board` with:
- Task Name (title)
- Owner (person or select)
- Due Date (date)
- Priority (select): High, Medium, Low
- Status (select): To Do, In Progress, Done
- Meeting Source (text)
- Context (text)

## Tips
- Works best with full transcripts — summaries miss implicit commitments
- For recurring meetings (weekly calls), review the output before finalizing owners
- Use the "open loops" section to track client commitments that Myers Digital needs to follow up on
