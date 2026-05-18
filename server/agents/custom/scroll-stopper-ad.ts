import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerAgent } from "../director.ts";

export class ScrollStopperAdAgent extends BaseAgent {
  constructor() {
    super({
      name: "ScrollStopperAd",
      skillPath: "custom/scroll-stopper-ad-skill/SKILL.md",
      maxTokens: 8192,
    });
    registerStandardTools(this);

    this.registerTool(
      {
        name: "save_ad_creative",
        description:
          "Save finished ad variants to Notion for Callan's review and selection before launch.",
        input_schema: {
          type: "object" as const,
          properties: {
            platform: {
              type: "string",
              enum: ["meta", "linkedin", "google"],
            },
            variant_a: {
              type: "object",
              description:
                "Ad variant A: { framework, headline, primary_text, cta }",
            },
            variant_b: {
              type: "object",
              description:
                "Ad variant B: { framework, headline, primary_text, cta }",
            },
            source_hook: {
              type: "string",
              description: "The hook or content this ad was built from",
            },
            target_audience: { type: "string" },
          },
          required: ["platform", "variant_a", "variant_b"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "ad_creative_saved",
        creative_id: `AD-${Date.now()}`,
        ...input,
        status: "Awaiting Callan Selection",
      }),
    );
  }
}

export function createScrollStopperAdAgent(): ScrollStopperAdAgent {
  return new ScrollStopperAdAgent();
}

registerAgent("scroll-stopper-ad", createScrollStopperAdAgent);
