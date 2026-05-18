import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import type { BaseAgent } from "../base-agent.ts";

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

// Database IDs mapped from environment — set these in .env
const DB_MAP: Record<string, string | undefined> = {
  business_context: process.env.NOTION_DB_BUSINESS_CONTEXT,
  kpi_snapshots: process.env.NOTION_DB_KPI_SNAPSHOTS,
  decision_log: process.env.NOTION_DB_DECISION_LOG,
  sop_library: process.env.NOTION_DB_SOP_LIBRARY,
  module_memory: process.env.NOTION_DB_MODULE_MEMORY,
  automation_log: process.env.NOTION_DB_AUTOMATION_LOG,
  client_registry: process.env.NOTION_DB_CLIENT_REGISTRY,
  ghl_project_tracker: process.env.NOTION_DB_GHL_TRACKER,
};

function notionHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

async function notionRead(input: Record<string, unknown>): Promise<unknown> {
  const database = input.database as string;
  const filter = input.filter as object | undefined;
  const limit = (input.limit as number | undefined) ?? 10;

  const dbId = DB_MAP[database];
  if (!dbId) {
    return {
      error: `Database '${database}' not configured. Set NOTION_DB_${database.toUpperCase()} in .env`,
      available: Object.keys(DB_MAP),
    };
  }

  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    return {
      error: "NOTION_API_KEY not set",
      simulated: true,
      database,
      message: `Would read up to ${limit} records from ${database}`,
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
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `Notion API error: ${msg}` };
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
      message: `Would write to ${database}`,
      data,
    };
  }

  try {
    const properties: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        properties[key] = { title: [{ text: { content: value } }] };
      } else if (typeof value === "number") {
        properties[key] = { number: value };
      } else if (typeof value === "boolean") {
        properties[key] = { checkbox: value };
      }
    }

    const res = await axios.post(
      `${NOTION_API_BASE}/pages`,
      {
        parent: { database_id: dbId },
        properties,
      },
      { headers: notionHeaders() },
    );

    return { success: true, page_id: res.data.id, url: res.data.url };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `Notion API error: ${msg}` };
  }
}

async function logDecision(
  input: Record<string, unknown>,
): Promise<unknown> {
  const { decision, reasoning, owner, outcome } = input as {
    decision: string;
    reasoning: string;
    owner: string;
    outcome?: string;
  };

  return notionWrite({
    database: "decision_log",
    data: {
      Decision: decision,
      Reasoning: reasoning,
      Owner: owner,
      Outcome: outcome ?? "Pending",
      Date: new Date().toISOString().split("T")[0],
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
          description: "Key-value pairs to write as page properties",
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
          description:
            "Who owns this decision (e.g., 'Director Agent', 'Callan')",
        },
        outcome: {
          type: "string",
          description: "Expected outcome or result",
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
