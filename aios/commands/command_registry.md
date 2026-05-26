# AIOS Director Command Registry
**Version**: 1.0 | **Date**: 2026-05-26
**Usage**: Issue any command to the Director via `/webhooks/director` or directly in chat

---

## Command Format

```
/command_name [required_input] [optional_input]
```

All commands route through the Director Agent. The Director validates inputs, routes to the appropriate agent(s), and synthesizes the response.

---

## /onboard_client

**Objective**: Initiate full onboarding sequence for a newly signed client.

**Required inputs**:
- `client_name` — Business name
- `package_tier` — `starter` | `growth` | `scale`

**Optional inputs**:
- `owner_name` — Client owner's name
- `business_type` — Industry/vertical

**Workflow**:
1. AiosSales fires SAL-04 → DEL-02 chain
2. Operations provisions GHL sub-account
3. Finance generates setup fee invoice
4. CRM creates client record + fires CRM-01 welcome sequence
5. Slack notification to Dustin with full summary

**Webhook**: `POST /webhooks/sales/closed-won`

**Failure handling**: If GHL provisioning fails, log blocker to Notion + notify Dustin. Invoice still sent.

---

## /analyze_business

**Objective**: Generate a full cross-functional business health analysis.

**Required inputs**: None (pulls from Notion memory)

**Optional inputs**:
- `period` — `daily` | `weekly` | `monthly`

**Workflow**:
1. Director routes to Analytics (KPIs), CRM (health scores), Finance (revenue), Marketing (content performance)
2. Synthesizes into Director Brief
3. Writes to Notion KPI Snapshots
4. Notifies Dustin via Slack

**Webhook**: `POST /webhooks/director` with `{ "task": "Run full business analysis for [period]" }`

---

## /generate_sops

**Objective**: Generate or update an SOP for a specific department or process.

**Required inputs**:
- `department` — Target department
- `process` — Specific process name

**Optional inputs**:
- `existing_workflow` — Current manual steps to formalize

**Output**: Creates `aios/sops/[N]-[process].md` following the 10-section SOP format

**SOP sections generated**:
1. Purpose
2. Trigger
3. Inputs
4. Systems Used
5. Procedure
6. Decision Trees
7. Error Handling
8. Escalation Rules
9. KPI Metrics
10. Automation Suggestions

---

## /build_skill_files

**Objective**: Create or update a SKILL.md for a new operational role or agent.

**Required inputs**:
- `role_name` — Agent/skill name
- `domain` — What this skill handles

**Optional inputs**:
- `tools` — Tools the skill needs access to

**Output**: Creates `aios/skills/custom/[role]/SKILL.md`

---

## /create_agents

**Objective**: Create a new TypeScript agent implementation + register it with the Director.

**Required inputs**:
- `agent_name` — Identifier (kebab-case)
- `skill_path` — Path to SKILL.md

**Dependency**: Requires SKILL.md to exist first (`/build_skill_files`)

**Output files**:
- `server/agents/custom/[agent_name].ts`
- Updated `server/agents/index.ts`
- Updated `server/agents/director.ts` (enum)

---

## /build_workflows

**Objective**: Design and document a new automation workflow.

**Required inputs**:
- `workflow_name`
- `trigger` — What starts this workflow
- `steps` — Ordered list of steps

**Output**: New entry in `aios/knowledge/workflow_index.json` + SOP file

---

## /install_aios

**Objective**: Full AIOS installation checklist for a new deployment.

**Required inputs**:
- `environment` — `local` | `railway` | `custom`

**Workflow** (Director orchestrates):
1. Validate all environment variables
2. Confirm Notion databases are created
3. Test all Zapier webhooks
4. Confirm GHL webhook connected
5. Run e2e test suite
6. Enable scheduler
7. Generate deployment summary

**Output**: Installation status report + `aios/deployment/install_log.md`

---

## /connect_integrations

**Objective**: Verify or configure external service integrations.

**Required inputs**:
- `integration` — `notion` | `zapier` | `ghl` | `slack` | `meta` | `google_ads` | `all`

**Workflow**: Checks env vars, tests connectivity, reports status

