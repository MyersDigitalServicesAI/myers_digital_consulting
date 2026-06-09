import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";
import { StepBusiness } from "./onboarding/StepBusiness";
import { StepTools } from "./onboarding/StepTools";
import { StepOperations } from "./onboarding/StepOperations";
import { StepVoice } from "./onboarding/StepVoice";
import { StepClients } from "./onboarding/StepClients";
import { StepAccess } from "./onboarding/StepAccess";
import { portalApi } from "@/lib/portal-api";
import type { OnboardingFormData } from "@shared/portal.types";

const STEPS = [
  { label: "Business", component: StepBusiness },
  { label: "Tools", component: StepTools },
  { label: "Operations", component: StepOperations },
  { label: "Voice", component: StepVoice },
  { label: "Clients", component: StepClients },
  { label: "Access", component: StepAccess },
];

interface Props {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const methods = useForm<OnboardingFormData>({
    defaultValues: {
      businessName: "",
      ownerName: "",
      website: "",
      industry: "",
      monthlyRevenue: "",
      teamSize: "",
      hasGhl: false,
      currentCrmTools: "",
      hasNotion: false,
      zapierMakeStatus: "",
      biggestTimeWasters: "",
      contentCadence: "",
      usesCallRecording: false,
      runsPaidAds: false,
      communicationStyle: [],
      contentExamples: "",
      avoidPhrases: "",
      servicesOffered: "",
      packagesAndPricing: "",
      deliveryTimeline: "",
      topComplaints: "",
      notionInviteConfirmed: false,
      zapierInviteConfirmed: false,
      extraNotes: "",
      departments: [],
    },
  });

  const CurrentStep = STEPS[step].component;
  const progress = ((step + 1) / STEPS.length) * 100;
  const isLast = step === STEPS.length - 1;

  async function handleNext() {
    const valid = await methods.trigger();
    if (!valid) return;

    if (isLast) {
      await handleSubmit();
    } else {
      setStep((s) => s + 1);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      await portalApi.submitOnboarding(methods.getValues());
      setSubmitted(true);
      setTimeout(onComplete, 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4 py-12"
      >
        <CheckCircle2 className="w-16 h-16 text-cyan-400 mx-auto" />
        <h2 className="text-2xl font-bold">You&apos;re all set!</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Your intake is saved. We&apos;re generating your custom SOPs and building
          your AIOS workspace now.
        </p>
        <p className="text-xs text-muted-foreground">
          Redirecting to your dashboard...
        </p>
      </motion.div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        {/* Progress header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="font-medium">{STEPS[step].label}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <div
                key={s.label}
                className={[
                  "h-0.5 flex-1 rounded-full transition-colors",
                  i <= step ? "bg-cyan-400" : "bg-border",
                ].join(" ")}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <CurrentStep />
          </motion.div>
        </AnimatePresence>

        {submitError && (
          <p className="text-destructive text-sm">{submitError}</p>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0 || submitting}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={submitting}
            className="bg-cyan-400 text-background hover:bg-cyan-300 min-w-[120px]"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLast ? (
              "Submit"
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </FormProvider>
  );
}
