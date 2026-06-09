import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { portalApi } from "@/lib/portal-api";
import type { SOP } from "@shared/portal.types";
import { FileText, ChevronRight, Clock, Sparkles } from "lucide-react";

const DEPT_COLORS: Record<string, string> = {
  operations: "border-blue-400/40 text-blue-400",
  marketing: "border-purple-400/40 text-purple-400",
  sales: "border-green-400/40 text-green-400",
  finance: "border-amber-400/40 text-amber-400",
  content: "border-pink-400/40 text-pink-400",
  crm: "border-cyan-400/40 text-cyan-400",
  analytics: "border-orange-400/40 text-orange-400",
  delivery: "border-teal-400/40 text-teal-400",
};

interface Props {
  sopsGeneratedAt: string | null;
  intakeSubmitted: boolean;
}

export function SopsTab({ sopsGeneratedAt, intakeSubmitted }: Props) {
  const [, setLocation] = useLocation();
  const [sops, setSops] = useState<Omit<SOP, "body">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portalApi
      .listSops()
      .then(({ sops: s }) => setSops(s))
      .catch(() => setSops([]))
      .finally(() => setLoading(false));
  }, []);

  if (!intakeSubmitted) {
    return (
      <div className="text-center py-16 space-y-3">
        <FileText className="w-10 h-10 text-muted-foreground mx-auto" />
        <p className="font-medium">SOPs will be generated after your intake</p>
        <p className="text-sm text-muted-foreground">
          Complete your onboarding questionnaire to unlock your custom SOPs.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sops.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <div className="w-12 h-12 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6 text-cyan-400" />
        </div>
        <p className="font-medium">Generating your SOPs...</p>
        <p className="text-sm text-muted-foreground">
          Your custom SOPs are being created. This takes 1-3 minutes.
          Refresh the page in a moment.
        </p>
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>Usually ready in under 3 minutes</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sopsGeneratedAt && (
        <p className="text-xs text-muted-foreground">
          Generated {new Date(sopsGeneratedAt).toLocaleDateString()}
        </p>
      )}
      {sops.map((sop) => {
        const colorClass = DEPT_COLORS[sop.department?.toLowerCase()] ?? "border-border text-muted-foreground";
        return (
          <button
            key={sop.id}
            onClick={() => setLocation(`/portal/sops/${sop.id}`)}
            className="w-full text-left"
          >
            <Card className="border-border/50 hover:border-border transition-colors card-hover">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-foreground/5 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {sop.title ?? `${sop.department} SOP`}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge
                        variant="outline"
                        className={`text-xs px-1.5 py-0 ${colorClass}`}
                      >
                        {sop.department}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0"
                      >
                        {sop.status}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
