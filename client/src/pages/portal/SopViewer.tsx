import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { portalApi } from "@/lib/portal-api";
import type { SOP } from "@shared/portal.types";
import { ArrowLeft, FileText } from "lucide-react";

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

export default function SopViewer() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [sop, setSop] = useState<SOP | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    portalApi
      .getSop(id)
      .then(({ sop: s }) => setSop(s))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const content = sop?.body?.content as string | undefined;
  const colorClass =
    DEPT_COLORS[sop?.department?.toLowerCase() ?? ""] ?? "border-border text-muted-foreground";

  return (
    <PortalLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/portal/dashboard")}
          className="text-muted-foreground -ml-1"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to dashboard
        </Button>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/4" />
            <div className="space-y-2 pt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-16 space-y-3">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        {sop && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                {sop.title ?? `${sop.department} SOP`}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`${colorClass}`}>
                  {sop.department}
                </Badge>
                <Badge variant="outline">{sop.status}</Badge>
                <span className="text-xs text-muted-foreground">
                  Generated {new Date(sop.generated_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="border-t border-border/50 pt-5">
              {content ? (
                <div className="prose prose-sm prose-invert max-w-none">
                  {content.split("\n").map((line, i) => {
                    if (line.startsWith("## ")) {
                      return (
                        <h2 key={i} className="text-base font-semibold mt-5 mb-2">
                          {line.slice(3)}
                        </h2>
                      );
                    }
                    if (line.startsWith("# ")) {
                      return (
                        <h1 key={i} className="text-lg font-bold mt-5 mb-2">
                          {line.slice(2)}
                        </h1>
                      );
                    }
                    if (line.startsWith("- ") || line.startsWith("* ")) {
                      return (
                        <li key={i} className="ml-4 text-sm text-muted-foreground leading-relaxed">
                          {line.slice(2)}
                        </li>
                      );
                    }
                    if (/^\d+\.\s/.test(line)) {
                      return (
                        <li key={i} className="ml-4 text-sm leading-relaxed list-decimal">
                          {line.replace(/^\d+\.\s/, "")}
                        </li>
                      );
                    }
                    if (line.trim() === "") {
                      return <br key={i} />;
                    }
                    return (
                      <p key={i} className="text-sm leading-relaxed">
                        {line}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No content available.</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </PortalLayout>
  );
}
