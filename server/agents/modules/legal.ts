import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerAgent } from "../director.ts";

export class LegalAgent extends BaseAgent {
  constructor() {
    super({
      name: "Legal",
      skillPath: "modules/legal/SKILL.md",
      maxTokens: 8192,
    });
    registerStandardTools(this);

    this.registerTool(
      {
        name: "flag_legal_review",
        description:
          "Flag an item for legal review and notify Dustin. Use when contract terms are non-standard, client disputes arise, or IP/liability questions emerge.",
        input_schema: {
          type: "object" as const,
          properties: {
            issue_type: {
              type: "string",
              enum: [
                "contract-review",
                "client-dispute",
                "ip-question",
                "liability-risk",
                "compliance",
              ],
            },
            description: { type: "string" },
            urgency: {
              type: "string",
              enum: ["low", "medium", "high"],
            },
            related_client: {
              type: "string",
              description: "Client name if applicable",
            },
          },
          required: ["issue_type", "description", "urgency"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "legal_flag_created",
        flag_id: `LEG-${Date.now()}`,
        ...input,
        note: "Always consult qualified legal counsel — this flag is for tracking only",
      }),
    );
  }
}

export function createLegalAgent(): LegalAgent {
  return new LegalAgent();
}

registerAgent("legal", createLegalAgent);
