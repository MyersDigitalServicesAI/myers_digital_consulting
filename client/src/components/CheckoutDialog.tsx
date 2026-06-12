import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLANS, formatUsd, type PlanKey } from "@shared/billing";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Self-serve checkout entry: collects company + contact, then hands off to
 * Stripe Checkout via POST /api/public/checkout. Payment activates the tenant
 * and emails the portal invite (see server/webhooks/stripe.ts).
 */
export function CheckoutDialog({
  plan,
  onClose,
}: {
  plan: PlanKey | null;
  onClose: () => void;
}) {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const def = plan ? PLANS[plan] : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          companyName,
          contactName: contactName || undefined,
          contactEmail,
        }),
      });
      const body = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !body.url) {
        toast.error(body.error ?? "Could not start checkout — please try again.");
        setSubmitting(false);
        return;
      }
      window.location.href = body.url;
    } catch {
      toast.error("Could not start checkout — please try again.");
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={plan !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        {def && (
          <>
            <DialogHeader>
              <DialogTitle>
                Start {def.name.replace("AIOS — ", "")} —{" "}
                <span className="text-primary font-mono">
                  {formatUsd(def.monthlyAmount)}/mo
                </span>
              </DialogTitle>
              <DialogDescription>
                Plus a one-time {formatUsd(def.setupAmount)} setup fee, collected at
                checkout. Founding pricing — your rate is locked forever.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="checkout-company">Company name</Label>
                <Input
                  id="checkout-company"
                  required
                  minLength={2}
                  maxLength={120}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Roofing"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout-name">Your name</Label>
                <Input
                  id="checkout-name"
                  maxLength={120}
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout-email">Work email</Label>
                <Input
                  id="checkout-email"
                  type="email"
                  required
                  maxLength={254}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="jane@acme.com"
                />
                <p className="text-xs text-muted-foreground">
                  Your portal invite and receipts go here.
                </p>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full glow-cyan-hover"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting
                    checkout…
                  </>
                ) : (
                  <>
                    Continue to Secure Checkout{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Payments handled by Stripe. You'll get portal access right after.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
