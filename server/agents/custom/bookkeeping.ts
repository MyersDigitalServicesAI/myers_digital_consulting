import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerAgent } from "../director.ts";

export class BookkeepingAgent extends BaseAgent {
  constructor() {
    super({
      name: "Bookkeeping",
      skillPath: "custom/bookkeeping-categorizer/SKILL.md",
      maxTokens: 8192,
    });
    registerStandardTools(this);

    this.registerTool(
      {
        name: "export_categorized_transactions",
        description:
          "Export categorized transactions to QBO-compatible CSV and log the monthly summary to Notion KPI Snapshots.",
        input_schema: {
          type: "object" as const,
          properties: {
            month: {
              type: "string",
              description: "Month being categorized (e.g., '2024-01')",
            },
            transactions: {
              type: "array",
              items: { type: "object" },
              description:
                "Categorized transactions array: [{ date, merchant, amount, category, deductible }]",
            },
            total_deductible: { type: "number" },
            flags: {
              type: "array",
              items: { type: "string" },
              description: "Items flagged for Dustin review",
            },
          },
          required: ["month", "transactions"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "transactions_exported",
        export_id: `BK-${Date.now()}`,
        month: input.month,
        count: (input.transactions as unknown[]).length,
        total_deductible: input.total_deductible,
        status: "Ready for QBO import",
      }),
    );
  }
}

export function createBookkeepingAgent(): BookkeepingAgent {
  return new BookkeepingAgent();
}

registerAgent("bookkeeping", createBookkeepingAgent);
