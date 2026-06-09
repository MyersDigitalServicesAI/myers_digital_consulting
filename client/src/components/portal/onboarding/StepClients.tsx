import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OnboardingFormData } from "@shared/portal.types";

export function StepClients() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingFormData>();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Your clients & offers</h2>
        <p className="text-muted-foreground text-sm mt-1">
          We build your sales and delivery systems around what you actually sell.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="servicesOffered">Services you offer *</Label>
        <Textarea
          id="servicesOffered"
          {...register("servicesOffered", { required: true })}
          placeholder="e.g. 1:1 business coaching, done-for-you social media, website design..."
          rows={2}
        />
        {errors.servicesOffered && (
          <p className="text-destructive text-xs">Required</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="packagesAndPricing">Packages & pricing</Label>
        <Textarea
          id="packagesAndPricing"
          {...register("packagesAndPricing")}
          placeholder="e.g. Starter $997/mo, Growth $2,497/mo, VIP $5,000 one-time..."
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deliveryTimeline">Typical delivery timeline</Label>
        <Input
          id="deliveryTimeline"
          {...register("deliveryTimeline")}
          placeholder="e.g. 30-day onboarding, 3-month engagement, ongoing retainer"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="topComplaints">
          Top 3 client complaints or frustrations
        </Label>
        <Textarea
          id="topComplaints"
          {...register("topComplaints")}
          placeholder="What do clients most commonly complain about or ask you to fix?"
          rows={3}
        />
      </div>
    </div>
  );
}
