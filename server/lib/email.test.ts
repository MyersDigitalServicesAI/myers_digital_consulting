import { describe, expect, it } from "vitest";
import {
  buildInviteEmail,
  buildPaymentFailedEmail,
  buildSopsReadyEmail,
  isEmailConfigured,
} from "./email.ts";

describe("email templates", () => {
  it("invite email includes the join link, company, and greeting", () => {
    const { subject, html } = buildInviteEmail({
      companyName: "Acme Co",
      contactName: "Jane",
      joinUrl: "https://example.com/portal/join?token=abc",
    });
    expect(subject).toContain("Acme Co");
    expect(html).toContain("https://example.com/portal/join?token=abc");
    expect(html).toContain("Hi Jane,");
    expect(html).toContain("expires in 7 days");
  });

  it("invite email handles a missing contact name", () => {
    const { html } = buildInviteEmail({
      companyName: "Acme Co",
      contactName: null,
      joinUrl: "https://example.com/j",
    });
    expect(html).toContain("Hi,");
  });

  it("payment failed email links to billing", () => {
    const { subject, html } = buildPaymentFailedEmail({
      companyName: "Acme Co",
      billingUrl: "https://example.com/portal/billing",
    });
    expect(subject.toLowerCase()).toContain("payment failed");
    expect(html).toContain("https://example.com/portal/billing");
  });

  it("SOPs ready email includes the count and dashboard link", () => {
    const { subject, html } = buildSopsReadyEmail({
      companyName: "Acme Co",
      dashboardUrl: "https://example.com/portal/dashboard",
      sopCount: 8,
    });
    expect(subject).toContain("8");
    expect(html).toContain("https://example.com/portal/dashboard");
  });
});

describe("isEmailConfigured", () => {
  it("is false without env configuration", () => {
    // Test env has neither RESEND_API_KEY nor EMAIL_FROM set
    expect(isEmailConfigured()).toBe(false);
  });
});
