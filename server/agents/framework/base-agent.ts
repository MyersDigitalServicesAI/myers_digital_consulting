import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { resolve } from "path";

export interface AgentResult {
  success: boolean;
  output: string;
  toolCalls: Array<{ tool: string; input: unknown; result: unknown }>;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalCost: number; // USD
  };
  error?: string;
}

export interface AgentConfig {
  name: string;
  skillPath: string; // relative to aios/skills/
  maxTokens?: number;
}

export class BaseAgent {
  protected client: Anthropic;
  protected config: AgentConfig;
  protected systemPrompt: string;
  protected tools: Anthropic.Tool[];
  protected toolExecutors: Map<
    string,
    (input: Record<string, unknown>) => Promise<unknown>
  >;

  constructor(config: AgentConfig) {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.config = config;
    this.systemPrompt = this.loadSkill();
    this.tools = [];
    this.toolExecutors = new Map();
  }

  private loadSkill(): string {
    const skillPath = resolve(
      process.cwd(),
      "aios/skills",
      this.config.skillPath,
    );
    try {
      return readFileSync(skillPath, "utf-8");
    } catch {
      console.warn(
        `[${this.config.name}] Skill not found at ${skillPath}, using default prompt`,
      );
      return `You are the ${this.config.name} agent for Myers Digital Consulting. Act as a senior executive in your domain and provide actionable analysis and decisions.`;
    }
  }

  protected registerTool(
    tool: Anthropic.Tool,
    executor: (input: Record<string, unknown>) => Promise<unknown>,
  ): void {
    this.tools.push(tool);
    this.toolExecutors.set(tool.name, executor);
  }

  async run(task: string, context?: string): Promise<AgentResult> {
    const userContent = context
      ? `CONTEXT:\n${context}\n\nTASK:\n${task}`
      : task;

    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: userContent },
    ];
    const toolCalls: AgentResult["toolCalls"] = [];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    console.log(
      `[${this.config.name}] Starting: ${task.slice(0, 100)}${task.length > 100 ? "..." : ""}`,
    );

    for (let iteration = 0; iteration < 15; iteration++) {
      const params: Anthropic.MessageCreateParamsNonStreaming = {
        model: "claude-opus-4-7",
        max_tokens: this.config.maxTokens ?? 8192,
        thinking: { type: "adaptive" },
        system: this.systemPrompt,
        messages,
        ...(this.tools.length > 0 && { tools: this.tools }),
      };

      const response = await this.client.messages.create(params);
      totalInputTokens += response.usage.input_tokens;
      totalOutputTokens += response.usage.output_tokens;
      messages.push({ role: "assistant", content: response.content });

      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
      );

      if (toolUseBlocks.length === 0 || response.stop_reason === "end_turn") {
        const textBlock = response.content.find(
          (b): b is Anthropic.TextBlock => b.type === "text",
        );
        const totalCost =
          totalInputTokens * (5 / 1_000_000) +
          totalOutputTokens * (25 / 1_000_000);
        console.log(
          `[${this.config.name}] Completed (${iteration + 1} turns, $${totalCost.toFixed(4)})`,
        );
        return {
          success: true,
          output: textBlock?.text ?? "",
          toolCalls,
          tokenUsage: { inputTokens: totalInputTokens, outputTokens: totalOutputTokens, totalCost },
        };
      }

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of toolUseBlocks) {
        const executor = this.toolExecutors.get(block.name);
        let result: unknown;

        if (executor) {
          try {
            result = await executor(
              block.input as Record<string, unknown>,
            );
          } catch (err) {
            result = { error: `Tool execution failed: ${String(err)}` };
          }
        } else {
          result = { error: `Unknown tool: ${block.name}` };
        }

        console.log(`[${this.config.name}] → ${block.name}`);
        toolCalls.push({ tool: block.name, input: block.input, result });
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }

      messages.push({ role: "user", content: toolResults });
    }

    const totalCost =
      totalInputTokens * (5 / 1_000_000) +
      totalOutputTokens * (25 / 1_000_000);
    return {
      success: false,
      output: "",
      toolCalls,
      tokenUsage: { inputTokens: totalInputTokens, outputTokens: totalOutputTokens, totalCost },
      error: "Max iterations reached without completion",
    };
  }
}
