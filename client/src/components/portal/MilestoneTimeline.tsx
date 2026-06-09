import { Check, Circle } from "lucide-react";
import type { WorkspaceStatus } from "@shared/portal.types";

const MILESTONES = [
  { key: "intake", label: "Intake complete", isDate: true },
  { key: "notion_workspace", label: "Notion workspace" },
  { key: "databases_built", label: "Databases built" },
  { key: "ghl_configured", label: "GHL configured" },
  { key: "zapier_core_active", label: "Zapier active" },
  { key: "agents_configured", label: "Agents configured" },
  { key: "voice_training_complete", label: "Voice training" },
  { key: "sops", label: "SOPs generated", isDate: true },
  { key: "system_test_passed", label: "System tested" },
  { key: "go_live_confirmed", label: "Go live!" },
] as const;

interface Props {
  status: WorkspaceStatus | null;
  intakeSubmitted: boolean;
}

export function MilestoneTimeline({ status, intakeSubmitted }: Props) {
  function isComplete(key: string): boolean {
    if (key === "intake") return intakeSubmitted;
    if (key === "sops") return !!status?.sops_generated_at;
    if (!status) return false;
    return !!status[key as keyof WorkspaceStatus];
  }

  const completedCount = MILESTONES.filter((m) => isComplete(m.key)).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Build progress</span>
        <span className="text-xs text-muted-foreground">
          {completedCount} / {MILESTONES.length} complete
        </span>
      </div>

      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-3 top-3 bottom-3 w-px bg-border" />

        <div className="space-y-2">
          {MILESTONES.map((m, i) => {
            const done = isComplete(m.key);
            const isPrev = i > 0 && isComplete(MILESTONES[i - 1].key);
            const isNext = !done && isPrev;

            return (
              <div key={m.key} className="flex items-center gap-3 relative">
                <div
                  className={[
                    "relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                    done
                      ? "bg-cyan-400 border-cyan-400"
                      : isNext
                      ? "border-cyan-400/60 bg-background animate-pulse"
                      : "border-border bg-background",
                  ].join(" ")}
                >
                  {done ? (
                    <Check className="w-3 h-3 text-background" />
                  ) : (
                    <Circle className="w-2 h-2 text-border" />
                  )}
                </div>
                <span
                  className={[
                    "text-sm transition-colors",
                    done
                      ? "text-foreground font-medium"
                      : isNext
                      ? "text-foreground/70"
                      : "text-muted-foreground",
                  ].join(" ")}
                >
                  {m.label}
                  {done && m.key === "go_live_confirmed" && (
                    <span className="ml-2 text-cyan-400">🎉</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
