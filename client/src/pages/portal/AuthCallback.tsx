import { useEffect, useState } from "react";
import { useSearch, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { portalApi } from "@/lib/portal-api";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthCallback() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const [error, setError] = useState("");

  useEffect(() => {
    async function handle() {
      // Supabase puts the session tokens in the URL hash after magic-link click
      const { data: sessionData, error: sessionErr } =
        await supabase.auth.getSession();

      if (sessionErr || !sessionData.session) {
        setError("Could not verify your login link. It may have expired.");
        return;
      }

      // Check for a join token from the invite flow
      const params = new URLSearchParams(search);
      const joinToken = params.get("join_token");

      if (joinToken) {
        try {
          await portalApi.linkAccount(joinToken);
        } catch {
          // Already linked or minor error — continue to check access
        }
      }

      // Determine where to redirect
      try {
        const me = await portalApi.me();
        if (me.tenant.status === "onboarding" && !me.intakeSubmitted) {
          setLocation("/portal/onboarding");
        } else {
          setLocation("/portal/dashboard");
        }
      } catch {
        // No tenant linked yet — shouldn't happen but be safe
        setError("Your account was created but could not be linked to a portal. Contact Myers Digital.");
      }
    }

    handle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
          <p className="text-muted-foreground text-sm">{error}</p>
          <Button variant="outline" onClick={() => setLocation("/portal/login")}>
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm">Signing you in...</p>
      </div>
    </div>
  );
}
