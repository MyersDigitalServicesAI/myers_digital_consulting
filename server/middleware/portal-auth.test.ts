import { describe, expect, it } from "vitest";
import { evaluateTenantAccess } from "./portal-auth.ts";

describe("evaluateTenantAccess", () => {
  it("allows an approved active tenant", () => {
    expect(
      evaluateTenantAccess({ status: "active", approved_by_admin: true })
    ).toEqual({ allow: true });
  });

  it("allows an approved tenant still in onboarding", () => {
    expect(
      evaluateTenantAccess({ status: "onboarding", approved_by_admin: true })
        .allow
    ).toBe(true);
  });

  it("blocks a paused tenant with 402 subscription_inactive", () => {
    const d = evaluateTenantAccess({
      status: "paused",
      approved_by_admin: true,
    });
    expect(d.allow).toBe(false);
    if (!d.allow) {
      expect(d.status).toBe(402);
      expect(d.code).toBe("subscription_inactive");
    }
  });

  it("blocks an unapproved tenant with 403", () => {
    const d = evaluateTenantAccess({
      status: "active",
      approved_by_admin: false,
    });
    expect(d.allow).toBe(false);
    if (!d.allow) expect(d.status).toBe(403);
  });

  it("blocks when the tenant row is missing", () => {
    const d = evaluateTenantAccess(null);
    expect(d.allow).toBe(false);
    if (!d.allow) expect(d.status).toBe(403);
  });
});
