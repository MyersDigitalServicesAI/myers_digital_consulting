import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerSocialTools } from "../framework/tools/social-apis.ts";
import { registerAgent } from "../director.ts";

export class GoogleAdsManagerAgent extends BaseAgent {
  constructor() {
    super({
      name: "GoogleAdsManager",
      skillPath: "custom/google-ads-manager/SKILL.md",
      maxTokens: 8192,
    });
    registerStandardTools(this);
    registerSocialTools(this);

    // Keyword management
    this.registerTool(
      {
        name: "update_keyword_bid",
        description:
          "Adjust a Google Ads keyword CPC bid. Use when keyword has 50+ clicks and CPL is above/below target.",
        input_schema: {
          type: "object" as const,
          properties: {
            keyword: { type: "string" },
            current_bid_usd: { type: "number" },
            new_bid_usd: { type: "number" },
            reason: { type: "string" },
            campaign_name: { type: "string" },
          },
          required: ["keyword", "new_bid_usd", "reason"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "bid_updated",
        keyword: input.keyword,
        old_bid: input.current_bid_usd,
        new_bid: input.new_bid_usd,
        reason: input.reason,
      }),
    );

    // Negative keyword tool
    this.registerTool(
      {
        name: "add_negative_keywords",
        description:
          "Add negative keywords to a campaign to stop wasting spend on irrelevant searches.",
        input_schema: {
          type: "object" as const,
          properties: {
            campaign_name: { type: "string" },
            negative_keywords: {
              type: "array",
              items: { type: "string" },
              description: "Keywords to exclude",
            },
          },
          required: ["campaign_name", "negative_keywords"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "negatives_added",
        campaign: input.campaign_name,
        count: (input.negative_keywords as string[]).length,
        keywords: input.negative_keywords,
      }),
    );
  }
}

export function createGoogleAdsManagerAgent(): GoogleAdsManagerAgent {
  return new GoogleAdsManagerAgent();
}

registerAgent("google-ads-manager", createGoogleAdsManagerAgent);
