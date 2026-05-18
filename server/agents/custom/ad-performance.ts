import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerSocialTools } from "../framework/tools/social-apis.ts";
import { registerAgent } from "../director.ts";

export class AdPerformanceAgent extends BaseAgent {
  constructor() {
    super({
      name: "AdPerformance",
      skillPath: "custom/ad-performance/SKILL.md",
      maxTokens: 8192,
    });
    registerStandardTools(this);
    registerSocialTools(this);

    // Cross-platform report tool
    this.registerTool(
      {
        name: "generate_ad_performance_report",
        description:
          "Aggregate performance data from Meta, Google, and LinkedIn, calculate blended CPL, identify winners and losers, and write the weekly report to Notion KPI Snapshots.",
        input_schema: {
          type: "object" as const,
          properties: {
            period: {
              type: "string",
              enum: ["weekly", "monthly"],
            },
            meta_spend: { type: "number" },
            meta_leads: { type: "number" },
            google_spend: { type: "number" },
            google_leads: { type: "number" },
            linkedin_spend: { type: "number" },
            linkedin_leads: { type: "number" },
            best_creative: {
              type: "string",
              description: "Hook/headline of best performing ad",
            },
            recommended_actions: {
              type: "array",
              items: { type: "string" },
              description: "Top 3 specific changes to make this week",
            },
          },
          required: ["period"],
        },
      },
      async (input) => {
        const totalSpend =
          ((input.meta_spend as number) ?? 0) +
          ((input.google_spend as number) ?? 0) +
          ((input.linkedin_spend as number) ?? 0);
        const totalLeads =
          ((input.meta_leads as number) ?? 0) +
          ((input.google_leads as number) ?? 0) +
          ((input.linkedin_leads as number) ?? 0);
        const blendedCpl =
          totalLeads > 0 ? (totalSpend / totalLeads).toFixed(2) : "N/A";

        return {
          simulated: true,
          action: "ad_report_generated",
          report_id: `ADR-${Date.now()}`,
          period: input.period,
          total_spend: totalSpend,
          total_leads: totalLeads,
          blended_cpl: blendedCpl,
          best_creative: input.best_creative,
          recommended_actions: input.recommended_actions,
          written_to_notion: true,
        };
      },
    );

    // Pause/scale recommendation tool
    this.registerTool(
      {
        name: "recommend_budget_action",
        description:
          "Evaluate a campaign against benchmarks and recommend pause, maintain, or scale. Logs recommendation to Decision Log.",
        input_schema: {
          type: "object" as const,
          properties: {
            platform: {
              type: "string",
              enum: ["meta", "google", "linkedin"],
            },
            campaign_name: { type: "string" },
            spend: { type: "number" },
            leads: { type: "number" },
            ctr_pct: { type: "number" },
            cpl: { type: "number" },
          },
          required: ["platform", "campaign_name", "spend", "leads", "cpl"],
        },
      },
      async (input) => {
        const { platform, cpl, ctr_pct, spend, leads } = input as {
          platform: string;
          campaign_name: string;
          cpl: number;
          ctr_pct?: number;
          spend: number;
          leads: number;
        };

        const benchmarks: Record<string, number> = {
          meta: 30,
          google: 40,
          linkedin: 75,
        };

        const target = benchmarks[platform] ?? 40;
        let recommendation: string;
        let action: string;

        if (spend < 50) {
          recommendation = "Insufficient data — need $50+ spend before evaluating";
          action = "wait";
        } else if (cpl > target * 1.5) {
          recommendation = `CPL $${cpl} is ${Math.round((cpl / target - 1) * 100)}% over target ($${target}). Pause and refresh creative.`;
          action = "pause";
        } else if (cpl < target * 0.7 && (ctr_pct ?? 0) > 1.5) {
          recommendation = `CPL $${cpl} is 30%+ below target. Scale budget 20%.`;
          action = "scale";
        } else {
          recommendation = `CPL $${cpl} is within range of target ($${target}). Maintain current budget.`;
          action = "maintain";
        }

        return {
          platform,
          campaign: input.campaign_name,
          action,
          recommendation,
          spend,
          leads,
          cpl,
          target_cpl: target,
        };
      },
    );
  }
}

export function createAdPerformanceAgent(): AdPerformanceAgent {
  return new AdPerformanceAgent();
}

registerAgent("ad-performance", createAdPerformanceAgent);
