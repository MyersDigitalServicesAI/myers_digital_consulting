import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerAgent } from "../director.ts";

export class GeoSeoAuditorAgent extends BaseAgent {
  constructor() {
    super({
      name: "GeoSeoAuditor",
      skillPath: "custom/geo-seo-auditor/SKILL.md",
      maxTokens: 12288,
    });
    registerStandardTools(this);

    this.registerTool(
      {
        name: "save_seo_audit",
        description:
          "Save a completed GEO+SEO audit report to Notion and deliver the 90-day action guide to the client via Zapier.",
        input_schema: {
          type: "object" as const,
          properties: {
            client_name: { type: "string" },
            business_name: { type: "string" },
            location: { type: "string" },
            google_search_score: { type: "number" },
            gbp_score: { type: "number" },
            ai_visibility_score: { type: "number" },
            top_keyword_gaps: {
              type: "array",
              items: { type: "string" },
            },
            priority_actions: {
              type: "array",
              items: { type: "string" },
              description: "Top 5 actions from 90-day guide",
            },
          },
          required: ["client_name", "business_name"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "seo_audit_saved",
        audit_id: `SEO-${Date.now()}`,
        ...input,
      }),
    );
  }
}

export function createGeoSeoAuditorAgent(): GeoSeoAuditorAgent {
  return new GeoSeoAuditorAgent();
}

registerAgent("geo-seo-auditor", createGeoSeoAuditorAgent);
