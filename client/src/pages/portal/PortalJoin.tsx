import { useState, useEffect } from "react";
import { useSearch, useLocation } from "wouter";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { portalApi } from "@/lib/portal-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Mail, Loader2, AlertCircle } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function PortalJoin() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(search);
  const token = params.get("token") ?? "";

  const [state, setState] = useState<"validating" | "valid" | "invalid" | "sent">(
    "validating"
  );
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLocation("/portal/login");
      return;
    }
    portalApi
      .validateToken(token)
      .then((data) => {
        setCompanyName(data.companyName);
        setContactEmail(data.contactEmail);
        setEmail(data.contactEmail);
        setState("valid");
      })
      .catch((err: Error) => {
        setError(err.message);
        setState("invalid");
      });
  }, [token, setLocation]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const redirectTo = `${window.location.origin}/portal/auth/callback?join_token=${encodeURIComponent(token)}`;
    const { error: authErr } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });

    if (authErr) {
      setError(authErr.message);
      setLoading(false);
      return;
    }

    setState("sent");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div {...fadeUp} className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Zap className="w-6 h-6 text-cyan-400" />
          <span className="font-bold text-lg tracking-tight">AIOS Client Portal</span>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center">
              {state === "validating" && "Verifying your invite..."}
              {state === "valid" && `Welcome, ${companyName}`}
              {state === "invalid" && "Invalid invite link"}
              {state === "sent" && "Check your inbox"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state === "validating" && (
              <div className="flex justify-center py-6">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            )}

            {state === "invalid" && (
              <div className="text-center space-y-4 py-2">
                <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
                <p className="text-muted-foreground text-sm">{error}</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => setLocation("/portal/login")}
                >
                  Go to login
                </Button>
              </div>
            )}

            {state === "valid" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Myers Digital has invited you to your AIOS client portal.
                  Enter your email to receive a magic link and get started.
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Your email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={contactEmail || "you@company.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                {error && <p className="text-destructive text-xs">{error}</p>}
                <Button
                  type="submit"
                  className="w-full bg-cyan-400 text-background hover:bg-cyan-300"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Access my portal"}
                </Button>
              </form>
            )}

            {state === "sent" && (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center mx-auto">
                  <Mail className="w-7 h-7 text-cyan-400" />
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We sent a magic link to{" "}
                  <span className="text-foreground font-medium">{email}</span>.
                  Click it to activate your account.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
