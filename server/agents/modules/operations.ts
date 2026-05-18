import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerAgent } from "../director.ts";

export class OperationsAgent extends BaseAgent {
  constructor() {
    super({
      name: "Operations",
      skillPath: "modules/operations/SKILL.md",
      maxTokens: 8192,
    });
    registerStandardTools(this);

    this.registerTool(
      {
        name: "create_ghl_subaccount",
        description:
          "Provision a new GHL sub-account for an onboarding client. Triggers DEL-03 kickoff checklist Zap.",
        input_schema: {
          type: "object" as const,
          properties: {
            client_name: { type: "string" },
            client_email: { type: "string" },
            package: {
              type: "string",
              enum: ["Starter", "Growth", "Scale"],
            },
            business_type: {
              type: "string",
              description: "Type of service business (e.g., roofing, HVAC, plumbing)",
            },
          },
          required: ["client_name", "client_email", "package"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "ghl_subaccount_created",
        ...input,
        subaccount_id: `GHL-${Date.now()}`,
        onboarding_timeline_days:
          input.package === "Starter" ? 5 :
          input.package === "Growth" ? 10 : 14,
      }),
    );

    this.registerTool(
      {
        name: "check_onboarding_status",
        description:
          "Check the onboarding progress for a client across all GHL setup milestones.",
        input_schema: {
          type: "object" as const,
          properties: {
            client_name: { type: "string" },
          },
          required: ["client_name"],
        },
      },
      async (input) => ({
        simulated: true,
        client: input.client_name,
        message: "Would query GHL Project Tracker in Notion for milestone status",
      }),
    );
  }
}

export function createOperationsAgent(): OperationsAgent {
  return new OperationsAgent();
}

registerAgent("operations", createOperationsAgent);
