import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  supabaseAdmin,
  isSupabaseConfigured,
} from "../../lib/supabase-admin.ts";

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
  model?: string;
}

// USD per million tokens. Cache reads are ~0.1x base input price; cache
// writes (5-minute TTL) are 1.25x — see platform.claude.com/docs pricing.
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "claude-opus-4-8": { input: 5, output: 25 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};

export interface UsageTotals {
  inputTokens: number;
  outputTokens: number;
  cacheWriteTokens: number;
  cacheReadTokens: number;
}

export function computeRunCost(model: string, u: UsageTotals): number {
  // Unknown model id: price as Opus so the budget guard errs conservative.
  const p = MODEL_PRICING[model] ?? MODEL_PRICING["claude-opus-4-8"];
  return (
    (u.inputTokens * p.input +
      u.cacheWriteTokens * p.input * 1.25 +
      u.cacheReadTokens * p.input * 0.1 +
      u.outputTokens * p.output) /
    1_000_000
  );
}

/** Parse a USD budget env value; non-numeric or <= 0 falls back to the default. */
export function parseBudget(raw: string | undefined, fallback: number): number {
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const DEFAULT_MAX_RUN_COST_USD = 5;
const DEFAULT_DAILY_BUDGET_USD = 50;

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
      this.config.skillPath
    );
    try {
      return readFileSync(skillPath, "utf-8");
    } catch {
      console.warn(
        `[${this.config.name}] Skill not found at ${skillPath}, using default prompt`
      );
      return `You are the ${this.config.name} agent for Myers Digital Consulting. Act as a senior executive in your domain and provide actionable analysis and decisions.`;
    }
  }

  protected registerTool(
    tool: Anthropic.Tool,
    executor: (input: Record<string, unknown>) => Promise<unknown>
  ): void {
    this.tools.push(tool);
    this.toolExecutors.set(tool.name, executor);
  }

  private model(): string {
    return this.config.model ?? "claude-sonnet-4-6";
  }

  /**
   * Audit trail: persist every run to agent_runs (fire-and-forget — a
   * logging failure must never fail the run). No-op when Supabase isn't
   * configured (tests, local dev without env).
   */
  private recordRun(
    task: string,
    result: AgentResult,
    iterations: number,
    durationMs: number
  ): void {
    if (!isSupabaseConfigured()) return;
    void supabaseAdmin
      .from("agent_runs")
      .insert({
        agent: this.config.name,
        model: this.model(),
        task: task.slice(0, 500),
        success: result.success,
        error: result.error ?? null,
        output_preview: result.output.slice(0, 1000) || null,
        iterations,
        tool_call_count: result.toolCalls.length,
        input_tokens: result.tokenUsage.inputTokens,
        output_tokens: result.tokenUsage.outputTokens,
        cost_usd: result.tokenUsage.totalCost,
        duration_ms: durationMs,
      })
      .then(({ error }) => {
        if (error) {
          console.warn(
            `[${this.config.name}] failed to record run:`,
            error.message
          );
        }
      });
  }

  /** Sum of today's (UTC) recorded agent spend, or null when unknowable. */
  private async spentTodayUsd(): Promise<number | null> {
    if (!isSupabaseConfigured()) return null;
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const { data, error } = await supabaseAdmin
      .from("agent_runs")
      .select("cost_usd")
      .gte("created_at", startOfDay.toISOString());
    if (error || !data) return null; // fail open — a DB hiccup must not brick agents
    return data.reduce((sum, row) => sum + Number(row.cost_usd ?? 0), 0);
  }

  async run(task: string, context?: string): Promise<AgentResult> {
    const startedAt = Date.now();

    // Global kill switch: once today's recorded spend crosses the daily
    // budget, refuse new runs until midnight UTC.
    const dailyBudget = parseBudget(
      process.env.AIOS_DAILY_BUDGET_USD,
      DEFAULT_DAILY_BUDGET_USD
    );
    const spentToday = await this.spentTodayUsd();
    if (spentToday !== null && spentToday >= dailyBudget) {
      const error = `Daily agent budget reached ($${spentToday.toFixed(2)} of $${dailyBudget} — set AIOS_DAILY_BUDGET_USD to raise)`;
      console.warn(`[${this.config.name}] ${error}`);
      const result: AgentResult = {
        success: false,
        output: "",
        toolCalls: [],
        tokenUsage: { inputTokens: 0, outputTokens: 0, totalCost: 0 },
        error,
      };
      this.recordRun(task, result, 0, Date.now() - startedAt);
      return result;
    }

    const maxRunCost = parseBudget(
      process.env.AIOS_MAX_RUN_COST_USD,
      DEFAULT_MAX_RUN_COST_USD
    );

    const userContent = context
      ? `CONTEXT:\n${context}\n\nTASK:\n${task}`
      : task;

    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: userContent },
    ];
    const toolCalls: AgentResult["toolCalls"] = [];
    const totals: UsageTotals = {
      inputTokens: 0,
      outputTokens: 0,
      cacheWriteTokens: 0,
      cacheReadTokens: 0,
    };
    // Conversation-prefix cache marker — moved to the newest tool_result
    // each iteration so the whole history before it is served from cache.
    let lastCachedBlock: Anthropic.ToolResultBlockParam | null = null;

    console.log(
      `[${this.config.name}] Starting: ${task.slice(0, 100)}${task.length > 100 ? "..." : ""}`
    );

    for (let iteration = 0; iteration < 15; iteration++) {
      const params: Anthropic.MessageCreateParamsNonStreaming = {
        model: this.model(),
        max_tokens: this.config.maxTokens ?? 8192,
        thinking: { type: "adaptive" },
        // cache_control on the system block caches tools + system together —
        // they're re-sent on all 15 loop iterations otherwise.
        system: [
          {
            type: "text",
            text: this.systemPrompt,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages,
        ...(this.tools.length > 0 && { tools: this.tools }),
      };

      const response = await this.client.messages.create(params);
      totals.inputTokens += response.usage.input_tokens;
      totals.outputTokens += response.usage.output_tokens;
      totals.cacheWriteTokens +=
        response.usage.cache_creation_input_tokens ?? 0;
      totals.cacheReadTokens += response.usage.cache_read_input_tokens ?? 0;
      messages.push({ role: "assistant", content: response.content });

      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );

      if (toolUseBlocks.length === 0 || response.stop_reason === "end_turn") {
        const textBlock = response.content.find(
          (b): b is Anthropic.TextBlock => b.type === "text"
        );
        const totalCost = computeRunCost(this.model(), totals);
        console.log(
          `[${this.config.name}] Completed (${iteration + 1} turns, $${totalCost.toFixed(4)})`
        );
        const result: AgentResult = {
          success: true,
          output: textBlock?.text ?? "",
          toolCalls,
          tokenUsage: {
            inputTokens: totals.inputTokens,
            outputTokens: totals.outputTokens,
            totalCost,
          },
        };
        this.recordRun(task, result, iteration + 1, Date.now() - startedAt);
        return result;
      }

      // Runaway-loop guard: stop before the next (ever-larger) request.
      const runCost = computeRunCost(this.model(), totals);
      if (runCost >= maxRunCost) {
        const error = `Run cost cap reached ($${runCost.toFixed(2)} of $${maxRunCost} after ${iteration + 1} turns — set AIOS_MAX_RUN_COST_USD to raise)`;
        console.warn(`[${this.config.name}] ${error}`);
        const result: AgentResult = {
          success: false,
          output: "",
          toolCalls,
          tokenUsage: {
            inputTokens: totals.inputTokens,
            outputTokens: totals.outputTokens,
            totalCost: runCost,
          },
          error,
        };
        this.recordRun(task, result, iteration + 1, Date.now() - startedAt);
        return result;
      }

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of toolUseBlocks) {
        const executor = this.toolExecutors.get(block.name);
        let result: unknown;

        if (executor) {
          try {
            result = await executor(block.input as Record<string, unknown>);
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

      // Move the conversation cache marker to the newest tool_result (max 4
      // breakpoints per request — we use 2: system + this one).
      if (lastCachedBlock) delete lastCachedBlock.cache_control;
      lastCachedBlock = toolResults[toolResults.length - 1];
      lastCachedBlock.cache_control = { type: "ephemeral" };

      messages.push({ role: "user", content: toolResults });
    }

    const totalCost = computeRunCost(this.model(), totals);
    const result: AgentResult = {
      success: false,
      output: "",
      toolCalls,
      tokenUsage: {
        inputTokens: totals.inputTokens,
        outputTokens: totals.outputTokens,
        totalCost,
      },
      error: "Max iterations reached without completion",
    };
    this.recordRun(task, result, 15, Date.now() - startedAt);
    return result;
  }
}
