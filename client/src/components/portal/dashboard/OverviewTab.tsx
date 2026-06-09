import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MilestoneTimeline } from "../MilestoneTimeline";
import type { PortalMeResponse } from "@shared/portal.types";
import { Building2, FileText, Calendar } from "lucide-react";

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  full_stack: "Full Stack",
};

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  onboarding: { label: "Onboarding", variant: "secondary" },
  active: { label: "Active", variant: "default" },
  paused: { label: "Paused", variant: "outline" },
};

interface Props {
  me: PortalMeResponse;
  sopCount: number;
}

export function OverviewTab({ me, sopCount }: Props) {
  const { tenant, workspaceStatus, companyProfile, intakeSubmitted } = me;
  const statusInfo = STATUS_LABELS[tenant.status] ?? STATUS_LABELS.onboarding;
  const daysSince = Math.floor(
    (Date.now() - new Date(tenant.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-5">
      {/* Status card */}
      <Card className="border-border/50">
        <CardContent className="pt-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">{tenant.company_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>Client for {daysSince} day{daysSince !== 1 ? "s" : ""}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {tenant.plan && (
                <Badge variant="outline" className="text-cyan-400 border-cyan-400/40">
                  {PLAN_LABELS[tenant.plan] ?? tenant.plan}
                </Badge>
              )}
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company profile (generated after intake) */}
      {companyProfile?.summary && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Your AI Business Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed">{companyProfile.summary}</p>
            {companyProfile.positioning && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Market positioning</p>
                <p className="text-sm">{companyProfile.positioning}</p>
              </div>
            )}
            {companyProfile.biggest_leverage && (
              <div className="p-3 rounded-lg bg-cyan-400/5 border border-cyan-400/20">
                <p className="text-xs font-medium text-cyan-400 mb-1">Biggest leverage point</p>
                <p className="text-sm">{companyProfile.biggest_leverage}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="text-xl font-bold">{sopCount}</p>
                <p className="text-xs text-muted-foreground">SOPs generated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-cyan-400 flex-shrink-0" />
              <div>
                <p className="text-xl font-bold">
                  {!intakeSubmitted
                    ? "Step 1"
                    : workspaceStatus?.go_live_confirmed
                    ? "Live"
                    : "Building"}
                </p>
                <p className="text-xs text-muted-foreground">Build status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestone timeline */}
      <Card className="border-border/50">
        <CardContent className="pt-5">
          <MilestoneTimeline status={workspaceStatus} intakeSubmitted={intakeSubmitted} />
        </CardContent>
      </Card>
    </div>
  );
}
