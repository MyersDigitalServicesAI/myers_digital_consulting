import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OnboardingFormData } from "@shared/portal.types";

const CADENCES = [
  "Daily",
  "3-4x per week",
  "1-2x per week",
  "Bi-weekly",
  "Monthly",
  "Ad hoc / no schedule",
];

export function StepOperations() {
  const { register, setValue, watch } = useFormContext<OnboardingFormData>();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">How your business operates</h2>
        <p className="text-muted-foreground text-sm mt-1">
          We find the bottlenecks and automate them out.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="biggestTimeWasters">
          Where does your team lose the most time? *
        </Label>
        <Textarea
          id="biggestTimeWasters"
          {...register("biggestTimeWasters", { required: true })}
          placeholder="e.g. manual follow-ups, scheduling, reporting, onboarding new clients..."
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Content publishing cadence</Label>
        <Select
          value={watch("contentCadence")}
          onValueChange={(v) => setValue("contentCadence", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="How often do you publish content?" />
          </SelectTrigger>
          <SelectContent>
            {CADENCES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
          <Checkbox
            id="usesCallRecording"
            checked={watch("usesCallRecording")}
            onCheckedChange={(v) => setValue("usesCallRecording", !!v)}
          />
          <div>
            <Label htmlFor="usesCallRecording" className="cursor-pointer font-medium">
              We record sales/service calls
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enables AIOS call analysis and coaching automations.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
          <Checkbox
            id="runsPaidAds"
            checked={watch("runsPaidAds")}
            onCheckedChange={(v) => setValue("runsPaidAds", !!v)}
          />
          <div>
            <Label htmlFor="runsPaidAds" className="cursor-pointer font-medium">
              We run paid advertising
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Meta, Google, LinkedIn, TikTok, etc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
