import { useEffect, useState } from "react";
import { Activity, CheckCircle2, Loader2, XCircle, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { portalApi } from "@/lib/portal-api";
import type { ActivityResponse } from "@shared/portal.types";

function agentLabel(agent: string): string {
  // "Director" → "AIOS Director", "social-media-manager" → "Social Media Manager"
  if (/^[A-Z]/.test(agent)) return `AIOS ${agent}`;
  return agent
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
}

export function ActivityTab() {
  const [data, setData] = useState<ActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portalApi
      .activity()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.runs.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-2">
          <Activity className="w-6 h-6 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">
            No agent activity yet — your AIOS goes to work as soon as your
            onboarding is complete.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4 flex items-center gap-3">
          <Zap className="w-5 h-5 text-cyan-400" />
          <div>
            <p className="text-lg font-bold leading-tight">
              {data.runsThisWeek} automation{data.runsThisWeek === 1 ? "" : "s"}
            </p>
            <p className="text-muted-foreground text-xs">
              run by your AIOS in the last 7 days
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {data.runs.map(run => (
          <div
            key={run.id}
            className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm"
          >
            <div className="flex items-center gap-2.5">
              {run.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>{agentLabel(run.agent)}</span>
            </div>
            <span className="text-muted-foreground text-xs">
              {timeAgo(run.created_at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
