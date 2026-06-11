import { describe, expect, it } from "vitest";
import { checkoutSchema } from "./billing.ts";

describe("checkout request validation", () => {
  it("accepts every valid plan", () => {
    for (const plan of ["starter", "growth", "full_stack"]) {
      expect(checkoutSchema.safeParse({ plan }).success).toBe(true);
    }
  });

  it("rejects unknown plans", () => {
    expect(checkoutSchema.safeParse({ plan: "free" }).success).toBe(false);
  });

  it("rejects a missing plan", () => {
    expect(checkoutSchema.safeParse({}).success).toBe(false);
  });

  it("ignores extra fields like the retired interval", () => {
    const result = checkoutSchema.parse({ plan: "starter", interval: "year" });
    expect(result).toEqual({ plan: "starter" });
  });

  it("rejects injection-shaped input", () => {
    expect(checkoutSchema.safeParse({ plan: { $ne: null } }).success).toBe(false);
  });
});
