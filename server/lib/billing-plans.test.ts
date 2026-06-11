import { afterEach, describe, expect, it } from "vitest";
import { resolvePriceId } from "./billing-plans.ts";
import { PLANS, PLAN_KEYS, formatUsd, isPlanKey } from "../../shared/billing.ts";

afterEach(() => {
  delete process.env.STRIPE_PRICE_STARTER_MONTH;
});

describe("resolvePriceId", () => {
  it("returns a live price id for every plan, monthly and setup", () => {
    for (const plan of PLAN_KEYS) {
      for (const kind of ["month", "setup"] as const) {
        expect(resolvePriceId(plan, kind)).toMatch(/^price_/);
      }
    }
  });

  it("returns distinct price ids across all combinations", () => {
    const ids = PLAN_KEYS.flatMap((plan) =>
      (["month", "setup"] as const).map((kind) => resolvePriceId(plan, kind))
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("prefers environment overrides (e.g. test-mode prices)", () => {
    process.env.STRIPE_PRICE_STARTER_MONTH = "price_test_override";
    expect(resolvePriceId("starter", "month")).toBe("price_test_override");
    expect(resolvePriceId("starter", "setup")).toMatch(/^price_1/);
  });
});

describe("plan catalog", () => {
  it("matches the public founding-client offer", () => {
    expect(PLANS.starter.monthlyAmount).toBe(149_700);
    expect(PLANS.starter.setupAmount).toBe(350_000);
    expect(PLANS.growth.monthlyAmount).toBe(299_700);
    expect(PLANS.growth.setupAmount).toBe(500_000);
    expect(PLANS.full_stack.monthlyAmount).toBe(499_700);
    expect(PLANS.full_stack.setupAmount).toBe(750_000);
  });

  it("validates plan keys strictly", () => {
    expect(isPlanKey("growth")).toBe(true);
    expect(isPlanKey("enterprise")).toBe(false);
    expect(isPlanKey(null)).toBe(false);
  });

  it("formats USD amounts from cents", () => {
    expect(formatUsd(350_000)).toBe("$3,500");
    expect(formatUsd(149_700)).toBe("$1,497");
    expect(formatUsd(123_45)).toBe("$123.45");
  });
});
