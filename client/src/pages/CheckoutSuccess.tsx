import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Mail } from "lucide-react";
import { Link } from "wouter";

/** Landing page after a successful self-serve Stripe Checkout. */
export default function CheckoutSuccess() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <Card className="max-w-lg w-full bg-card border-border">
        <CardContent className="p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">
            You're in. <span className="text-primary">Welcome aboard.</span>
          </h1>
          <p className="text-muted-foreground mb-6">
            Payment received — your founding rate is locked forever. Your AIOS
            build starts now.
          </p>

          <div className="rounded-xl bg-primary/10 border border-primary/30 p-4 mb-8 flex items-start gap-3 text-left">
            <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Check your inbox.</strong> Your
              portal invite is on its way — activate your account and complete
              the 10-minute onboarding intake. That intake drives everything we
              build for you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="glow-cyan-hover">
              <Link href="/portal/login">
                Go to the Portal <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-border">
              <Link href="/">Back to the site</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
