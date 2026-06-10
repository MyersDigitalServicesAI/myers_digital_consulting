import { describe, expect, it } from "vitest";
import { computeRunCost, parseBudget } from "./base-agent.ts";

describe("computeRunCost", () => {
  it("prices Sonnet at $3/$15 per MTok", () => {
    const cost = computeRunCost("claude-sonnet-4-6", {
      inputTokens: 1_000_000,
      outputTokens: 1_000_000,
      cacheWriteTokens: 0,
      cacheReadTokens: 0,
    });
    expect(cost).toBe(18);
  });

  it("prices Opus at $5/$25 per MTok", () => {
    const cost = computeRunCost("claude-opus-4-8", {
      inputTokens: 1_000_000,
      outputTokens: 1_000_000,
      cacheWriteTokens: 0,
      cacheReadTokens: 0,
    });
    expect(cost).toBe(30);
  });

  it("charges cache writes at 1.25x and reads at 0.1x input price", () => {
    const cost = computeRunCost("claude-sonnet-4-6", {
      inputTokens: 0,
      outputTokens: 0,
      cacheWriteTokens: 1_000_000, // 3 * 1.25 = 3.75
      cacheReadTokens: 1_000_000, // 3 * 0.1 = 0.30
    });
    expect(cost).toBeCloseTo(4.05, 5);
  });

  it("prices unknown models as Opus (conservative for budget guards)", () => {
    const usage = {
      inputTokens: 1_000_000,
      outputTokens: 0,
      cacheWriteTokens: 0,
      cacheReadTokens: 0,
    };
    expect(computeRunCost("some-future-model", usage)).toBe(5);
  });
});

describe("parseBudget", () => {
  it("parses a numeric value", () => {
    expect(parseBudget("12.5", 50)).toBe(12.5);
  });

  it("falls back when unset", () => {
    expect(parseBudget(undefined, 50)).toBe(50);
  });

  it("falls back on garbage and non-positive values", () => {
    expect(parseBudget("unlimited", 50)).toBe(50);
    expect(parseBudget("0", 50)).toBe(50);
    expect(parseBudget("-5", 50)).toBe(50);
  });
});
