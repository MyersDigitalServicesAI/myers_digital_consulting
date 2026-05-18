import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerAgent } from "../director.ts";

export class FinanceAgent extends BaseAgent {
  constructor() {
    super({
      name: "Finance",
      skillPath: "modules/finance/SKILL.md",
      maxTokens: 8192,
    });
    registerStandardTools(this);

    this.registerTool(
      {
        name: "generate_invoice",
        description:
          "Create and send an invoice to a client via Stripe + GHL. Triggers FIN-01 Zapier workflow.",
        input_schema: {
          type: "object" as const,
          properties: {
            client_name: { type: "string" },
            client_email: { type: "string" },
            amount: { type: "number", description: "Invoice total in USD" },
            description: {
              type: "string",
              description: "Service description (e.g., 'Growth Package Setup Fee')",
            },
            due_date: { type: "string", description: "ISO date string" },
          },
          required: ["client_name", "client_email", "amount", "description"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "invoice_generated",
        ...input,
        invoice_id: `INV-${Date.now()}`,
      }),
    );

    this.registerTool(
      {
        name: "calculate_mrr",
        description:
          "Calculate current Monthly Recurring Revenue from active clients in Notion Client Registry.",
        input_schema: {
          type: "object" as const,
          properties: {
            include_pending: {
              type: "boolean",
              description: "Include clients with pending status",
            },
          },
          required: [],
        },
      },
      async (_input) => ({
        simulated: true,
        message:
          "Would query Client Registry, sum monthly_retainer values for Active clients",
        note: "Connect NOTION_DB_CLIENT_REGISTRY to get live MRR",
      }),
    );
  }
}

export function createFinanceAgent(): FinanceAgent {
  return new FinanceAgent();
}

registerAgent("finance", createFinanceAgent);