**Reference**: `aios/integrations/integration_map.json`

---

## /audit_operations

**Objective**: Full operational audit — identify gaps, inefficiencies, and blockers.

**Required inputs**: None

**Workflow** (Director orchestrates):
1. CRM: Client health report
2. Operations: Active builds + blockers
3. Analytics: KPI anomalies
4. Finance: Overdue invoices + cash position
5. Marketing: Content performance + pipeline value
6. HR: Contractor capacity
7. Legal: Open flags
8. Security: Open incidents

**Output**: Executive audit brief to Dustin + logged to Notion

---

## /create_automation_map

**Objective**: Generate or update the automation dependency map.

**Output**: Updates `aios/knowledge/dependency_map.json` and `aios/automation/zapier_webhooks.json`

---

## /generate_department

**Objective**: Build out a complete department package (SOP + SKILL.md + agent).

**Required inputs**:
- `department` — Department name
- `kpis` — Key metrics for this department

**Output files**:
- `aios/sops/[N]-[department].md`
- `aios/skills/modules/[department]/SKILL.md`
- `server/agents/modules/[department].ts`

---

## /create_memory_system

**Objective**: Initialize or restructure the memory layer for a new deployment.

**Required inputs**:
- `business_name`
- `owner_name`

**Output files**:
- `aios/CLAUDE.md` (populated with business context)
- `aios-template/MEMORY.md` (initialized with active projects)
- Notion database creation checklist

---

## /run_gap_analysis

**Objective**: Identify missing SOPs, skills, agents, or workflows vs. the AIOS standard.

**Workflow** (WorkspaceArchitect):
1. Compare agent_registry.json vs deployed server agents
2. Check all SOP references in skills exist
3. Verify all Zapier webhook env vars are set
4. Check CLAUDE.md and MEMORY.md structure
5. Report gaps in priority order

**Output**: Gap analysis report + recommended action list

---

## /create_training_system

**Objective**: Generate training materials for a new operator or team member.

**Output files**:
- `aios/training/onboarding_guide.md` (updates existing)
- `aios/training/quick_reference.md`
- `aios/training/common_scenarios.md`

---

## /deploy_stack

**Objective**: Verify deployment readiness and trigger Railway deploy.

**Workflow**:
1. Run e2e test suite
2. Check all env vars set
3. Verify health endpoint responds
4. Confirm scheduler is running
5. Report deploy status

---

## /qa_system

**Objective**: Run full QA validation across all 20 agents.

**Workflow** (from `aios/qa/qa_framework.md`):
1. Run `server/agents/test-e2e.ts`
2. Verify all Notion databases have recent writes
3. Test 3 webhook endpoints end-to-end
4. Check agent cost is within thresholds

**Reference**: `aios/qa/qa_framework.md`

---

## /export_documentation

**Objective**: Export complete AIOS documentation package.

**Output**: Creates `aios/export/` directory with:
- All SOPs (30 files)
- All SKILL.md files (20 agents)
- Agent registry JSON
- Orchestration map
- Company profile
- Deployment guide

---

## Command Quick Reference

| Command | Primary Agent | Output |
|---|---|---|
| `/onboard_client` | Director | Client fully onboarded |
| `/analyze_business` | Director + all modules | Executive brief |
| `/generate_sops` | Director | SOP .md file |
| `/build_skill_files` | Director | SKILL.md file |
| `/create_agents` | Director | TypeScript agent |
| `/build_workflows` | Director | Workflow JSON + SOP |
| `/install_aios` | Director | Install status report |
| `/connect_integrations` | Director | Integration status |
| `/audit_operations` | Director + all modules | Audit brief |
| `/create_automation_map` | Director | Updated JSON files |
| `/generate_department` | Director | SOP + SKILL + agent |
| `/create_memory_system` | WorkspaceArchitect | CLAUDE.md + MEMORY.md |
| `/run_gap_analysis` | WorkspaceArchitect | Gap report |
| `/create_training_system` | Director | Training docs |
| `/deploy_stack` | Director | Deploy status |
| `/qa_system` | Director | QA report |
| `/export_documentation` | Director | Full doc package |
