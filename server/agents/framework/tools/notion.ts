import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import type { BaseAgent } from "../base-agent.ts";

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

// Live Myers Digital AIOS workspace — IDs confirmed from Notion MCP
// Override individual DBs via env vars if workspace changes
const DB_MAP: Record<string, string> = {
  business_context:
    process.env.NOTION_DB_BUSINESS_CONTEXT ??
    "7786ce5b-3577-4da0-a3a6-f476c91e17c6",
  kpi_snapshots:
    process.env.NOTION_DB_KPI_SNAPSHOTS ??
    "09aabe65-3a54-40fe-bc59-fae4cbebaaa2",
  decision_log:
    process.env.NOTION_DB_DECISION_LOG ??
    "e0005065-252b-48f0-844f-532ea2686bf2",
  sop_library:
    process.env.NOTION_DB_SOP_LIBRARY ??
    "73aad413-4d8c-491c-aa21-77d0966a3585",
  module_memory:
    process.env.NOTION_DB_MODULE_MEMORY ??
    "def5c68a-6002-4225-9013-e38f94fc5fc9",
  automation_log:
    process.env.NOTION_DB_AUTOMATION_LOG ??
    "44bab4bf-b1c7-44f4-b845-33064b8b5fd2",
  connector_registry:
    process.env.NOTION_DB_CONNECTOR_REGISTRY ??
    "a3b50335-3872-4893-9adb-1c882440411b",
};

// Property type schemas for each database (maps field name → Notion type)
const DB_SCHEMAS: Record<
  string,
  Record<string, "title" | "text" | "select" | "multi_select" | "checkbox" | "date" | "number">
> = {
  decision_log: {
    Decision: "title",
    "Director Summary": "text",
    "Decision Date": "date",
    "Follow Up Date": "date",
    Priority: "select",
    Outcome: "select",
    "Operator Tier": "select",
    "Modules Involved": "multi_select",
    "Recommended Action": "text",
    "Zapier Triggered": "checkbox",
    "Follow Up Required": "checkbox",
    "Zap ID": "text",
  },
  kpi_snapshots: {
    "Metric Name": "title",
    Value: "text",
    Target: "text",
    Variance: "text",
    Module: "select",
    Health: "select",
    Period: "select",
    Notes: "text",
    "Last Updated": "date",
    "Zapier Trigger Fired": "checkbox",
  },
  module_memory: {
    Interaction: "title",
    Module: "select",
    "Operator Input": "text",
    "Module Response": "text",
    "Director Synthesis": "text",
    "Session ID": "text",
    Timestamp: "date",
    "Zapier Fired": "checkbox",
    Escalated: "checkbox",
    "Follow Up Needed": "checkbox",
    "Operator Tier": "select",
  },
  business_context: {
    "Context Title": "title",
    Domain: "select",
    Status: "select",
    Priority: "select",
    Summary: "text",
    "Key Constraints": "text",
    "Open Questions": "text",
    "Module Owner": "select",
    "Last Reviewed": "date",
  },
  automation_log: {
    "Event Name": "title",
    "Agent Name": "text",
    Status: "select",
    Notes: "text",
    Timestamp: "date",
  },
};

function notionHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

function buildNotionProperty(
  type: string,
  value: unknown,
): Record<string, unknown> {
  switch (type) {
    case "title":
      return { title: [{ text: { content: String(value) } }] };
    case "text":
      return { rich_text: [{ text: { content: String(value) } }] };
    case "select":
      return { select: { name: String(value) } };
    case "multi_select": {
      const items = Array.isArray(value)
        ? value
        : String(value).split(",").map((s) => s.trim());
      return { multi_select: items.map((name: string) => ({ name })) };
    }
    case "checkbox":
      return { checkbox: Boolean(value) };
    case "date":
      return { date: { start: String(value) } };
    case "number":
      return { number: Number(value) };
    default:
      return { rich_text: [{ text: { content: String(value) } }] };
  }
}

function buildProperties(
  dbKey: string,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const schema = DB_SCHEMAS[dbKey] ?? {};
  const properties: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;
    const propType = schema[key];
    if (propType) {
      properties[key] = buildNotionProperty(propType, value);
    } else {
      // Unknown field — guess type from value
      if (typeof value === "boolean") {
        properties[key] = { checkbox: value };
      } else if (typeof value === "number") {
        properties[key] = { number: value };
      } else {
        // Default to rich_text for unknown string fields
        properties[key] = {
          rich_text: [{ text: { content: String(value) } }],
        };
      }
    }
  }

  return properties;
}

