import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerSocialTools } from "../framework/tools/social-apis.ts";
import { registerAgent } from "../director.ts";

export class MetaAdsManagerAgent extends BaseAgent {
  constructor() {
    super({
      name: "MetaAdsManager",
      skillPath: "custom/meta-ads-manager/SKILL.md",
      maxTokens: 8192,
    });
    registerStandardTools(this);
    registerSocialTools(this);

    // Budget scaling tool
    this.registerTool(
      {
        name: "scale_meta_ad",
        description:
          "Increase a Meta ad set budget by a percentage. Only use when CPL < $20 AND CTR > 2% for at least 3 days. Max 20% increase per day.",
        input_schema: {
          type: "object" as const,
          properties: {
            adset_id: { type: "string" },
            current_budget_usd: { type: "number" },
            increase_pct: {
              type: "number",
              description: "Percentage to increase (max 20)",
            },
            reason: { type: "string", description: "Performance data justifying the scale" },
          },
          required: ["adset_id", "current_budget_usd", "increase_pct", "reason"],
        },
      },
      async (input) => {
        const increase = Math.min(input.increase_pct as number, 20);
        const current = input.current_budget_usd as number;
        const newBudget = +(current * (1 + increase / 100)).toFixed(2);
        return {
          simulated: true,
          action: "budget_scaled",
          adset_id: input.adset_id,
          old_budget: current,
          new_budget: newBudget,
          increase_pct: increase,
          reason: input.reason,
        };
      },
    );
  }
}

export function createMetaAdsManagerAgent(): MetaAdsManagerAgent {
  return new MetaAdsManagerAgent();
}

registerAgent("meta-ads-manager", createMetaAdsManagerAgent);
