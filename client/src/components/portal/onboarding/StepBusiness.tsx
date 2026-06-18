import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OnboardingFormData } from "@shared/portal.types";

const INDUSTRIES = [
  "Coaching & Consulting",
  "Real Estate",
  "E-commerce",
  "Marketing Agency",
  "Health & Wellness",
  "Law / Legal Services",
  "Financial Services",
  "Construction / Trades",
  "SaaS / Tech",
  "Other",
];

const REVENUE_TIERS = [
  "Pre-revenue",
  "$1K – $10K/mo",
  "$10K – $30K/mo",
  "$30K – $75K/mo",
  "$75K+/mo",
];

const TEAM_SIZES = ["Solo", "2-5", "6-15", "16-50", "50+"];

export function StepBusiness() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<OnboardingFormData>();

  // These are controlled Selects, so they aren't registered by spreading
  // register() onto a native input. Register them explicitly so their required
  // rule is enforced by the wizard's trigger() gate before advancing/submitting.
  register("industry", { required: true });
  register("monthlyRevenue", { required: true });
  register("teamSize", { required: true });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">About your business</h2>
        <p className="text-muted-foreground text-sm mt-1">
          This helps us tailor your entire AIOS build to your business.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="businessName">Business name *</Label>
          <Input
            id="businessName"
            {...register("businessName", { required: true })}
            placeholder="Acme Consulting"
          />
          {errors.businessName && (
            <p className="text-destructive text-xs">Required</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerName">Your name *</Label>
          <Input
            id="ownerName"
            {...register("ownerName", { required: true })}
            placeholder="Jane Smith"
          />
          {errors.ownerName && (
            <p className="text-destructive text-xs">Required</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          {...register("website")}
          placeholder="https://yoursite.com"
          type="url"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Industry *</Label>
        <Select
          value={watch("industry")}
          onValueChange={(v) =>
            setValue("industry", v, { shouldValidate: true })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((i) => (
              <SelectItem key={i} value={i}>
                {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.industry && <p className="text-destructive text-xs">Required</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Monthly revenue *</Label>
          <Select
            value={watch("monthlyRevenue")}
            onValueChange={(v) =>
              setValue("monthlyRevenue", v, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {REVENUE_TIERS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.monthlyRevenue && (
            <p className="text-destructive text-xs">Required</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Team size *</Label>
          <Select
            value={watch("teamSize")}
            onValueChange={(v) =>
              setValue("teamSize", v, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {TEAM_SIZES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.teamSize && (
            <p className="text-destructive text-xs">Required</p>
          )}
        </div>
      </div>
    </div>
  );
}
