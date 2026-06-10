import { useEffect, useState } from "react";
import { Link } from "wouter";
import { CreditCard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { OverviewTab } from "@/components/portal/dashboard/OverviewTab";
import { SopsTab } from "@/components/portal/dashboard/SopsTab";
import { WorkspaceTab } from "@/components/portal/dashboard/WorkspaceTab";
import { ActivityTab } from "@/components/portal/dashboard/ActivityTab";
import { usePortalAuth } from "@/contexts/PortalAuthContext";
import { portalApi } from "@/lib/portal-api";

export default function Dashboard() {
  const { me, refreshMe } = usePortalAuth();
  const [sopCount, setSopCount] = useState(0);

  useEffect(() => {
    portalApi
      .listSops()
      .then(({ sops }) => setSopCount(sops.length))
      .catch(() => {});
  }, []);

  // Auto-refresh every 30s while SOPs are generating
  useEffect(() => {
    if (!me || me.workspaceStatus?.sops_generated_at) return;
    if (!me.intakeSubmitted) return;

    const interval = setInterval(async () => {
      await refreshMe();
      const { sops } = await portalApi.listSops().catch(() => ({ sops: [] }));
      setSopCount(sops.length);
    }, 30000);

    return () => clearInterval(interval);
  }, [me, refreshMe]);

  if (!me) return null;

  return (
    <PortalLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold">
            Welcome back, {me.tenant.contact_name ?? me.tenant.company_name}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Your AIOS client portal
          </p>
        </div>

        {!me.tenant.paid && (
          <Link
            href="/portal/billing"
            className="flex items-center gap-2.5 rounded-md border border-cyan-400/30 bg-cyan-400/5 px-3 py-2.5 text-sm hover:bg-cyan-400/10 transition-colors"
          >
            <CreditCard className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>
              <span className="font-medium text-cyan-400">
                Activate your subscription
              </span>{" "}
              <span className="text-muted-foreground">
                — choose a plan to unlock your full AIOS build.
              </span>
            </span>
          </Link>
        )}

        <Tabs defaultValue="overview">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview" className="flex-1 sm:flex-none">
              Overview
            </TabsTrigger>
            <TabsTrigger value="sops" className="flex-1 sm:flex-none">
              SOPs
              {sopCount > 0 && (
                <span className="ml-1.5 text-xs bg-cyan-400/20 text-cyan-400 rounded-full px-1.5 py-0.5 leading-none">
                  {sopCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="workspace" className="flex-1 sm:flex-none">
              Build status
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex-1 sm:flex-none">
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <OverviewTab me={me} sopCount={sopCount} />
          </TabsContent>

          <TabsContent value="sops" className="mt-4">
            <SopsTab
              sopsGeneratedAt={me.workspaceStatus?.sops_generated_at ?? null}
              intakeSubmitted={me.intakeSubmitted}
            />
          </TabsContent>

          <TabsContent value="workspace" className="mt-4">
            <WorkspaceTab
              status={me.workspaceStatus}
              intakeSubmitted={me.intakeSubmitted}
            />
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <ActivityTab />
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
}
