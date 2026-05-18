import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerAgent } from "../director.ts";

export class CrmAgent extends BaseAgent {
  constructor() {
    super({
      name: "CRM",
      skillPath: "modules/crm/SKILL.md",
      maxTokens: 8192,
    });
    registerStandardTools(this);

    // CRM-specific tool: GHL pipeline stage update via Zapier
    this.registerTool(
      {
        name: "update_ghl_pipeline",
        description:
          "Move a GHL contact through the pipeline (New Lead → Proposal Sent → Active Client → Churned). Triggers appropriate automations for each stage transition.",
        input_schema: {
          type: "object" as const,
          properties: {
            contact_id: { type: "string", description: "GHL contact ID" },
            contact_name: { type: "string", description: "Client name" },
            from_stage: { type: "string", description: "Current pipeline stage" },
            to_stage: { type: "string", description: "Target pipeline stage" },
            reason: { type: "string", description: "Reason for stage change" },
          },
          required: ["contact_name", "to_stage"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "pipeline_update",
        ...input,
      }),
    );
  }
}

export function createCrmAgent(): CrmAgent {
  return new CrmAgent();
}

registerAgent("crm", createCrmAgent);
