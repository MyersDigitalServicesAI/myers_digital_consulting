# QA Framework — Myers Digital AIOS
**Version**: 1.0 | **Date**: 2026-05-26

---

## QA Principles

1. **Validate at boundaries** — Check inputs from webhooks; trust internal agent outputs
2. **Approval gates protect external actions** — Financial, comms, and publishing require Dustin approval
3. **Audit logs are the QA record** — Every decision logged to Notion Automation Log
4. **e2e tests prove system-level correctness** — see `aios-e2e-results.txt`

---

## Agent Output Quality Standards

### Director Agent
- [ ] Routes to the correct domain agent(s) — never skips
- [ ] Multi-module synthesis is ≤ 150 words
- [ ] Escalation format used for threshold breaches
- [ ] Decision logged to Notion before replying

### CRM Agent
- [ ] Health score 0–100 with clear reasoning
- [ ] Churn risk correctly flagged (High/Medium/Low)
- [ ] GHL pipeline stage updated
- [ ] Zapier hook fired after pipeline change

### Finance Agent
- [ ] Revenue calculations are arithmetic-correct
- [ ] Flags overdue invoices
- [ ] Never processes transactions without Dustin approval
- [ ] P&L written to Notion KPI Snapshots

### Marketing Agent
- [ ] Content follows Dustin's voice (checked against voice skill)
- [ ] Newsletter uses 7-part framework
- [ ] Subject lines use A/B (two variants)
- [ ] Saved as "Awaiting Review" — not auto-published

### Operations Agent
- [ ] Milestone statuses accurate vs Notion GHL Tracker
- [ ] Blockers flagged immediately
- [ ] Onboarding timeline within 10 business days

### Analytics Agent
- [ ] Anomaly detection runs on 7-day baseline
- [ ] Digest format matches standard template
- [ ] Written to Notion KPI Snapshots before notifying Dustin

### Security Agent
- [ ] Incident ID assigned
- [ ] Level correctly assessed (1–4)
- [ ] Dustin notified immediately for Level 2+
- [ ] SEC-01 Zapier fired

### TranscriptMiner
- [ ] Hooks scored 1–10 with clear rationale
- [ ] Only hooks ≥ 7 saved to Notion
- [ ] Hook type correctly classified (proof/education/behind-the-scenes/offer)
- [ ] Top hook queued for next newsletter

### SalesCallCoach
- [ ] 6-category rubric applied (total ≤ 100 points)
- [ ] Scripted word-for-word fixes for top 3 improvement areas
- [ ] Report saved to Notion with rep name + date

### AiosSales
- [ ] Qualification runs before any pitch
- [ ] Tier recommendation connects to specific prospect pain
- [ ] No proposal sent before 2/3 qualifying criteria met
- [ ] Demo not booked without Dustin notification
- [ ] Follow-up sequence queued (never auto-sent without approval)

### WorkspaceArchitect
- [ ] File read before any write
- [ ] Changes flagged to Dustin before writing
- [ ] Validation checklist run after changes
- [ ] CLAUDE.md stays within 200–350 lines
- [ ] MEMORY.md stays under 200 lines

---

## Webhook Input Validation

| Endpoint | Required Fields | Validation |
|---|---|---|
| `/webhooks/director` | `task` | Reject if missing |
| `/webhooks/sales-call` | `transcript` | Reject if missing |
| `/webhooks/meeting` | `transcript`, `meeting_title` | Reject if missing |
| `/webhooks/seo-audit` | `business_name`, `location` | Reject if missing |
| `/webhooks/sales/inquiry` | `prospect_name`, `business_name` | Reject if missing |
| `/webhooks/sales/demo-complete` | `prospect_name`, `demo_outcome` | Reject if missing |
| `/webhooks/sales/closed-won` | `client_name`, `package_tier` | Reject if missing |
| `/webhooks/workspace/optimize` | `file_path`, `task` | Reject if missing |

---

## End-to-End Test Protocol

Run `server/agents/test-e2e.ts` to verify all 24 agents:

```bash
npx tsx server/agents/test-e2e.ts
```

**Pass criteria:**
- All 24 agents complete without TypeScript errors
- All SKILL.md files load successfully
- Tool calls execute (simulated mode acceptable)
- Output format matches expected structure per agent

**Current status**: 24/24 verified (typecheck) as of `aios-e2e-results.txt` (workspace-architect and aios-sales added in this build)

---

## Approval Gates (QA Controls)

These actions REQUIRE Dustin approval before execution. Agents must never bypass:

| Action | Approval Required |
|---|---|
| Financial transaction | Yes — always |
| External client communication | Yes — always |
| Contract modification | Yes — always |
| Ad budget change > $500 | Yes |
| Social post publish | Yes |
| Newsletter send | Yes |
| Workspace file write | Yes — flagged first |

---

## Incident Response QA

When a security incident is logged:
1. Incident ID confirmed in Notion
2. Level correctly assigned (1 = info, 2 = investigate, 3 = respond, 4 = critical)
3. SEC-01 Zapier fired for Level 2+
4. Dustin notified within 5 minutes
5. No remediation actions taken without Dustin instruction

---

## Monthly QA Checklist

- [ ] All 11 scheduled jobs fired as expected
- [ ] Notion databases have entries from all agents
- [ ] No agent errors in server logs for past 30 days
- [ ] Zapier webhooks tested (fire test event from each)
- [ ] CLAUDE.md and MEMORY.md within size limits (run WorkspaceArchitect)
- [ ] Agent registry JSON matches deployed agent files
- [ ] e2e test suite passes
