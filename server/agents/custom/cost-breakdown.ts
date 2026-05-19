import Anthropic from "@anthropic-ai/sdk";
import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerAgent } from "../director.ts";

// Pricing per model
const PRICING: Record<string, { input: number; output: number }> = {
  opus:   { input: 5  / 1_000_000, output: 25 / 1_000_000 }, // claude-opus-4-7
  sonnet: { input: 3  / 1_000_000, output: 15 / 1_000_000 }, // claude-sonnet-4-6
};

const AGENT_PROFILES: Record<
  string,
  {
    name: string;
    model: "opus" | "sonnet";
    inputTokens: number;
    outputTokens: number;
    runsPerDay: number;
    schedule: string;
  }
> = {
  // Director is the only agent that stays on Opus 4.7 — complex multi-domain routing
  director: { name: "Director", model: "opus", inputTokens: 8500, outputTokens: 4500, runsPerDay: 5, schedule: "On-demand (webhooks)" },
  crm: { name: "CRM", model: "sonnet", inputTokens: 6500, outputTokens: 2500, runsPerDay: 3, schedule: "On-demand (GHL leads)" },
  finance: { name: "Finance", model: "sonnet", inputTokens: 7000, outputTokens: 3000, runsPerDay: 0.07, schedule: "1st Monday 9AM" },
  marketing: { name: "Marketing", model: "sonnet", inputTokens: 6500, outputTokens: 2500, runsPerDay: 0.14, schedule: "Weekly" },
  operations: { name: "Operations", model: "sonnet", inputTokens: 5500, outputTokens: 2000, runsPerDay: 0.14, schedule: "Weekly" },
  analytics: { name: "Analytics", model: "sonnet", inputTokens: 7000, outputTokens: 3500, runsPerDay: 1, schedule: "Daily 7AM" },
  hr: { name: "HR", model: "sonnet", inputTokens: 5500, outputTokens: 2000, runsPerDay: 0.14, schedule: "On-demand" },
  legal: { name: "Legal", model: "sonnet", inputTokens: 6500, outputTokens: 2500, runsPerDay: 0.07, schedule: "Monthly" },
  security: { name: "Security", model: "sonnet", inputTokens: 6500, outputTokens: 2500, runsPerDay: 0.14, schedule: "Weekly" },
  "transcript-miner": { name: "TranscriptMiner", model: "sonnet", inputTokens: 8500, outputTokens: 4000, runsPerDay: 1, schedule: "Daily 9AM" },
  "sales-call-coach": { name: "SalesCallCoach", model: "sonnet", inputTokens: 9500, outputTokens: 5500, runsPerDay: 2, schedule: "On-demand (call webhooks)" },
  "newsletter-writer": { name: "NewsletterWriter", model: "sonnet", inputTokens: 9500, outputTokens: 6000, runsPerDay: 0.14, schedule: "Tuesday weekly" },
  "scroll-stopper-ad": { name: "ScrollStopperAd", model: "sonnet", inputTokens: 9000, outputTokens: 5000, runsPerDay: 0.14, schedule: "Weekly" },
  bookkeeping: { name: "Bookkeeping", model: "sonnet", inputTokens: 7000, outputTokens: 3000, runsPerDay: 0.07, schedule: "1st of month" },
  "geo-seo-auditor": { name: "GeoSEOAuditor", model: "sonnet", inputTokens: 9000, outputTokens: 5000, runsPerDay: 0.5, schedule: "On-demand" },
  "meeting-transcript": { name: "MeetingTranscript", model: "sonnet", inputTokens: 7000, outputTokens: 3500, runsPerDay: 2, schedule: "On-demand (meetings)" },
  "social-media-manager": { name: "SocialMediaManager", model: "sonnet", inputTokens: 8000, outputTokens: 4000, runsPerDay: 1, schedule: "Tue 9AM + Thu 8AM" },
  "meta-ads-manager": { name: "MetaAdsManager", model: "sonnet", inputTokens: 8500, outputTokens: 4500, runsPerDay: 1, schedule: "Daily optimization" },
  "google-ads-manager": { name: "GoogleAdsManager", model: "sonnet", inputTokens: 8000, outputTokens: 4000, runsPerDay: 0.14, schedule: "Weekly" },
  "content-calendar": { name: "ContentCalendar", model: "sonnet", inputTokens: 9000, outputTokens: 5000, runsPerDay: 0.14, schedule: "Monday 8:30AM" },
  "ad-performance": { name: "AdPerformance", model: "sonnet", inputTokens: 9000, outputTokens: 5000, runsPerDay: 0.14, schedule: "Friday 4PM" },
  "cost-breakdown": { name: "CostBreakdown", model: "sonnet", inputTokens: 7500, outputTokens: 4000, runsPerDay: 0.14, schedule: "Monday 7AM" },
};

