# SOP-28 — Workspace Architect

**Version**: 1.0
**Skill**: Workspace Architect
**Status**: Active
**Last Reviewed**: 2026-05-19

---

## Purpose

Analyze, optimize, and maintain the Myers Digital AIOS Markdown workspace — CLAUDE.md files, MEMORY.md files, ARCHIVE.md, workstation instructions, skill files, and routing logic. Keeps the system token-efficient, structurally correct, and scalable as the workspace grows.

---

## Trigger Phrases

| Dustin Says | Action |
|---|---|
| "Audit the workspace" | Full 7-step analysis of root files |
| "Clean up [file]" | Targeted analysis and optimization of that file |
| "Is my CLAUDE.md too long?" | Line count + structural check |
| "Migrate [project] into AIOS" | Run full migration protocol |
| "Add a workstation for [topic]" | Create workstation CLAUDE.md + MEMORY.md |
| "Archive [project/context]" | Move to ARCHIVE.md, remove from active memory |
| "Fix the routing" | Routing map gap analysis + recommendations |
| "Compress memory" | Audit and compress MEMORY.md entries |

---

## When to Invoke

- Root CLAUDE.md approaches 200 lines
- Root MEMORY.md approaches 150 lines
- Routing feels slow, ambiguous, or broken
- New major project needs to be added to the workspace
- Legacy AI project needs migration into AIOS
- MEMORY.md is storing behavioral rules (wrong file)
- CLAUDE.md is storing facts/statuses that change (wrong file)

---

## Steps

1. Load skill: `skills/custom/workspace-architect/SKILL.md`
2. Provide the file(s) to be audited (or specify scope: "full workspace", "root files only", "workstation X")
3. Workspace Architect runs the 7-step analysis protocol
4. Review the flagged items — confirm or modify each recommendation
5. Architect applies approved changes to the relevant files
6. Validate: line counts checked, misplaced content resolved, routing map complete
7. Log change summary to Notion AIOS Decision Log

---

## File Health Targets

| File | Target | Hard Limit |
|---|---|---|
| Root CLAUDE.md | 150–200 lines | 200 lines |
| Root MEMORY.md | < 150 lines | 150 lines |
| Workstation CLAUDE.md | 150–200 lines | 200 lines |
| Workstation MEMORY.md | < 100 lines | 150 lines |

---

## Content Placement Rules (Quick Reference)

- **Behavioral rules / protocols** → CLAUDE.md
- **Mutable facts / project statuses** → MEMORY.md
- **Historical / completed work** → ARCHIVE.md
- **Domain-specific instructions** → Workstation CLAUDE.md
- **Large rule systems** → Dedicated resource file (pointer in CLAUDE.md)

---

## Workstation Creation Checklist

When the Architect creates a new workstation:
- [ ] `workstations/[name]/CLAUDE.md` — behavioral instructions for this domain
- [ ] `workstations/[name]/MEMORY.md` — domain-specific facts and state
- [ ] `workstations/[name]/resources/` — reference files (optional)
- [ ] Route added to root CLAUDE.md Routing Map
- [ ] Director SKILL.md `custom_skills` list updated

---

## Migration Checklist (Legacy Projects)

When migrating an existing AI project into the AIOS workspace:
- [ ] Project instructions → Workstation CLAUDE.md
- [ ] Project memory → Workstation MEMORY.md
- [ ] Knowledge files → Split into `resources/` files by topic
- [ ] Completed project history → New entry in ARCHIVE.md
- [ ] Routing phrase added to Director routing map

---

## Related SOPs

- `SOP-00` — Master AIOS Overview (system architecture)
- `SOP-01` — Director Agent (routing and orchestration)
- `SOP-02` — Notion Setup (memory database structure)
