import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerAgent } from "../director.ts";

export class SalesCallCoachAgent extends BaseAgent {
  constructor() {
    super({
      name: "SalesCallCoach",
      skillPath: "custom/sales-call-coach/SKILL.md",
      maxTokens: 12288,
    });
    registerStandardTools(this);

    this.registerTool(
      {
        name: "save_coaching_report",
        description:
          "Save a scored sales call coaching report to Notion Module Memory. Tracks rep performance over time.",
        input_schema: {
          type: "object" as const,
          properties: {
            call_date: { type: "string", description: "ISO date" },
            rep_name: { type: "string" },
            overall_score: {
              type: "number",
              description: "Overall score out of 100",
            },
            category_scores: {
              type: "object",
              description:
                "Scores per category: opener, discovery, quantification, solution, objections, close",
            },
            top_strength: { type: "string" },
            top_improvement: { type: "string" },
            scripted_fix: {
              type: "string",
              description: "Word-for-word script to use next time",
            },
          },
          required: ["rep_name", "overall_score"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "coaching_report_saved",
        report_id: `COACH-${Date.now()}`,
        ...input,
      }),
    );
  }
}

export function createSalesCallCoachAgent(): SalesCallCoachAgent {
  return new SalesCallCoachAgent();
}

registerAgent("sales-call-coach", createSalesCallCoachAgent);
