import { useCallback, useEffect, useState } from "react";
import { useLocation, useSearchParams } from "wouter";
import { toast } from "sonner";
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  Receipt,
} from "lucide-react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { usePortalAuth } from "@/contexts/PortalAuthContext";
import { portalApi } from "@/lib/portal-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  PLANS,
  PLAN_KEYS,
  formatUsd,
  type BillingInterval,
  type BillingStatusResponse,
  type PlanKey,
} from "@shared/billing";

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-400/15 text-emerald-400" },
  trialing: { label: "Trial", className: "bg-cyan-400/15 text-cyan-400" },
  past_due: { label: "Past due", className: "bg-amber-400/15 text-amber-400" },
  canceled: { label: "Canceled", className: "bg-red-400/15 text-red-400" },
  unpaid: { label: "Unpaid", className: "bg-red-400/15 text-red-400" },
};

export default function Billing() {
  const { me, refreshMe } = usePortalAuth();
  const [, setLocation] = useLocation();
  const [searchParams] = useSearchParams();
  const [billing, setBilling] = useState<BillingStatusResponse | null>(null);
  const [annual, setAnnual] = useState(false);
  const [busyPlan, setBusyPlan] = useState<PlanKey | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);

  const loadBilling = useCallback(async () => {
    try {
      setBilling(await portalApi.billingStatus());
    } catch {
      // non-fatal — page still renders plan cards
    }
  }, []);

  useEffect(() => {
    loadBilling();
  }, [loadBilling]);

  // Handle return from Stripe Checkout
  useEffect(() => {
    const result = searchParams.get("checkout");
    if (!result) return;

    if (result === "success") {
      toast.success("Payment received — your subscription is being activated.");
      // The webhook may lag the redirect by a few seconds
      const timer = setTimeout(() => {
        refreshMe();
        loadBilling();
      }, 4000);
      refreshMe();
      loadBilling();
      setLocation("/portal/billing", { replace: true });
      return () => clearTimeout(timer);
    }
    if (result === "cancelled") {
      toast.info("Checkout cancelled — no charge was made.");
      setLocation("/portal/billing", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function startCheckout(plan: PlanKey) {
    const interval: BillingInterval = annual ? "year" : "month";
    setBusyPlan(plan);
    try {
      const { url } = await portalApi.createCheckout(plan, interval);
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start checkout");
      setBusyPlan(null);
    }
  }

  async function openBillingPortal() {
    setPortalBusy(true);
    try {
      const { url } = await portalApi.createBillingPortalSession();
      window.location.href = url;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to open billing portal"
      );
      setPortalBusy(false);
    }
  }

  if (!me) return null;

  const subStatus = billing?.subscriptionStatus ?? me.tenant.subscription_status;
  const hasActiveSub =
    subStatus != null && ["active", "trialing", "past_due"].includes(subStatus);
  const currentPlan = (billing?.plan ?? me.tenant.plan) as PlanKey | null;
  const badge = subStatus ? STATUS_BADGES[subStatus] : null;
  const periodEnd = billing?.currentPeriodEnd ?? me.tenant.current_period_end;

  return (
    <PortalLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage your AIOS plan, payment method, and invoices
          </p>
        </div>

        {/* Current subscription */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              Current subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium text-sm">
                {currentPlan && PLANS[currentPlan]
                  ? PLANS[currentPlan].name
                  : "No plan selected"}
              </span>
              {badge ? (
                <Badge variant="outline" className={`border-0 ${badge.className}`}>
                  {badge.label}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-0 bg-foreground/10 text-muted-foreground"
                >
                  Not subscribed
                </Badge>
              )}
            </div>

            {subStatus === "past_due" && (
              <p className="text-sm text-amber-400">
                Your last payment failed. Update your payment method in the
                billing portal to keep access.
              </p>
            )}

            {periodEnd && hasActiveSub && (
              <p className="text-sm text-muted-foreground">
                {billing?.cancelAtPeriodEnd || me.tenant.cancel_at_period_end
                  ? "Cancels on "
                  : "Renews on "}
                {new Date(periodEnd).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}

            {(billing?.hasStripeCustomer ?? Boolean(me.tenant.stripe_customer_id)) && (
              <Button
                variant="outline"
                size="sm"
                onClick={openBillingPortal}
                disabled={portalBusy}
              >
                {portalBusy ? (
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5 mr-2" />
                )}
                Manage billing
              </Button>
            )}

            {hasActiveSub && (
              <p className="text-xs text-muted-foreground">
                Plan changes, payment methods, and cancellation are handled in
                the secure Stripe billing portal.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Plan selection — only when there is no active subscription */}
        {!hasActiveSub && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">Choose your plan</h2>
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                Monthly
                <Switch checked={annual} onCheckedChange={setAnnual} />
                <span>
                  Annual{" "}
                  <span className="text-cyan-400 text-xs">2 months free</span>
                </span>
              </label>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {PLAN_KEYS.map((key) => {
                const plan = PLANS[key];
                const amount = annual ? plan.annualAmount : plan.monthlyAmount;
                return (
                  <Card
                    key={key}
                    className={
                      plan.highlighted
                        ? "border-cyan-400/50 relative"
                        : "relative"
                    }
                  >
                    {plan.highlighted && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider bg-cyan-400 text-black font-semibold rounded-full px-2 py-0.5">
                        Most popular
                      </span>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{plan.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {plan.tagline}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <span className="text-2xl font-bold">
                          {formatUsd(amount)}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          /{annual ? "yr" : "mo"}
                        </span>
                      </div>
                      <ul className="space-y-1.5">
                        {plan.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2 text-xs text-muted-foreground"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full"
                        variant={plan.highlighted ? "default" : "outline"}
                        onClick={() => startCheckout(key)}
                        disabled={busyPlan !== null}
                      >
                        {busyPlan === key && (
                          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                        )}
                        Subscribe
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Payments are processed securely by Stripe. You'll be redirected to
              complete checkout.
            </p>
          </div>
        )}

        {/* Invoices */}
        {billing && billing.invoices.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="w-4 h-4 text-cyan-400" />
                Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/50">
                {billing.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between py-2.5 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {inv.number ?? inv.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(inv.created * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-muted-foreground capitalize text-xs">
                        {inv.status}
                      </span>
                      <span className="font-medium">{formatUsd(inv.total)}</span>
                      {inv.hostedInvoiceUrl && (
                        <a
                          href={inv.hostedInvoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
}
