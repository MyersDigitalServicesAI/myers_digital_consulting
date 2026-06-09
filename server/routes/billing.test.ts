import { describe, expect, it } from "vitest";
import { checkoutSchema } from "./billing.ts";

describe("checkout request validation", () => {
  it("accepts a valid plan and interval", () => {
    const result = checkoutSchema.safeParse({ plan: "growth", interval: "year" });
    expect(result.success).toBe(true);
  });

  it("defaults the interval to month", () => {
    const result = checkoutSchema.parse({ plan: "starter" });
    expect(result.interval).toBe("month");
  });

  it("rejects unknown plans", () => {
    expect(checkoutSchema.safeParse({ plan: "free" }).success).toBe(false);
  });

  it("rejects unknown intervals", () => {
    expect(
      checkoutSchema.safeParse({ plan: "starter", interval: "day" }).success
    ).toBe(false);
  });

  it("rejects injection-shaped input", () => {
    expect(
      checkoutSchema.safeParse({ plan: { $ne: null }, interval: "month" }).success
    ).toBe(false);
  });
});
