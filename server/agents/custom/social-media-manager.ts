import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerSocialTools } from "../framework/tools/social-apis.ts";
import { registerAgent } from "../director.ts";

export class SocialMediaManagerAgent extends BaseAgent {
  constructor() {
    super({
      name: "SocialMediaManager",
      skillPath: "custom/social-media-manager/SKILL.md",
      maxTokens: 12288,
    });
    registerStandardTools(this);
    registerSocialTools(this);

    // Engagement monitoring tool
    this.registerTool(
      {
        name: "log_content_performance",
        description:
          "Log a published post's performance metrics to the Notion Content Calendar database for weekly review and strategy refinement.",
        input_schema: {
          type: "object" as const,
          properties: {
            platform: {
              type: "string",
              enum: ["linkedin", "facebook", "instagram", "twitter"],
            },
            post_preview: { type: "string", description: "First 100 chars of post" },
            hook_type: {
              type: "string",
              enum: ["proof", "education", "behind-the-scenes", "offer"],
            },
            impressions: { type: "number" },
            engagement_rate: { type: "number", description: "Percentage" },
            leads_generated: {
              type: "number",
              description: "DMs or link clicks that became leads",
            },
            published_at: { type: "string", description: "ISO datetime" },
          },
          required: ["platform", "post_preview", "hook_type"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "content_logged",
        record_id: `SOC-${Date.now()}`,
        ...input,
      }),
    );
  }
}

export function createSocialMediaManagerAgent(): SocialMediaManagerAgent {
  return new SocialMediaManagerAgent();
}

registerAgent("social-media-manager", createSocialMediaManagerAgent);
