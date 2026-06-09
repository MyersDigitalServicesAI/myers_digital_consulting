import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { OnboardingWizard } from "@/components/portal/OnboardingWizard";
import { usePortalAuth } from "@/contexts/PortalAuthContext";
import { Zap } from "lucide-react";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { me, refreshMe } = usePortalAuth();

  async function handleComplete() {
    await refreshMe();
    setLocation("/portal/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          <span className="font-semibold text-sm">AIOS Client Portal</span>
          {me && (
            <span className="text-muted-foreground text-sm ml-auto">
              {me.tenant.company_name}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-2xl font-bold">
              Let&apos;s build your AIOS
            </h1>
            <p className="text-muted-foreground mt-2">
              Answer 6 quick sections about your business. This powers your
              custom SOPs, agent configurations, and automation stack.
            </p>
          </div>

          <OnboardingWizard onComplete={handleComplete} />
        </motion.div>
      </main>
    </div>
  );
}
