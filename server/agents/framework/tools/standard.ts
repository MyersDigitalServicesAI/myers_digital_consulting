import type { BaseAgent } from "../base-agent.ts";
import { registerNotionTools } from "./notion.ts";
import { registerZapierTools } from "./zapier.ts";

// Registers the full standard tool suite on any agent:
// notion_read, notion_write, log_decision, zapier_fire, notify_dustin
export function registerStandardTools(agent: BaseAgent): void {
  registerNotionTools(agent);
  registerZapierTools(agent);
}
