import { describe, expect, it } from "vitest";
import type Stripe from "stripe";
import {
  deriveTenantUpdate,
  getInvoiceSubscriptionId,
  getPeriodEnd,
  type StripeEventDeps,
} from "./stripe.ts";

const TENANT_ID = "11111111-2222-3333-4444-555555555555";

function makeDeps(overrides: Partial<StripeEventDeps> = {}): StripeEventDeps {
  return {
    findTenantIdBySubscription: async () => null,
    findTenantIdByCustomer: async () => null,
    ...overrides,
  };
}

function makeEvent(type: string, object: Record<string, unknown>): Stripe.Event {
  return {
    id: "evt_test_1",
    type,
    data: { object },
    livemode: false,
    created: 1750000000,
  } as unknown as Stripe.Event;
}

describe("deriveTenantUpdate", () => {
  it("activates the tenant on checkout.session.completed", async () => {
    const event = makeEvent("checkout.session.completed", {
      mode: "subscription",
      customer: "cus_123",
      subscription: "sub_123",
      metadata: { tenant_id: TENANT_ID, plan: "growth", interval: "month" },
    });

    const update = await deriveTenantUpdate(event, makeDeps());
    expect(update).not.toBeNull();
    expect(update!.tenantId).toBe(TENANT_ID);
    expect(update!.fields).toMatchObject({
      stripe_customer_id: "cus_123",
      stripe_subscription_id: "sub_123",
      plan: "growth",
      billing_interval: "month",
      paid: true,
      subscription_status: "active",
    });
  });

  it("ignores checkout sessions without tenant metadata", async () => {
    const event = makeEvent("checkout.session.completed", {
      mode: "subscription",
      customer: "cus_123",
      subscription: "sub_123",
      metadata: {},
    });
    expect(await deriveTenantUpdate(event, makeDeps())).toBeNull();
  });

  it("does not write an invalid plan value from metadata", async () => {
    const event = makeEvent("checkout.session.completed", {
      mode: "subscription",
      customer: "cus_123",
      subscription: "sub_123",
      metadata: { tenant_id: TENANT_ID, plan: "evil_plan", interval: "weekly" },
    });
    const update = await deriveTenantUpdate(event, makeDeps());
    expect(update!.fields).not.toHaveProperty("plan");
    expect(update!.fields).not.toHaveProperty("billing_interval");
  });

  it("syncs status and period end on customer.subscription.updated", async () => {
    const event = makeEvent("customer.subscription.updated", {
      id: "sub_123",
      status: "active",
      cancel_at_period_end: true,
      metadata: {},
      items: {
        data: [
          {
            current_period_end: 1760000000,
            price: { recurring: { interval: "year" } },
          },
        ],
      },
    });

    const deps = makeDeps({
      findTenantIdBySubscription: async (id) =>
        id === "sub_123" ? TENANT_ID : null,
    });

    const update = await deriveTenantUpdate(event, deps);
    expect(update!.tenantId).toBe(TENANT_ID);
    expect(update!.fields).toMatchObject({
      subscription_status: "active",
      cancel_at_period_end: true,
      paid: true,
      billing_interval: "year",
      current_period_end: new Date(1760000000 * 1000).toISOString(),
    });
  });

  it("falls back to subscription metadata when no tenant matches the id", async () => {
    const event = makeEvent("customer.subscription.updated", {
      id: "sub_999",
      status: "canceled",
      cancel_at_period_end: false,
      metadata: { tenant_id: TENANT_ID },
      items: { data: [] },
    });

    const update = await deriveTenantUpdate(event, makeDeps());
    expect(update!.tenantId).toBe(TENANT_ID);
    expect(update!.fields).toMatchObject({
      subscription_status: "canceled",
      paid: false,
    });
  });

  it("revokes access and pauses the tenant on subscription.deleted", async () => {
    const event = makeEvent("customer.subscription.deleted", {
      id: "sub_123",
      status: "canceled",
      metadata: {},
    });
    const deps = makeDeps({
      findTenantIdBySubscription: async () => TENANT_ID,
    });

    const update = await deriveTenantUpdate(event, deps);
    expect(update!.fields).toMatchObject({
      paid: false,
      subscription_status: "canceled",
      status: "paused",
    });
  });

  it("marks the tenant past_due on invoice.payment_failed", async () => {
    const event = makeEvent("invoice.payment_failed", {
      customer: "cus_123",
      subscription: "sub_123",
    });
    const deps = makeDeps({
      findTenantIdByCustomer: async (id) => (id === "cus_123" ? TENANT_ID : null),
    });

    const update = await deriveTenantUpdate(event, deps);
    expect(update!.fields).toEqual({ subscription_status: "past_due" });
  });

  it("restores active status on invoice.paid", async () => {
    const event = makeEvent("invoice.paid", {
      customer: "cus_123",
      parent: { subscription_details: { subscription: "sub_123" } },
    });
    const deps = makeDeps({
      findTenantIdByCustomer: async () => TENANT_ID,
    });

    const update = await deriveTenantUpdate(event, deps);
    expect(update!.fields).toEqual({ paid: true, subscription_status: "active" });
  });

  it("ignores one-off invoices with no subscription", async () => {
    const event = makeEvent("invoice.paid", { customer: "cus_123" });
    const deps = makeDeps({ findTenantIdByCustomer: async () => TENANT_ID });
    expect(await deriveTenantUpdate(event, deps)).toBeNull();
  });

  it("ignores unrelated event types", async () => {
    const event = makeEvent("payment_intent.succeeded", { id: "pi_1" });
    expect(await deriveTenantUpdate(event, makeDeps())).toBeNull();
  });
});

describe("getPeriodEnd", () => {
  it("reads the legacy top-level field", () => {
    const sub = { current_period_end: 1760000000, items: { data: [] } };
    expect(getPeriodEnd(sub as unknown as Stripe.Subscription)).toBe(
      new Date(1760000000 * 1000).toISOString()
    );
  });

  it("reads from subscription items on newer API versions", () => {
    const sub = { items: { data: [{ current_period_end: 1761111111 }] } };
    expect(getPeriodEnd(sub as unknown as Stripe.Subscription)).toBe(
      new Date(1761111111 * 1000).toISOString()
    );
  });

  it("returns null when absent", () => {
    const sub = { items: { data: [] } };
    expect(getPeriodEnd(sub as unknown as Stripe.Subscription)).toBeNull();
  });
});

describe("getInvoiceSubscriptionId", () => {
  it("reads the legacy invoice.subscription field", () => {
    const inv = { subscription: "sub_1" };
    expect(getInvoiceSubscriptionId(inv as unknown as Stripe.Invoice)).toBe(
      "sub_1"
    );
  });

  it("reads the basil parent.subscription_details path", () => {
    const inv = {
      parent: { subscription_details: { subscription: { id: "sub_2" } } },
    };
    expect(getInvoiceSubscriptionId(inv as unknown as Stripe.Invoice)).toBe(
      "sub_2"
    );
  });

  it("returns null for non-subscription invoices", () => {
    expect(getInvoiceSubscriptionId({} as unknown as Stripe.Invoice)).toBeNull();
  });
});
