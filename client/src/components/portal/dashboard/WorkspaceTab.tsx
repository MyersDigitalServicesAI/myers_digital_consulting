import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, Circle } from "lucide-react";
import type { WorkspaceStatus } from "@shared/portal.types";

const PHASES = [
  {
    id: "phase1",
    label: "Phase 1 — Foundation",
    items: [
      { key: "notion_workspace", label: "Notion workspace created" },
      { key: "databases_built", label: "AIOS databases built" },
    ],
  },
  {
    id: "phase2",
    label: "Phase 2 — CRM (GHL)",
    items: [
      { key: "ghl_configured", label: "GHL sub-account configured" },
    ],
  },
  {
    id: "phase3",
    label: "Phase 3 — Automation (Zapier)",
    items: [
      { key: "zapier_core_active", label: "Core Zapier automations active" },
    ],
  },
  {
    id: "phase4",
    label: "Phase 4 — Agents",
    items: [
      { key: "agents_configured", label: "AI agents configured" },
    ],
  },
  {
    id: "phase5",
    label: "Phase 5 — Voice Training",
    items: [
      { key: "voice_training_complete", label: "Voice & brand training complete" },
    ],
  },
  {
    id: "phase6",
    label: "Phase 6 — Testing & Go-Live",
    items: [
      { key: "system_test_passed", label: "System test passed" },
      { key: "go_live_confirmed", label: "Go-live confirmed" },
    ],
  },
] as const;

interface Props {
  status: WorkspaceStatus | null;
  intakeSubmitted: boolean;
}

function MilestoneItem({
  label,
  done,
}: {
  label: string;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <div
        className={[
          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
          done ? "bg-cyan-400 border-cyan-400" : "border-border",
        ].join(" ")}
      >
        {done ? (
          <Check className="w-2.5 h-2.5 text-background" />
        ) : (
          <Circle className="w-2 h-2 text-border" />
        )}
      </div>
      <span className={`text-sm ${done ? "text-foreground" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}

export function WorkspaceTab({ status, intakeSubmitted }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Myers Digital marks each phase complete as your AIOS is built.
      </p>

      <MilestoneItem label="Intake questionnaire submitted" done={intakeSubmitted} />

      <Accordion type="multiple" className="space-y-2">
        {PHASES.map((phase) => {
          const allDone = phase.items.every(
            (item) =>
              status &&
              !!status[item.key as keyof WorkspaceStatus]
          );

          return (
            <AccordionItem
              key={phase.id}
              value={phase.id}
              className="border border-border/50 rounded-lg px-3 [&[data-state=open]]:border-border"
            >
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-2.5">
                  <div
                    className={[
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      allDone ? "bg-cyan-400 border-cyan-400" : "border-border",
                    ].join(" ")}
                  >
                    {allDone ? (
                      <Check className="w-2.5 h-2.5 text-background" />
                    ) : (
                      <Circle className="w-2 h-2 text-border" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{phase.label}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-3 pl-1">
                {phase.items.map((item) => (
                  <MilestoneItem
                    key={item.key}
                    label={item.label}
                    done={!!status?.[item.key as keyof WorkspaceStatus]}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
