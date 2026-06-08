import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";

interface QuizData {
  business_type: string;
  monthly_revenue: string;
  team_size: string;
  lead_sources: string[];
  follow_up_speed: string;
  after_call_process: string;
  current_crm: string;
  content_consistency: string;
  paid_ads: string[];
  email_marketing: string;
  performance_tracking: string;
  biggest_pain: string;
  most_manual: string[];
  first_name: string;
  business_name: string;
  email: string;
  phone: string;
  notes: string;
}

const EMPTY: QuizData = {
  business_type: "", monthly_revenue: "", team_size: "",
  lead_sources: [], follow_up_speed: "", after_call_process: "", current_crm: "",
  content_consistency: "", paid_ads: [], email_marketing: "",
  performance_tracking: "", biggest_pain: "", most_manual: [],
  first_name: "", business_name: "", email: "", phone: "", notes: "",
};

function Radio({ label, value, selected, onChange }: {
  label: string; value: string; selected: boolean; onChange: (v: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
        selected
          ? "border-primary bg-primary/10 text-foreground font-medium"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      <span className={`inline-block w-3.5 h-3.5 rounded-full border-2 mr-3 align-middle transition-colors flex-shrink-0 ${
        selected ? "border-primary bg-primary" : "border-muted-foreground"
      }`} />
      {label}
    </button>
  );
}

function Check({ label, value, selected, onToggle }: {
  label: string; value: string; selected: boolean; onToggle: (v: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(value)}
      className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
        selected
          ? "border-primary bg-primary/10 text-foreground font-medium"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded border-2 mr-3 align-middle transition-colors flex-shrink-0 ${
        selected ? "border-primary bg-primary" : "border-muted-foreground"
      }`}>
        {selected && (
          <svg viewBox="0 0 10 10" className="w-2.5 h-2.5">
            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

const STEPS = ["Your Business", "Sales Process", "Content & Marketing", "Operations", "Contact"];

export default function AiosQuiz() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<QuizData>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof QuizData>(k: K, v: QuizData[K]) =>
    setData(p => ({ ...p, [k]: v }));

  const toggle = (key: "lead_sources" | "paid_ads" | "most_manual", val: string) =>
    setData(p => ({
      ...p,
      [key]: p[key].includes(val) ? p[key].filter(x => x !== val) : [...p[key], val],
    }));

  const canAdvance = () => {
    if (step === 1) return !!(data.business_type && data.monthly_revenue && data.team_size);
    if (step === 2) return !!(data.lead_sources.length && data.follow_up_speed && data.after_call_process && data.current_crm);
    if (step === 3) return !!(data.content_consistency && data.paid_ads.length && data.email_marketing);
    if (step === 4) return !!(data.performance_tracking && data.biggest_pain && data.most_manual.length);
    if (step === 5) return !!(data.first_name.trim() && data.business_name.trim() && data.email.trim());
    return false;
  };

  const handleSubmit = async () => {
    if (!canAdvance()) return;
    setSubmitting(true);
    setError(null);
    try {
      await fetch("/webhooks/intake-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Email us directly at myersdigitalconsulting@gmail.com.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-3">Your Operational Audit Is On Its Way</h3>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          We've received your assessment. Check your email for a personalized intake form — we'll use your answers to map out exactly which AIOS agents and automations your business needs before we build anything.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Step progress */}
      <div className="flex items-center mb-8">
        {STEPS.map((title, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
              i + 1 < step ? "bg-primary text-primary-foreground" :
              i + 1 === step ? "ring-2 ring-primary bg-primary/20 text-primary" :
              "bg-card border border-border text-muted-foreground"
            }`}>
              {i + 1 < step ? "✓" : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-1 transition-colors ${i + 1 < step ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="mb-1 text-xs text-muted-foreground font-mono">STEP {step} OF 5</div>
      <h3 className="text-xl font-bold mb-6">{STEPS[step - 1]}</h3>

      {/* ── Step 1: Business ── */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium mb-3 text-muted-foreground">What type of business do you run?</p>
            <div className="space-y-2">
              {["Marketing / GHL Agency", "Consultant or Coach", "Home Services / Contractor", "E-commerce", "Other service business"].map(o =>
                <Radio key={o} label={o} value={o} selected={data.business_type === o} onChange={v => set("business_type", v)} />
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-3 text-muted-foreground">Approximate monthly revenue?</p>
            <div className="space-y-2">
              {["Under $20K", "$20K–$50K", "$50K–$100K", "$100K–$200K", "$200K+"].map(o =>
                <Radio key={o} label={o} value={o} selected={data.monthly_revenue === o} onChange={v => set("monthly_revenue", v)} />
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-3 text-muted-foreground">Team size?</p>
            <div className="space-y-2">
              {["Just me", "2–5 people", "6–15 people", "16+ people"].map(o =>
                <Radio key={o} label={o} value={o} selected={data.team_size === o} onChange={v => set("team_size", v)} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Sales ── */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium mb-3 text-muted-foreground">How do leads come in? <span className="font-normal">(select all)</span></p>
            <div className="space-y-2">
              {["Meta / Instagram Ads", "Google Ads", "Referrals", "Organic / SEO", "Cold outreach", "Other"].map(o =>
                <Check key={o} label={o} value={o} selected={data.lead_sources.includes(o)} onToggle={v => toggle("lead_sources", v)} />
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-3 text-muted-foreground">How fast do you follow up with new leads?</p>
            <div className="space-y-2">
              {["Within 5 minutes (automated)", "Same day", "Next day or later", "No consistent process"].map(o =>
                <Radio key={o} label={o} value={o} selected={data.follow_up_speed === o} onChange={v => set("follow_up_speed", v)} />
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-3 text-muted-foreground">What happens after a discovery call?</p>
            <div className="space-y-2">
              {["Automated follow-up sequence fires", "I manually follow up", "Varies — no consistent process"].map(o =>
                <Radio key={o} label={o} value={o} selected={data.after_call_process === o} onChange={v => set("after_call_process", v)} />
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-3 text-muted-foreground">Current CRM / sales software?</p>
            <div className="space-y-2">
              {["GoHighLevel", "HubSpot / Salesforce", "Spreadsheet or manual tracking", "None"].map(o =>
                <Radio key={o} label={o} value={o} selected={data.current_crm === o} onChange={v => set("current_crm", v)} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Content & Marketing ── */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium mb-3 text-muted-foreground">How consistently do you post content?</p>
            <div className="space-y-2">
              {["Multiple times per week across platforms", "Occasionally when I have time", "Rarely or never"].map(o =>
                <Radio key={o} label={o} value={o} selected={data.content_consistency === o} onChange={v => set("content_consistency", v)} />
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-3 text-muted-foreground">Running paid ads? <span className="font-normal">(select all)</span></p>
            <div className="space-y-2">
              {["Meta (Facebook / Instagram)", "Google Ads", "Neither — not running ads yet"].map(o =>
                <Check key={o} label={o} value={o} selected={data.paid_ads.includes(o)} onToggle={v => toggle("paid_ads", v)} />
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-3 text-muted-foreground">Email marketing?</p>
            <div className="space-y-2">
              {["Yes — automated sequences in place", "Yes — but I send manually", "No email marketing"].map(o =>
                <Radio key={o} label={o} value={o} selected={data.email_marketing === o} onChange={v => set("email_marketing", v)} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Operations ── */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium mb-3 text-muted-foreground">How do you track business performance?</p>
            <div className="space-y-2">
              {[
                "Live dashboard — real-time data",
                "Weekly spreadsheet review",
                "Monthly check-in at best",
                "I don't track consistently",
              ].map(o =>
                <Radio key={o} label={o} value={o} selected={data.performance_tracking === o} onChange={v => set("performance_tracking", v)} />
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-3 text-muted-foreground">Biggest operational pain right now?</p>
            <div className="space-y-2">
              {[
                "Leads falling through the cracks",
                "No consistent content going out",
                "Ads running with nobody watching",
                "No real financial visibility",
                "Everything feels manual and reactive",
              ].map(o =>
                <Radio key={o} label={o} value={o} selected={data.biggest_pain === o} onChange={v => set("biggest_pain", v)} />
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-3 text-muted-foreground">What's most manual in your business? <span className="font-normal">(select all)</span></p>
            <div className="space-y-2">
              {[
                "Lead follow-up and nurture",
                "Content creation and scheduling",
                "Ad monitoring and optimization",
                "Reporting and analytics",
                "Client onboarding",
                "Bookkeeping and expense tracking",
              ].map(o =>
                <Check key={o} label={o} value={o} selected={data.most_manual.includes(o)} onToggle={v => toggle("most_manual", v)} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 5: Contact ── */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">First name *</label>
              <input
                type="text"
                value={data.first_name}
                onChange={e => set("first_name", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                placeholder="Dustin"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Business name *</label>
              <input
                type="text"
                value={data.business_name}
                onChange={e => set("business_name", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                placeholder="Your Business"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Email *</label>
            <input
              type="email"
              value={data.email}
              onChange={e => set("email", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
              placeholder="you@yourbusiness.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">
              Phone <span className="text-muted-foreground font-normal normal-case">(optional)</span>
            </label>
            <input
              type="tel"
              value={data.phone}
              onChange={e => set("phone", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">
              What would your ideal AIOS do for you? <span className="text-muted-foreground font-normal normal-case">(optional)</span>
            </label>
            <textarea
              value={data.notes}
              onChange={e => set("notes", e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none placeholder:text-muted-foreground/50"
              placeholder="e.g. I want leads followed up automatically and content posting without me touching it..."
            />
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep(s => s - 1)} className="border-border">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        ) : <div />}

        {step < 5 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canAdvance()} className="glow-cyan-hover">
            Next <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canAdvance() || submitting} className="glow-cyan-hover">
            {submitting
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</>
              : <>Get My AIOS Blueprint <ArrowRight className="w-4 h-4 ml-2" /></>}
          </Button>
        )}
      </div>
    </div>
  );
}
