# SOP-01 — AIOS Director Agent

**Version**: 1.0
**Module**: Director
**Status**: Active

---

## Purpose
The Director Agent is the entry point for every AIOS interaction. It routes directives to the correct module(s), synthesizes multi-module responses, and manages escalations.

## Trigger
Any Dustin input to the AIOS system.

## Steps

### 1. Load Director Skill
Load `skills/director/SKILL.md` into Claude's context before any session.

### 2. Issue a Directive
Format: plain language is fine. Examples:
- "How is our business doing this week?"
- "Review the sales call from Tuesday with [client name]"
- "Client X hasn't logged into GHL in 3 weeks"

### 3. Director Parses
Claude will:
- Identify the domain(s) touched
- Determine priority (standard / urgent / escalate)
- Pull relevant Notion context
- Route to correct module(s)

### 4. Module Response
The routed module responds in its standard format.

### 5. Director Synthesizes
For multi-module queries, Director weaves into one brief (<150 words).

### 6. Write Back to Notion
Every decision logs to:
- `AIOS — Decision Log`
- `AIOS — Module Memory` (for the relevant module)

### 7. Zapier Execution (if triggered)
Director fires the appropriate Zapier webhook. Result logs to `AIOS — Automation Log`.

## Escalation Criteria
| Condition | Response |
|---|---|
| Security anomaly | Immediate escalation, log, notify Dustin |
| Financial variance > 20% | Finance module brief + Dustin Slack |
| Client churn risk > 60 score | CRM intervention + Dustin notification |
| Legal deadline < 72 hours | Legal module brief + Dustin notification |

## What the Director Never Does
- Execute financial transactions directly
- Send client communications without Dustin's confirmation
- Bypass module routing
- Contradict a prior logged decision without flagging
