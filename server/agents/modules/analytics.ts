import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerAgent } from "../director.ts";

export class AnalyticsAgent extends BaseAgent {
  constructor() {
    super({
      name: "Analytics",
      skillPath: "modules/analytics/SKILL.md",
      maxTokens: 8192,
    });
    registerStandardTools(this);

    this.registerTool(
      {
        name: "generate_kpi_snapshot",
        description:
          "Pull current KPIs from all sources, calculate metrics, and write a snapshot to Notion KPI Snapshots database. Triggers DAT-01 Zap.",
        input_schema: {
          type: "object" as const,
          properties: {
            period: {
              type: "string",
              enum: ["daily", "weekly", "monthly"],
              description: "Reporting period",
            },
            modules: {
              type: "array",
              items: { type: "string" },
              description:
                "Which modules to include (default: all). Options: crm, finance, marketing, operations",
            },
          },
          required: ["period"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "kpi_snapshot",
        period: input.period,
        message: "Would aggregate KPIs from CRM, Finance, Marketing, Ops and write to Notion",
        snapshot_id: `KPI-${Date.now()}`,
      }),
    );

    this.registerTool(
      {
        name: "detect_anomaly",
        description:
          "Compare current metrics against baselines and flag significant deviations. Triggers DAT-03 anomaly alert Zap if threshold exceeded.",
        input_schema: {
          type: "object" as const,
          properties: {
            metric: { type: "string", description: "Metric name to analyze" },
            current_value: { type: "number" },
            baseline_value: { type: "number" },
            threshold_pct: {
              type: "number",
              description: "Alert if deviation exceeds this percentage (default 20)",
            },
          },
          required: ["metric", "current_value", "baseline_value"],
        },
      },
      async (input) => {
        const { current_value, baseline_value, threshold_pct = 20 } = input as {
          current_value: number;
          baseline_value: number;
          threshold_pct?: number;
          metric: string;
        };
        const deviation = Math.abs((current_value - baseline_value) / baseline_value) * 100;
        return {
          metric: input.metric,
          current_value,
          baseline_value,
          deviation_pct: deviation.toFixed(1),
          is_anomaly: deviation > threshold_pct,
          direction: current_value > baseline_value ? "up" : "down",
        };
      },
    );
  }
}

export function createAnalyticsAgent(): AnalyticsAgent {
  return new AnalyticsAgent();
}

registerAgent("analytics", createAnalyticsAgent);
