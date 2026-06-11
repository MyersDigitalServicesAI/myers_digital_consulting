import { describe, expect, it } from "vitest";
import { evaluateWebhookAuth, secretsMatch } from "./webhook-auth.ts";

describe("secretsMatch", () => {
  it("matches identical secrets", () => {
    expect(secretsMatch("abc123", "abc123")).toBe(true);
  });

  it("rejects different secrets of the same length", () => {
    expect(secretsMatch("abc123", "abc124")).toBe(false);
  });

  it("rejects secrets of different lengths without throwing", () => {
    expect(secretsMatch("short", "much-longer-secret")).toBe(false);
  });
});

describe("evaluateWebhookAuth", () => {
  it("allows a caller presenting the correct secret", () => {
    const d = evaluateWebhookAuth("s3cret", "s3cret", "production");
    expect(d.allow).toBe(true);
  });

  it("rejects a wrong secret with 401", () => {
    const d = evaluateWebhookAuth("wrong", "s3cret", "production");
    expect(d).toEqual({
      allow: false,
      status: 401,
      error: "Invalid webhook secret",
    });
  });

  it("rejects a missing secret with 401", () => {
    const d = evaluateWebhookAuth(undefined, "s3cret", "production");
    expect(d.allow).toBe(false);
  });

  it("fails closed in production when no secret is configured", () => {
    const d = evaluateWebhookAuth("anything", undefined, "production");
    expect(d.allow).toBe(false);
    if (!d.allow) expect(d.status).toBe(503);
  });

  it("allows unauthenticated calls outside production when unconfigured, with a warning", () => {
    const d = evaluateWebhookAuth(undefined, undefined, "development");
    expect(d.allow).toBe(true);
    if (d.allow) expect(d.warning).toContain("UNAUTHENTICATED");
  });
});
