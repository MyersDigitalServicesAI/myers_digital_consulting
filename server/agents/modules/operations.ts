import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerGhlTools } from "../framework/tools/ghl.ts";
import { registerAgent } from "../director.ts";

export class OperationsAgent extends BaseAgent {
  constructor() {
    super({
      name: "Operations",
      skillPath: "modules/operations/SKILL.md",
      maxTokens: 8192,
    });
    registerStandardTools(this);
    registerGhlTools(this);
  }
}

export function createOperationsAgent(): OperationsAgent {
  return new OperationsAgent();
}

registerAgent("operations", createOperationsAgent);
