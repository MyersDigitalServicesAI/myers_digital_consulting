import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Mail, ArrowRight } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function PortalLogin() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const redirectTo = `${window.location.origin}/portal/auth/callback`;
    const { error: authErr } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });

    if (authErr) {
      setError(authErr.message);
      setLoading(false);
      return;
    }

    setSent(true);
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
              {sent ? "Check your inbox" : "Sign in to your portal"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center mx-auto">
                  <Mail className="w-7 h-7 text-cyan-400" />
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We sent a magic link to{" "}
                  <span className="text-foreground font-medium">{email}</span>.
                  Click it to sign in — no password needed.
                </p>
                <button
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="text-destructive text-xs">{error}</p>
                )}
                <Button
                  type="submit"
                  className="w-full bg-cyan-400 text-background hover:bg-cyan-300"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send magic link"}
                  {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  New client?{" "}
                  <span className="text-foreground">
                    Check your email for an invite link from Myers Digital.
                  </span>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
