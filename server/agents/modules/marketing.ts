import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerAgent } from "../director.ts";

export class MarketingAgent extends BaseAgent {
  constructor() {
    super({
      name: "Marketing",
      skillPath: "modules/marketing/SKILL.md",
      maxTokens: 8192,
    });
    registerStandardTools(this);

    this.registerTool(
      {
        name: "schedule_content",
        description:
          "Schedule a LinkedIn post, newsletter, or ad creative for publishing. Triggers MKT-01 Zapier workflow.",
        input_schema: {
          type: "object" as const,
          properties: {
            platform: {
              type: "string",
              enum: ["linkedin", "newsletter", "meta-ads", "google-ads"],
            },
            content: { type: "string", description: "The content to publish" },
            publish_at: {
              type: "string",
              description: "ISO datetime for scheduled publish",
            },
            campaign: {
              type: "string",
              description: "Campaign or content series name",
            },
          },
          required: ["platform", "content"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "content_scheduled",
        ...input,
        content_id: `CTN-${Date.now()}`,
      }),
    );
  }
}

export function createMarketingAgent(): MarketingAgent {
  return new MarketingAgent();
}

registerAgent("marketing", createMarketingAgent);
