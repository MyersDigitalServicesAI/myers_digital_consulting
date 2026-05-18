import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerAgent } from "../director.ts";

export class HrAgent extends BaseAgent {
  constructor() {
    super({
      name: "HR",
      skillPath: "modules/hr/SKILL.md",
      maxTokens: 8192,
    });
    registerStandardTools(this);

    this.registerTool(
      {
        name: "onboard_contractor",
        description:
          "Start the contractor onboarding workflow: send contract, collect W-9, create Notion profile, add to project tracker.",
        input_schema: {
          type: "object" as const,
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            role: {
              type: "string",
              description: "e.g., 'GHL Specialist', 'Copywriter', 'VA'",
            },
            rate: {
              type: "number",
              description: "Hourly or project rate in USD",
            },
            rate_type: {
              type: "string",
              enum: ["hourly", "project"],
            },
          },
          required: ["name", "email", "role"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "contractor_onboarded",
        ...input,
        contractor_id: `CON-${Date.now()}`,
      }),
    );
  }
}

export function createHrAgent(): HrAgent {
  return new HrAgent();
}

registerAgent("hr", createHrAgent);
