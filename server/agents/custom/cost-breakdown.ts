import Anthropic from "@anthropic-ai/sdk";
import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerAgent } from "../director.ts";

const INPUT_PRICE_PER_TOKEN = 5 / 1_000_000;
const OUTPUT_PRICE_PER_TOKEN = 25 / 1_000_000;

const AGENT_PROFILES: Record<
  string,
  {
    name: string;
    inputTokens: number;
    outputTokens: number;
    runsPerDay: number;
    schedule: string;
  }
> = {
  director: { name: "Director", inputTokens: 8500, outputTokens: 4500, runsPerDay: 5, schedule: "On-demand (webhooks)" },
  crm: { name: "CRM", inputTokens: 6500, outputTokens: 2500, runsPerDay: 3, schedule: "On-demand (GHL leads)" },
  finance: { name: "Finance", inputTokens: 7000, outputTokens: 3000, runsPerDay: 0.07, schedule: "1st Monday 9AM" },
  marketing: { name: "Marketing", inputTokens: 6500, outputTokens: 2500, runsPerDay: 0.14, schedule: "Weekly" },
  operations: { name: "Operations", inputTokens: 5500, outputTokens: 2000, runsPerDay: 0.14, schedule: "Weekly" },
  analytics: { name: "Analytics", inputTokens: 7000, outputTokens: 3500, runsPerDay: 1, schedule: "Daily 7AM" },
  hr: { name: "HR", inputTokens: 5500, outputTokens: 2000, runsPerDay: 0.14, schedule: "On-demand" },
  legal: { name: "Legal", inputTokens: 6500, outputTokens: 2500, runsPerDay: 0.07, schedule: "Monthly" },
  security: { name: "Security", inputTokens: 6500, outputTokens: 2500, runsPerDay: 0.14, schedule: "Weekly" },
  "transcript-miner": { name: "TranscriptMiner", inputTokens: 8500, outputTokens: 4000, runsPerDay: 1, schedule: "Daily 9AM" },
  "sales-call-coach": { name: "SalesCallCoach", inputTokens: 9500, outputTokens: 5500, runsPerDay: 2, schedule: "On-demand (call webhooks)" },
  "newsletter-writer": { name: "NewsletterWriter", inputTokens: 9500, outputTokens: 6000, runsPerDay: 0.14, schedule: "Tuesday weekly" },
  "scroll-stopper-ad": { name: "ScrollStopperAd", inputTokens: 9000, outputTokens: 5000, runsPerDay: 0.14, schedule: "Weekly" },
  bookkeeping: { name: "Bookkeeping", inputTokens: 7000, outputTokens: 3000, runsPerDay: 0.07, schedule: "1st of month" },
  "geo-seo-auditor": { name: "GeoSEOAuditor", inputTokens: 9000, outputTokens: 5000, runsPerDay: 0.5, schedule: "On-demand" },
  "meeting-transcript": { name: "MeetingTranscript", inputTokens: 7000, outputTokens: 3500, runsPerDay: 2, schedule: "On-demand (meetings)" },
  "social-media-manager": { name: "SocialMediaManager", inputTokens: 8000, outputTokens: 4000, runsPerDay: 1, schedule: "Tue 9AM + Thu 8AM" },
  "meta-ads-manager": { name: "MetaAdsManager", inputTokens: 8500, outputTokens: 4500, runsPerDay: 1, schedule: "Daily optimization" },
  "google-ads-manager": { name: "GoogleAdsManager", inputTokens: 8000, outputTokens: 4000, runsPerDay: 0.14, schedule: "Weekly" },
  "content-calendar": { name: "ContentCalendar", inputTokens: 9000, outputTokens: 5000, runsPerDay: 0.14, schedule: "Monday 8:30AM" },
  "ad-performance": { name: "AdPerformance", inputTokens: 9000, outputTokens: 5000, runsPerDay: 0.14, schedule: "Friday 4PM" },
  "cost-breakdown": { name: "CostBreakdown", inputTokens: 7500, outputTokens: 4000, runsPerDay: 0.14, schedule: "Monday 7AM" },
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
    const costPerRun =
      p.inputTokens * INPUT_PRICE_PER_TOKEN +
      p.outputTokens * OUTPUT_PRICE_PER_TOKEN;
    const dailyCost = costPerRun * p.runsPerDay;
    return {
      key,
      name: p.name,
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
    model: "claude-opus-4-7",
    pricing: {
      inputPerMillionTokens: 5.0,
      outputPerMillionTokens: 25.0,
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
