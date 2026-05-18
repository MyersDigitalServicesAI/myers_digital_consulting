import Anthropic from "@anthropic-ai/sdk";
import { BaseAgent, type AgentResult } from "./framework/base-agent.ts";
import { registerStandardTools } from "./framework/tools/standard.ts";

// Registry of module and custom agent factories — imported lazily to avoid circular deps
type AgentFactory = () => BaseAgent;

const AGENT_REGISTRY: Record<string, AgentFactory> = {};

export function registerAgent(name: string, factory: AgentFactory): void {
  AGENT_REGISTRY[name] = factory;
}

async function routeToAgent(
  input: Record<string, unknown>,
): Promise<unknown> {
  const { agent, task, context } = input as {
    agent: string;
    task: string;
    context?: string;
  };

  const factory = AGENT_REGISTRY[agent];
  if (!factory) {
    return {
      error: `No agent registered as '${agent}'`,
      available: Object.keys(AGENT_REGISTRY),
    };
  }

  try {
    const agentInstance = factory();
    const result = await agentInstance.run(task, context);
    return {
      agent,
      success: result.success,
      output: result.output,
      toolCallCount: result.toolCalls.length,
      error: result.error,
    };
  } catch (err) {
    return { error: `Agent '${agent}' threw: ${String(err)}` };
  }
}

export class DirectorAgent extends BaseAgent {
  constructor() {
    super({
      name: "Director",
      skillPath: "director/SKILL.md",
      maxTokens: 16384,
    });

    registerStandardTools(this);

    this.registerTool(
      {
        name: "route_to_agent",
        description:
          "Delegate a specific task to a specialist module agent (CRM, Finance, Marketing, Operations, Analytics, HR, Legal, Security) or a custom skill agent (transcript-miner, sales-call-coach, newsletter-writer, scroll-stopper-ad, bookkeeping, geo-seo-auditor, meeting-transcript, social-media-manager, meta-ads-manager, google-ads-manager, content-calendar, ad-performance). The agent will execute the task and return results.",
        input_schema: {
          type: "object" as const,
          properties: {
            agent: {
              type: "string",
              enum: [
                // Module agents
                "crm",
                "finance",
                "marketing",
                "operations",
                "analytics",
                "hr",
                "legal",
                "security",
                // Custom skill agents
                "transcript-miner",
                "sales-call-coach",
                "newsletter-writer",
                "scroll-stopper-ad",
                "bookkeeping",
                "geo-seo-auditor",
                "meeting-transcript",
                // Social & media agents
                "social-media-manager",
                "meta-ads-manager",
                "google-ads-manager",
                "content-calendar",
                "ad-performance",
              ],
              description: "Which specialist agent to dispatch this task to",
            },
            task: {
              type: "string",
              description:
                "The specific task to give the agent. Be explicit — include all context the agent needs.",
            },
            context: {
              type: "string",
              description: "Additional context or data the agent should use",
            },
          },
          required: ["agent", "task"],
        },
      },
      routeToAgent,
    );
  }
}

export function createDirectorAgent(): DirectorAgent {
  return new DirectorAgent();
}
