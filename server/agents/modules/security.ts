import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerAgent } from "../director.ts";

export class SecurityAgent extends BaseAgent {
  constructor() {
    super({
      name: "Security",
      skillPath: "modules/security/SKILL.md",
      maxTokens: 8192,
    });
    registerStandardTools(this);

    this.registerTool(
      {
        name: "create_incident",
        description:
          "Create a security incident record and trigger the 4-level response protocol. Level 1-2: log only. Level 3: notify Dustin. Level 4: immediate escalation + lockdown.",
        input_schema: {
          type: "object" as const,
          properties: {
            level: {
              type: "number",
              enum: [1, 2, 3, 4],
              description: "1=Monitor, 2=Investigate, 3=Contain, 4=Emergency",
            },
            description: { type: "string" },
            affected_system: {
              type: "string",
              description: "e.g., 'GHL sub-account', 'Notion workspace', 'API keys'",
            },
            detected_by: {
              type: "string",
              description: "What triggered this alert",
            },
          },
          required: ["level", "description"],
        },
      },
      async (input) => {
        const level = input.level as number;
        return {
          incident_id: `SEC-${Date.now()}`,
          level,
          status: "created",
          auto_escalated: level >= 3,
          dustin_notified: level >= 3,
          note:
            level === 4
              ? "LEVEL 4: Immediate containment protocol initiated"
              : `Level ${level} incident logged`,
        };
      },
    );
  }
}

export function createSecurityAgent(): SecurityAgent {
  return new SecurityAgent();
}

registerAgent("security", createSecurityAgent);
