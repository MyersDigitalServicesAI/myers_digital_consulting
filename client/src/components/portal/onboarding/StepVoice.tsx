import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { OnboardingFormData } from "@shared/portal.types";

const STYLES = [
  { value: "direct", label: "Direct & confident" },
  { value: "educational", label: "Educational & thorough" },
  { value: "conversational", label: "Conversational & warm" },
  { value: "professional", label: "Professional & polished" },
  { value: "bold", label: "Bold & provocative" },
  { value: "storytelling", label: "Story-driven" },
];

export function StepVoice() {
  const { register, setValue, watch } = useFormContext<OnboardingFormData>();
  const selected = watch("communicationStyle") ?? [];

  function toggle(value: string) {
    const current = selected;
    if (current.includes(value)) {
      setValue(
        "communicationStyle",
        current.filter((v) => v !== value)
      );
    } else if (current.length < 2) {
      setValue("communicationStyle", [...current, value]);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Your brand voice</h2>
        <p className="text-muted-foreground text-sm mt-1">
          AIOS agents communicate in your voice, not generic AI voice.
        </p>
      </div>

      <div className="space-y-2">
        <Label>
          Communication style{" "}
          <span className="text-muted-foreground text-xs">(pick up to 2)</span>
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {STYLES.map((s) => {
            const isSelected = selected.includes(s.value);
            const isDisabled = !isSelected && selected.length >= 2;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => toggle(s.value)}
                disabled={isDisabled}
                className={[
                  "p-3 rounded-lg border text-sm text-left transition-all",
                  isSelected
                    ? "border-cyan-400 bg-cyan-400/10 text-foreground"
                    : isDisabled
                    ? "border-border/30 text-muted-foreground/50 cursor-not-allowed"
                    : "border-border/50 hover:border-border text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contentExamples">
          Share 1-2 examples of content you love
        </Label>
        <Textarea
          id="contentExamples"
          {...register("contentExamples")}
          placeholder="e.g. Paste a LinkedIn post you wrote, or describe a podcast you love..."
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="avoidPhrases">
          Words or phrases to avoid
        </Label>
        <Textarea
          id="avoidPhrases"
          {...register("avoidPhrases")}
          placeholder="e.g. 'leverage', 'synergy', overly formal language, etc."
          rows={2}
        />
      </div>
    </div>
  );
}
