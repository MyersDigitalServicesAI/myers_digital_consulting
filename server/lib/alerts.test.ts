import { describe, expect, it } from "vitest";
import { shouldAlert } from "./alerts.ts";

describe("shouldAlert cooldown", () => {
  it("allows the first alert for a key", () => {
    const seen = new Map<string, number>();
    expect(shouldAlert("crm:err", 1_000, seen, 10_000)).toBe(true);
  });

  it("suppresses repeats inside the cooldown window", () => {
    const seen = new Map<string, number>();
    expect(shouldAlert("crm:err", 1_000, seen, 10_000)).toBe(true);
    expect(shouldAlert("crm:err", 5_000, seen, 10_000)).toBe(false);
  });

  it("allows again after the cooldown has elapsed", () => {
    const seen = new Map<string, number>();
    expect(shouldAlert("crm:err", 1_000, seen, 10_000)).toBe(true);
    expect(shouldAlert("crm:err", 12_000, seen, 10_000)).toBe(true);
  });

  it("tracks different keys independently", () => {
    const seen = new Map<string, number>();
    expect(shouldAlert("crm:err", 1_000, seen, 10_000)).toBe(true);
    expect(shouldAlert("finance:err", 1_000, seen, 10_000)).toBe(true);
  });
});
