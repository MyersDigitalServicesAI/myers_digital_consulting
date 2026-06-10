import { type ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { usePortalAuth } from "@/contexts/PortalAuthContext";

export function PortalGuard({ children }: { children: ReactNode }) {
  const { session, me, loading } = usePortalAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      setLocation("/portal/login");
      return;
    }

    if (!me) {
      // Authenticated but no tenant — edge case, redirect to login
      setLocation("/portal/login");
      return;
    }

    // Paused = subscription lapsed/canceled. Billing is the only usable page;
    // the server rejects content routes with 402 in this state anyway.
    if (
      me.tenant.status === "paused" &&
      window.location.pathname !== "/portal/billing"
    ) {
      setLocation("/portal/billing");
      return;
    }

    if (
      me.tenant.status === "onboarding" &&
      !me.intakeSubmitted &&
      window.location.pathname !== "/portal/onboarding"
    ) {
      setLocation("/portal/onboarding");
    }
  }, [session, me, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Loading portal...</p>
        </div>
      </div>
    );
  }

  if (!session || !me) return null;

  return <>{children}</>;
}
