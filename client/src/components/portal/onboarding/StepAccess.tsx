import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { OnboardingFormData } from "@shared/portal.types";

const DEPARTMENTS = [
  "Marketing",
  "Sales",
  "Operations",
  "Finance",
  "Content",
  "Customer Success",
  "Analytics",
  "HR / Recruiting",
];

export function StepAccess() {
  const { register, setValue, watch } = useFormContext<OnboardingFormData>();
  const selectedDepts = watch("departments") ?? [];

  function toggleDept(d: string) {
    const current = selectedDepts;
    if (current.includes(d)) {
      setValue(
        "departments",
        current.filter((v) => v !== d)
      );
    } else {
      setValue("departments", [...current, d]);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Access & final details</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Almost done — a few items needed before we can start your build.
        </p>
      </div>

      <div className="space-y-3">
        <Label>
          Which departments should AIOS cover?{" "}
          <span className="text-muted-foreground text-xs">(select all that apply)</span>
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {DEPARTMENTS.map((d) => {
            const isSelected = selectedDepts.includes(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleDept(d)}
                className={[
                  "p-2.5 rounded-lg border text-sm text-left transition-all",
                  isSelected
                    ? "border-cyan-400 bg-cyan-400/10 text-foreground"
                    : "border-border/50 hover:border-border text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
          <Checkbox
            id="notionInviteConfirmed"
            checked={watch("notionInviteConfirmed")}
            onCheckedChange={(v) => setValue("notionInviteConfirmed", !!v)}
          />
          <div>
            <Label htmlFor="notionInviteConfirmed" className="cursor-pointer font-medium">
              I have accepted the Notion workspace invite
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Check your email for an invite from Myers Digital.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
          <Checkbox
            id="zapierInviteConfirmed"
            checked={watch("zapierInviteConfirmed")}
            onCheckedChange={(v) => setValue("zapierInviteConfirmed", !!v)}
          />
          <div>
            <Label htmlFor="zapierInviteConfirmed" className="cursor-pointer font-medium">
              I have accepted the Zapier team invite
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Or I acknowledge I need to set this up.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="extraNotes">Anything else we should know?</Label>
        <Textarea
          id="extraNotes"
          {...register("extraNotes")}
          placeholder="Any special constraints, upcoming launches, or goals we should factor in..."
          rows={3}
        />
      </div>
    </div>
  );
}
