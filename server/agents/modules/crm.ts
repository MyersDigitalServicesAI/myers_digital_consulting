import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerGhlTools } from "../framework/tools/ghl.ts";
import { registerAgent } from "../director.ts";

export class CrmAgent extends BaseAgent {
  constructor() {
    super({
      name: "CRM",
      skillPath: "modules/crm/SKILL.md",
      maxTokens: 8192,
    });
    registerStandardTools(this);
    registerGhlTools(this);
  }
}

export function createCrmAgent(): CrmAgent {
  return new CrmAgent();
}

registerAgent("crm", createCrmAgent);
