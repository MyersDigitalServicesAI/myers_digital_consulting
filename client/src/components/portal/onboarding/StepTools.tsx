import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
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

export function StepTools() {
  const { register, setValue, watch } = useFormContext<OnboardingFormData>();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Your current tech stack</h2>
        <p className="text-muted-foreground text-sm mt-1">
          We build around what you already use.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
          <Checkbox
            id="hasGhl"
            checked={watch("hasGhl")}
            onCheckedChange={(v) => setValue("hasGhl", !!v)}
          />
          <div>
            <Label htmlFor="hasGhl" className="cursor-pointer font-medium">
              I use GoHighLevel (GHL)
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              If active, AIOS will integrate directly with your GHL account.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
          <Checkbox
            id="hasNotion"
            checked={watch("hasNotion")}
            onCheckedChange={(v) => setValue("hasNotion", !!v)}
          />
          <div>
            <Label htmlFor="hasNotion" className="cursor-pointer font-medium">
              I use Notion
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Required for your AIOS memory layer and SOPs workspace.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="currentCrmTools">What CRM or sales tools do you use?</Label>
        <Input
          id="currentCrmTools"
          {...register("currentCrmTools")}
          placeholder="e.g. GHL, HubSpot, Salesforce, spreadsheets, none"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Automation tools</Label>
        <Select
          value={watch("zapierMakeStatus")}
          onValueChange={(v) => setValue("zapierMakeStatus", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Do you use Zapier or Make?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="zapier_active">Yes — Zapier (active)</SelectItem>
            <SelectItem value="make_active">Yes — Make (active)</SelectItem>
            <SelectItem value="both">Both Zapier and Make</SelectItem>
            <SelectItem value="none">Neither — starting fresh</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
