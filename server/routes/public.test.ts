import { describe, expect, it } from "vitest";
import { publicCheckoutSchema } from "./public.ts";

describe("publicCheckoutSchema", () => {
  const valid = {
    plan: "growth",
    companyName: "Acme Roofing",
    contactName: "Jane Doe",
    contactEmail: "jane@acme.com",
  };

  it("accepts a valid self-serve checkout request", () => {
    const parsed = publicCheckoutSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("contactName is optional", () => {
    const { contactName: _omit, ...rest } = valid;
    expect(publicCheckoutSchema.safeParse(rest).success).toBe(true);
  });

  it("rejects unknown plans (Build-Out is sales-led, not self-serve)", () => {
    expect(
      publicCheckoutSchema.safeParse({ ...valid, plan: "build_out" }).success
    ).toBe(false);
  });

  it("rejects invalid emails", () => {
    expect(
      publicCheckoutSchema.safeParse({ ...valid, contactEmail: "not-an-email" })
        .success
    ).toBe(false);
  });

  it("rejects a too-short company name", () => {
    expect(
      publicCheckoutSchema.safeParse({ ...valid, companyName: "A" }).success
    ).toBe(false);
  });

  it("trims whitespace", () => {
    const parsed = publicCheckoutSchema.safeParse({
      ...valid,
      companyName: "  Acme Roofing  ",
      contactEmail: " jane@acme.com ",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.companyName).toBe("Acme Roofing");
      expect(parsed.data.contactEmail).toBe("jane@acme.com");
    }
  });
});
