import { afterEach, describe, expect, it } from "vitest";
import { resolvePriceId } from "./billing-plans.ts";
import { PLANS, PLAN_KEYS, formatUsd, isPlanKey } from "../../shared/billing.ts";

afterEach(() => {
  delete process.env.STRIPE_PRICE_STARTER_MONTH;
});

describe("resolvePriceId", () => {
  it("returns a live price id for every plan/interval combination", () => {
    for (const plan of PLAN_KEYS) {
      for (const interval of ["month", "year"] as const) {
        expect(resolvePriceId(plan, interval)).toMatch(/^price_/);
      }
    }
  });

  it("returns distinct price ids across all combinations", () => {
    const ids = PLAN_KEYS.flatMap((plan) =>
      (["month", "year"] as const).map((interval) => resolvePriceId(plan, interval))
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("prefers environment overrides (e.g. test-mode prices)", () => {
    process.env.STRIPE_PRICE_STARTER_MONTH = "price_test_override";
    expect(resolvePriceId("starter", "month")).toBe("price_test_override");
    expect(resolvePriceId("starter", "year")).toMatch(/^price_1/);
  });
});

describe("plan catalog", () => {
  it("annual pricing equals ten months (two months free)", () => {
    for (const plan of Object.values(PLANS)) {
      expect(plan.annualAmount).toBe(plan.monthlyAmount * 10);
    }
  });

  it("validates plan keys strictly", () => {
    expect(isPlanKey("growth")).toBe(true);
    expect(isPlanKey("enterprise")).toBe(false);
    expect(isPlanKey(null)).toBe(false);
  });

  it("formats USD amounts from cents", () => {
    expect(formatUsd(250_000)).toBe("$2,500");
    expect(formatUsd(123_45)).toBe("$123.45");
  });
});