const GET_COST_MODEL_TOOL: Anthropic.Tool = {
  name: "get_cost_model",
  description:
    "Retrieve the complete cost model for all AIOS agents — estimated token usage, run frequency, cost per run, daily cost, and monthly projection. Returns structured data sorted by the requested field. Use this as the primary data source for the cost report.",
  input_schema: {
    type: "object" as const,
    properties: {
      sort_by: {
        type: "string",
        enum: ["daily_cost_desc", "cost_per_run_desc", "runs_per_day_desc", "name_asc"],
        description: "How to sort the agent list in the response",
      },
    },
  },
};

async function getCostModel(input: Record<string, unknown>): Promise<unknown> {
  const sortBy = (input.sort_by as string) ?? "daily_cost_desc";
  const today = new Date().toISOString().split("T")[0];

  const rows = Object.entries(AGENT_PROFILES).map(([key, p]) => {
    const price = PRICING[p.model];
    const costPerRun =
      p.inputTokens * price.input +
      p.outputTokens * price.output;
    const dailyCost = costPerRun * p.runsPerDay;
    return {
      key,
      name: p.name,
      model: p.model === "opus" ? "claude-opus-4-7" : "claude-sonnet-4-6",
      inputTokensPerRun: p.inputTokens,
      outputTokensPerRun: p.outputTokens,
      costPerRun: +costPerRun.toFixed(6),
      runsPerDay: p.runsPerDay,
      dailyCost: +dailyCost.toFixed(6),
      monthlyCost: +(dailyCost * 30).toFixed(4),
      schedule: p.schedule,
    };
  });

  const sorted = [...rows].sort((a, b) => {
    switch (sortBy) {
      case "cost_per_run_desc":
        return b.costPerRun - a.costPerRun;
      case "runs_per_day_desc":
        return b.runsPerDay - a.runsPerDay;
      case "name_asc":
        return a.name.localeCompare(b.name);
      default:
        return b.dailyCost - a.dailyCost;
    }
  });

  const totalDailyCost = rows.reduce((s, r) => s + r.dailyCost, 0);
  const totalMonthlyCost = totalDailyCost * 30;
  const byRunCost = [...rows].sort((a, b) => b.costPerRun - a.costPerRun);
  const byDailyCost = [...rows].sort((a, b) => b.dailyCost - a.dailyCost);

  return {
    generatedAt: today,
    models: {
      "claude-opus-4-7": { agents: ["Director"], pricing: { inputPerMillionTokens: 5.0, outputPerMillionTokens: 25.0 } },
      "claude-sonnet-4-6": { agents: "all others (21 agents)", pricing: { inputPerMillionTokens: 3.0, outputPerMillionTokens: 15.0 } },
    },
    agents: sorted,
    summary: {
      totalAgents: rows.length,
      totalDailyCost: +totalDailyCost.toFixed(4),
      totalMonthlyCost: +totalMonthlyCost.toFixed(2),
      totalAnnualCost: +(totalMonthlyCost * 12).toFixed(2),
      top5ByDailyCost: byDailyCost.slice(0, 5).map((r) => ({
        name: r.name,
        dailyCost: r.dailyCost,
        runsPerDay: r.runsPerDay,
      })),
      top5ByCostPerRun: byRunCost.slice(0, 5).map((r) => ({
        name: r.name,
        costPerRun: r.costPerRun,
        schedule: r.schedule,
      })),
      budgetAlert: totalDailyCost > 5.0,
      overBudgetAgents: rows.filter((r) => r.costPerRun > 0.5).map((r) => r.name),
    },
  };
}

export class CostBreakdownAgent extends BaseAgent {
  constructor() {
    super({
      name: "CostBreakdown",
      skillPath: "cost-breakdown/SKILL.md",
      maxTokens: 8192,
    });

    registerStandardTools(this);
    this.registerTool(GET_COST_MODEL_TOOL, getCostModel);
  }
}

export function createCostBreakdownAgent(): CostBreakdownAgent {
  return new CostBreakdownAgent();
}

registerAgent("cost-breakdown", () => new CostBreakdownAgent());