async function notionRead(input: Record<string, unknown>): Promise<unknown> {
  const database = input.database as string;
  const filter = input.filter as object | undefined;
  const limit = (input.limit as number | undefined) ?? 10;

  const dbId = DB_MAP[database];
  if (!dbId) {
    return {
      error: `Database '${database}' not configured`,
      available: Object.keys(DB_MAP),
    };
  }

  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    return {
      simulated: true,
      database,
      message: `Would read up to ${limit} records from ${database}. Set NOTION_API_KEY to activate.`,
      db_id: dbId,
    };
  }

  try {
    const body: Record<string, unknown> = { page_size: limit };
    if (filter) body.filter = filter;

    const res = await axios.post(
      `${NOTION_API_BASE}/databases/${dbId}/query`,
      body,
      { headers: notionHeaders() },
    );

    return {
      results: res.data.results,
      has_more: res.data.has_more,
      count: res.data.results.length,
      database,
      db_id: dbId,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `Notion API error: ${msg}`, database, db_id: dbId };
  }
}

async function notionWrite(input: Record<string, unknown>): Promise<unknown> {
  const database = input.database as string;
  const data = input.data as Record<string, unknown>;

  const dbId = DB_MAP[database];
  if (!dbId) {
    return {
      error: `Database '${database}' not configured`,
      available: Object.keys(DB_MAP),
    };
  }

  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    return {
      simulated: true,
      database,
      message: `Would write to ${database}. Set NOTION_API_KEY to activate.`,
      db_id: dbId,
      data,
    };
  }

  try {
    const properties = buildProperties(database, data);

    const res = await axios.post(
      `${NOTION_API_BASE}/pages`,
      { parent: { database_id: dbId }, properties },
      { headers: notionHeaders() },
    );

    return { success: true, page_id: res.data.id, url: res.data.url, database };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `Notion API error: ${msg}`, database, db_id: dbId };
  }
}

async function logDecision(
  input: Record<string, unknown>,
): Promise<unknown> {
  const { decision, reasoning, owner, priority, outcome, modules } =
    input as {
      decision: string;
      reasoning: string;
      owner: string;
      priority?: string;
      outcome?: string;
      modules?: string | string[];
    };

  return notionWrite({
    database: "decision_log",
    data: {
      Decision: decision,
      "Director Summary": reasoning,
      "Decision Date": new Date().toISOString().split("T")[0],
      "Operator Tier": owner,
      Priority: priority ?? "Standard",
      Outcome: outcome ?? "In Progress",
      ...(modules ? { "Modules Involved": modules } : {}),
    },
  });
}

export const NOTION_TOOLS: Anthropic.Tool[] = [
  {
    name: "notion_read",
    description:
      "Read records from a Myers Digital Notion database. Use this to pull business context, client data, KPIs, or module memory before making decisions.",
    input_schema: {
      type: "object" as const,
      properties: {
        database: {
          type: "string",
          enum: Object.keys(DB_MAP),
          description: "Which Notion database to query",
        },
        filter: {
          type: "object",
          description:
            "Optional Notion filter object (e.g., { property: 'Status', select: { equals: 'Active' } })",
        },
        limit: {
          type: "number",
          description: "Max records to return (default 10)",
        },
      },
      required: ["database"],
    },
  },
  {
    name: "notion_write",
    description:
      "Create a new record in a Myers Digital Notion database. Use this to log decisions, update client status, store KPI snapshots, or record automation events.",
    input_schema: {
      type: "object" as const,
      properties: {
        database: {
          type: "string",
          enum: Object.keys(DB_MAP),
          description: "Which Notion database to write to",
        },
        data: {
          type: "object",
          description:
            "Key-value pairs to write. Keys must match the database's property names exactly.",
        },
      },
      required: ["database", "data"],
    },
  },
  {
    name: "log_decision",
    description:
      "Log a significant business decision to the Notion Decision Log. Use for any recommendation, action taken, or escalation.",
    input_schema: {
      type: "object" as const,
      properties: {
        decision: {
          type: "string",
          description: "The decision made (one clear sentence)",
        },
        reasoning: {
          type: "string",
          description: "Why this decision was made",
        },
        owner: {
          type: "string",
          enum: ["Analyst", "Manager", "Executive", "Director"],
          description: "Operator tier making this decision",
        },
        priority: {
          type: "string",
          enum: ["Standard", "Urgent", "Escalation"],
          description: "Priority level (default: Standard)",
        },
        outcome: {
          type: "string",
          enum: ["Resolved", "In Progress", "Escalated", "Deferred"],
          description: "Current outcome status",
        },
        modules: {
          type: "array",
          items: { type: "string" },
          description:
            "Modules involved: Finance, Operations, Marketing, Legal, HR, Analytics, Security, CRM, All",
        },
      },
      required: ["decision", "reasoning", "owner"],
    },
  },
];

export function registerNotionTools(agent: BaseAgent): void {
  const a = agent as unknown as {
    registerTool: (
      tool: Anthropic.Tool,
      executor: (input: Record<string, unknown>) => Promise<unknown>,
    ) => void;
  };

  a.registerTool(NOTION_TOOLS[0], notionRead);
  a.registerTool(NOTION_TOOLS[1], notionWrite);
  a.registerTool(NOTION_TOOLS[2], logDecision);
}
