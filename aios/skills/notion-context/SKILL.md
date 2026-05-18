---
name: myers-digital-notion-context
description: >
  Notion as the Myers Digital AIOS business context layer. Use whenever AIOS needs to read business state,
  write decisions, store module memory, update KPIs, pull SOPs, log automation events, or retrieve any
  persistent business data. This is the memory backbone of all AIOS operations.
compatibility:
  requires: [Notion MCP connected]
  mcp_server: "https://mcp.notion.com/mcp"
---

# Myers Digital — Notion Context Layer

Notion is the **single source of truth** for all Myers Digital AIOS data. Every module reads from and writes to Notion.

---

## Database Architecture

### 1. `AIOS — Business Context`
- **Properties**: Domain (select), Last Updated, Module Owner, Priority, Status
- **Domains**: CRM, Finance, Marketing, Operations, HR, Legal, Security, GHL-Platform
- **Purpose**: SOPs, business model, client info, market context

### 2. `AIOS — KPI Snapshots`
- **Properties**: Module, Metric Name, Value, Target, Period, Variance, Status (🟢🟡🔴)
- **Key metrics**: MRR, active clients, churn rate, pipeline value, CAC, delivery rate

### 3. `AIOS — Decision Log`
- **Properties**: Decision, Module(s), Date, Outcome, Zapier Triggered
- **Purpose**: Immutable audit trail

### 4. `AIOS — SOP Library`
- **Properties**: Module, Process Name, Version, Status, Last Reviewed
- **Purpose**: All operating procedures (mirrors the `sops/` directory)

### 5. `AIOS — Module Memory`
- **Properties**: Module, Operator Input, Director Response, Timestamp, Session ID
- **Rolling window**: 90 days

### 6. `AIOS — Automation Log`
- **Properties**: Trigger Name, Zap ID, Module, Payload Summary, Status, Timestamp
- **Purpose**: Every Zapier trigger audit trail

### 7. `AIOS — Client Registry`
- **Properties**: Client Name, Package (Starter/Growth/Scale), MRR, Status, Health Score, GHL Sub-Account, Onboard Date, Renewal Date
- **Purpose**: Myers Digital-specific client tracking

### 8. `AIOS — GHL Project Tracker`
- **Properties**: Client, Project Type, Tools Deployed, Status, Go-Live Date, Revenue Value
- **Purpose**: Track GHL implementation projects per client

---

## Read Patterns

### Before any Director routing:
```
1. Search AIOS — Business Context WHERE Domain = [directive domain]
2. Query AIOS — KPI Snapshots WHERE Module = [target] AND Period = "current"
3. Search AIOS — Decision Log WHERE keywords match directive
4. Pull AIOS — Client Registry for client-specific queries
```

### Before module execution:
```
1. Pull AIOS — SOP Library WHERE Module = [module] AND Status = "Active"
2. Pull AIOS — Module Memory WHERE Module = [module] AND Date > -30d
```

---

## Write Patterns

### After every Director decision:
```
WRITE to AIOS — Decision Log: Decision, Module(s), Date, Zapier Triggered
```

### After every module response:
```
WRITE to AIOS — Module Memory: Module, Input, Response, Timestamp, Session ID
```

### After every Zapier trigger:
```
WRITE to AIOS — Automation Log: Trigger Name, Zap ID, Module, Status, Timestamp
```

---

## MCP Usage

**Key operations:**
- `notion_search` — full-text search across all databases
- `notion_query_database` — structured filter queries
- `notion_create_page` — write new records
- `notion_update_page` — update existing records

**Always:**
- Use `filter` objects for structured queries
- Include `sorts` to get most recent records first
- Limit results to 10 unless doing a full audit
- Write back within the same session
