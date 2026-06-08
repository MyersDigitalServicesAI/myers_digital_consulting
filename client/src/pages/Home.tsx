import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Brain,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Menu,
  Rocket,
  Shield,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.08 } }),
};

const CSUITE = [
  { name: "Director", desc: "Routes every decision across the system" },
  { name: "CRM", desc: "Client health & churn risk scoring" },
  { name: "Finance", desc: "P&L, MRR, and cash flow monitoring" },
  { name: "Marketing", desc: "Pipeline & content strategy oversight" },
  { name: "Operations", desc: "GHL delivery & SLA management" },
  { name: "Analytics", desc: "Daily KPI digest & anomaly alerts" },
  { name: "HR", desc: "Team capacity & hiring intelligence" },
  { name: "Legal", desc: "Contracts & compliance monitoring" },
];

const SPECIALISTS = [
  { name: "Content Calendar", desc: "Plans the full week from top hooks" },
  { name: "Social Media Manager", desc: "LinkedIn, Instagram, Facebook, Twitter" },
  { name: "Meta Ads Manager", desc: "Daily optimization, pause/scale rules" },
  { name: "Google Ads Manager", desc: "Bid strategy & quality score management" },
  { name: "Transcript Miner", desc: "Mines calls for viral hooks automatically" },
  { name: "Newsletter Writer", desc: "7-part framework, A/B subject lines" },
  { name: "Sales Call Coach", desc: "100-point rubric + improvement scripts" },
  { name: "Scroll Stopper Ad Builder", desc: "High-converting creative from transcripts" },
  { name: "Bookkeeping Categorizer", desc: "Monthly P&L and expense sorting" },
  { name: "Meeting Transcript Agent", desc: "Action items & follow-ups from every call" },
  { name: "GEO/SEO Auditor", desc: "Local search visibility analysis" },
  { name: "Ad Performance Monitor", desc: "Blended CPL, winners/losers, recommendations" },
  { name: "Cost Breakdown Analyst", desc: "Weekly AI spend tracking & ROI reporting" },
  { name: "Voice Layer", desc: "Every output sounds like YOU, not AI" },
];

const SCHEDULE = [
  { time: "Every Day 7:00 AM", task: "Analytics digest — KPIs, anomalies, Slack summary" },
  { time: "Every Day 9:00 AM", task: "Transcript Miner — mines calls, scores & saves top hooks" },
  { time: "Monday 7:00 AM", task: "Cost report — AI spend across all 24 agents, weekly ROI" },
  { time: "Monday 8:30 AM", task: "Content Calendar — full week planned from top-scoring hook" },
  { time: "Tuesday 9:00 AM", task: "Social posts drafted — LinkedIn, Instagram, Facebook" },
  { time: "Wednesday", task: "Review & approve window — your only required touchpoint" },
  { time: "Thursday 8:00 AM", task: "Approved content publishes to all platforms" },
  { time: "Friday 4:00 PM", task: "Ad Performance — blended CPL, 3 actionable recommendations" },
  { time: "1st of Month", task: "Bookkeeping reminder + full Monthly P&L generated" },
];

const PRICING = [
  {
    name: "Starter",
    price: "$1,497",
    setup: "$3,500",
    highlight: false,
    agents: ["Director + CRM + Analytics", "Meeting Transcript Agent", "GEO/SEO Auditor", "Bookkeeping Categorizer"],
    best: "Owners who want visibility and automation without the full content machine.",
  },
  {
    name: "Growth",
    price: "$2,997",
    setup: "$5,000",
    highlight: true,
    agents: [
      "Everything in Starter",
      "Marketing + Content Calendar",
      "Social Media Manager",
      "Meta Ads + Transcript Miner",
      "Newsletter Writer + Ad Builder",
    ],
    best: "Businesses generating leads and content who want it all automated.",
  },
  {
    name: "Full Stack",
    price: "$4,997",
    setup: "$7,500",
    highlight: false,
    agents: [
      "All 24 agents active",
      "Complete automation stack",
      "All platforms wired",
      "Full Zapier + GHL integration",
    ],
    best: "Agency owners and high-volume service businesses who want total autonomy.",
  },
  {
    name: "Build-Out Only",
    price: "$12,500",
    setup: "One-time",
    highlight: false,
    agents: ["Full AIOS built for your business", "Complete handover documentation", "You run it yourself"],
    best: "Operators who want ownership without a monthly commitment.",
  },
];

const PRICE_TIERS = [
  { slots: "Clients 1–5 (NOW)", starter: "$1,497", growth: "$2,997", full: "$4,997", current: true },
  { slots: "Clients 6–10", starter: "$2,497", growth: "$3,997", full: "$5,997", current: false },
  { slots: "Clients 11–15", starter: "$3,497", growth: "$4,997", full: "$6,997", current: false },
  { slots: "Clients 16–20", starter: "$4,497", growth: "$5,997", full: "$7,997", current: false },
];

const DELIVERABLES = [
  "Full AIOS build — all 24 agents configured to your business",
  "7 Notion databases set up and populated with your data",
  "25 Zapier automations wired, tested, and live",
  "GHL webhook integration connected and verified",
  "Slack notifications for every alert and decision",
  "LinkedIn, Instagram, Facebook, Twitter connected",
  "Meta Ads + Google Ads monitoring active from day one",
  "30 SOPs documenting every automation in plain language",
  "Weekly cost report so you always know your exact ROI",
  "Your voice layer — every output sounds like you, not AI",
  "Ongoing monthly support included with all retainer plans",
];

const ICP = [
  {
    icon: TrendingUp,
    title: "Agency Owners",
    desc: "Running a marketing or GHL agency. Drowning in client work and can't scale without hiring. AIOS runs the back office while you close.",
  },
  {
    icon: Zap,
    title: "GHL Resellers",
    desc: "Selling GoHighLevel. Need a system to prove ROI to clients and run your own business professionally with real reporting.",
  },
  {
    icon: Brain,
    title: "Consultants & Coaches",
    desc: "High-ticket service businesses who create content, run ads, and close clients — but don't have a team to systemize any of it.",
  },
  {
    icon: Shield,
    title: "Contractors & Home Services",
    desc: "Local service businesses spending $500–$2,000/month on agencies with no reporting. AIOS replaces the agency and gives full visibility.",
  },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Myers Digital <span className="text-primary">Consulting</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {["how-it-works", "agents", "pricing", "contact"].map((id) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="text-muted-foreground hover:text-primary transition-colors capitalize"
                >
                  {id === "how-it-works" ? "How It Works" : id.charAt(0).toUpperCase() + id.slice(1)}
                </button>
              ))}
              <Button onClick={() => scrollTo("contact")} className="glow-cyan-hover">
                Book a Demo <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden pt-4 pb-2 flex flex-col gap-3"
            >
              {["how-it-works", "agents", "pricing", "contact"].map((id) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="text-left py-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {id === "how-it-works" ? "How It Works" : id.charAt(0).toUpperCase() + id.slice(1)}
                </button>
              ))}
              <Button onClick={() => scrollTo("contact")} className="w-full glow-cyan-hover">
                Book a Demo <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6">
                22 AI Agents · One Operating System · Zero Manual Overhead
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            >
              Your Business on{" "}
              <span className="text-primary">Autopilot.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl"
            >
              The Myers Digital AI Operating System runs your content, ads, CRM, finance, analytics, and operations — 24/7 — for less than a Netflix subscription per day.
            </motion.p>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="text-base text-muted-foreground mb-10 max-w-2xl"
            >
              What would cost{" "}
              <span className="text-foreground font-semibold">$13,000–$23,000/month</span> to hire runs autonomously for{" "}
              <span className="text-primary font-semibold">$2.04/day</span> in AI costs.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Button size="lg" onClick={() => scrollTo("contact")} className="text-lg px-8 py-6 glow-cyan glow-cyan-hover">
                Book Your Free Demo <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollTo("pricing")}
                className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10"
              >
                See Founding Pricing
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={5}
              className="flex flex-wrap gap-8"
            >
              {[
                { val: "22", label: "AI Agents" },
                { val: "$2.04", label: "Per Day" },
                { val: "300x", label: "ROI" },
                { val: "10 days", label: "Go Live" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-bold text-primary font-mono">{s.val}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Service Businesses Are{" "}
              <span className="text-destructive">Drowning in Operations</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              The average owner spends{" "}
              <strong className="text-foreground">35 hours/week</strong> on things that should run themselves.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Content", desc: "Never gets made consistently — ideas die in drafts" },
              { label: "Leads", desc: "Fall through the cracks with no follow-up system" },
              { label: "Ads", desc: "Burning money with no one actively watching" },
              { label: "Financials", desc: "Reviewed once a quarter — if you're lucky" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
              >
                <Card className="h-full bg-card border-border">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2 text-primary">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-center max-w-2xl mx-auto"
          >
            <p className="text-lg">
              Hiring a human team to fix all of this costs{" "}
              <strong className="text-foreground">$13,000–$23,000/month</strong>. Most owners can't afford it — so nothing gets fixed.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-4">
              The Stack
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Meet AIOS — Your{" "}
              <span className="text-primary">AI Operating System</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Three layers. One system. Fully autonomous.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-10">
            {[
              {
                icon: Brain,
                layer: "The Brain",
                tool: "Claude AI",
                desc: "Makes decisions, writes content, scores leads, analyzes data, and routes every task to the right specialist agent automatically.",
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                icon: FileText,
                layer: "The Memory",
                tool: "Notion",
                desc: "7 live databases storing every decision, KPI, interaction, SOP, and client record. Your business knowledge, always accessible.",
                color: "text-accent",
                bg: "bg-accent/10",
              },
              {
                icon: Zap,
                layer: "The Hands",
                tool: "Zapier + GHL",
                desc: "Fires 25 automations, routes leads, sends notifications, publishes content, and tracks revenue — all without human input.",
                color: "text-primary",
                bg: "bg-primary/10",
              },
            ].map((item, i) => (
              <motion.div
                key={item.tool}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
              >
                <Card className="h-full bg-card border-border">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center mx-auto mb-4`}>
                      <item.icon className={`w-8 h-8 ${item.color}`} />
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{item.layer}</div>
                    <h3 className="text-xl font-bold mb-3">{item.tool}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="hidden md:flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>Every layer talks to the others.</span>
            <ArrowRight className="w-4 h-4 text-primary" />
            <span>Every output is logged.</span>
            <ArrowRight className="w-4 h-4 text-primary" />
            <span>Every action is traceable.</span>
          </div>
        </div>
      </section>

      {/* ── 22 AGENTS ── */}
      <section id="agents" className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-4">
              The Team
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              22 Specialists.{" "}
              <span className="text-primary">Running 24/7.</span> No Sick Days.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              No Slack messages. No HR headaches. No payroll surprises. Just execution.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <h3 className="text-lg font-bold mb-4 text-accent">C-Suite Modules (8)</h3>
              <div className="space-y-2">
                {CSUITE.map((a) => (
                  <div key={a.name} className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-sm">{a.name}</span>
                      <span className="text-muted-foreground text-sm"> — {a.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={1}>
              <h3 className="text-lg font-bold mb-4 text-accent">Specialist Agents (14)</h3>
              <div className="space-y-2">
                {SPECIALISTS.map((a) => (
                  <div key={a.name} className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-sm">{a.name}</span>
                      <span className="text-muted-foreground text-sm"> — {a.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SCHEDULE ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              This Is What Happens{" "}
              <span className="text-primary">While You Sleep</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              17 webhook endpoints. 25 Zapier automations. Always on.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-2">
            {SCHEDULE.map((row, i) => (
              <motion.div
                key={row.time}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i * 0.5}
                className="grid grid-cols-[180px_1fr] gap-4 p-4 rounded-lg bg-card border border-border items-start"
              >
                <span className="text-primary text-sm font-mono font-semibold leading-snug">{row.time}</span>
                <span className="text-sm text-muted-foreground">{row.task}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-6 max-w-3xl mx-auto bg-primary/10 border border-primary/30 rounded-xl p-4 text-sm text-center"
          >
            <strong className="text-primary">Always on:</strong>{" "}
            <span className="text-muted-foreground">
              17 webhook endpoints fire in real-time for lead routing, CRM updates, and Slack alerts — no cron job delays, no missed triggers.
            </span>
          </motion.div>
        </div>
      </section>

      {/* ── THE MATH ── */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              The Math Is <span className="text-primary">Simple</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
            {[
              { icon: DollarSign, val: "$2.04", label: "Per Day", desc: "Total cost to run all 24 agents via Claude API" },
              { icon: TrendingUp, val: "$23K", label: "Human Team Cost", desc: "What the equivalent human team costs per month" },
              { icon: Rocket, val: "300x", label: "ROI", desc: "Return on every dollar spent — 150–300x depending on tier" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
              >
                <Card className="text-center bg-card border-border">
                  <CardContent className="p-8">
                    <s.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <div className="text-5xl font-bold text-primary font-mono mb-1">{s.val}</div>
                    <div className="font-semibold mb-2">{s.label}</div>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h3 className="text-xl font-bold mb-4 text-center">Competitive Comparison</h3>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-card border-b border-border">
                    <th className="text-left p-4 font-semibold">Option</th>
                    <th className="text-left p-4 font-semibold">Monthly Cost</th>
                    <th className="text-left p-4 font-semibold">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { option: "Hire the team", cost: "$13,000–$23,000", coverage: "Full ops" },
                    { option: "Marketing agency only", cost: "$3,000–$10,000", coverage: "Marketing only" },
                    { option: "SaaS tools (Jasper, HubSpot…)", cost: "$500–$2,000", coverage: "Partial, manual" },
                  ].map((row) => (
                    <tr key={row.option} className="border-b border-border">
                      <td className="p-4 text-muted-foreground">{row.option}</td>
                      <td className="p-4 text-muted-foreground">{row.cost}</td>
                      <td className="p-4 text-muted-foreground">{row.coverage}</td>
                    </tr>
                  ))}
                  <tr className="bg-primary/10">
                    <td className="p-4 font-bold text-primary">Myers Digital AIOS</td>
                    <td className="p-4 font-bold text-primary">$2,997–$4,997</td>
                    <td className="p-4 font-bold text-primary">Everything</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-accent/20 border border-accent/40 text-accent text-sm font-bold mb-4">
              Founding Client Pricing — First 5 Spots Only
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Three Tiers. <span className="text-primary">One Decision.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These prices are locked for the{" "}
              <strong className="text-foreground">first 5 clients only</strong>. Every 5 new clients, every price increases by $1,000 — permanently. Early clients lock their rate forever.
            </p>
          </motion.div>

          {/* Price escalation table */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto mb-16 rounded-xl border border-border overflow-hidden"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-card border-b border-border">
                  <th className="text-left p-4 font-semibold">Client Slots</th>
                  <th className="text-center p-4 font-semibold">Starter</th>
                  <th className="text-center p-4 font-semibold">Growth</th>
                  <th className="text-center p-4 font-semibold">Full Stack</th>
                </tr>
              </thead>
              <tbody>
                {PRICE_TIERS.map((row) => (
                  <tr key={row.slots} className={`border-b border-border ${row.current ? "bg-primary/10" : ""}`}>
                    <td className={`p-4 font-semibold ${row.current ? "text-primary" : "text-muted-foreground"}`}>
                      {row.slots} {row.current && "🔒"}
                    </td>
                    <td className={`p-4 text-center font-mono ${row.current ? "text-primary font-bold" : "text-muted-foreground"}`}>{row.starter}/mo</td>
                    <td className={`p-4 text-center font-mono ${row.current ? "text-primary font-bold" : "text-muted-foreground"}`}>{row.growth}/mo</td>
                    <td className={`p-4 text-center font-mono ${row.current ? "text-primary font-bold" : "text-muted-foreground"}`}>{row.full}/mo</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 bg-card text-center text-xs text-muted-foreground">
              Your price locks at the tier you join. It never goes up for you — even as we raise prices for new clients.
            </div>
          </motion.div>

          {/* Tier cards */}
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {PRICING.map((tier, i) => (
              <motion.div
                key={tier.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
              >
                <Card className={`h-full flex flex-col bg-card ${tier.highlight ? "border-primary ring-1 ring-primary" : "border-border"}`}>
                  <CardContent className="p-6 flex flex-col h-full">
                    {tier.highlight && (
                      <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Most Popular</div>
                    )}
                    <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                    <div className="text-3xl font-bold text-primary font-mono mb-1">{tier.price}</div>
                    <div className="text-xs text-muted-foreground mb-4">
                      {tier.setup === "One-time" ? "One-time · no retainer" : `+ ${tier.setup} setup`}
                    </div>
                    <ul className="space-y-2 mb-6 flex-1">
                      {tier.agents.map((a) => (
                        <li key={a} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{a}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground border-t border-border pt-4">
                      <strong className="text-foreground">Best for:</strong> {tier.best}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Button size="lg" onClick={() => scrollTo("contact")} className="text-lg px-10 py-6 glow-cyan glow-cyan-hover">
              Lock In Founding Pricing <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              5 founding spots. Once they're gone, the price goes up permanently.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Built for Service Businesses Doing{" "}
              <span className="text-primary">$20K–$200K/Month</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {ICP.map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
              >
                <Card className="h-full bg-card border-border">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DELIVERABLES ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything Is Included.{" "}
              <span className="text-primary">Nothing Is Left to Figure Out.</span>
            </h2>
            <p className="text-muted-foreground">From day one, your AIOS is fully configured, tested, and running.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
            {DELIVERABLES.map((item, i) => (
              <motion.div
                key={item}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i * 0.4}
                className="flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto bg-primary/10 border border-primary/30 rounded-xl p-5 text-center"
          >
            <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm">
              Most clients are fully live within{" "}
              <strong className="text-foreground">7–10 business days</strong> of kickoff. No long onboarding. No waiting months to see results.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── WHITE-LABEL PARTNER PROGRAM ── */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-accent/20 border border-accent/40 text-accent text-sm font-bold mb-4">
              For Agencies &amp; Consultants
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              White-Label AIOS.{" "}
              <span className="text-primary">Your Brand. Your Margin.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Already have clients who need this? We build and maintain the full AIOS stack under your brand. You sell it. You keep the margin. We do the build.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-14">
            {[
              {
                icon: Brain,
                title: "We Build It",
                desc: "Full AIOS deployment for your client — Director, all modules, Zapier stack, Notion workspace, voice training. 7–10 business days.",
              },
              {
                icon: Shield,
                title: "Your Brand On It",
                desc: "Every output, every email, every report carries your agency's name. Client never sees Myers Digital — only you.",
              },
              {
                icon: TrendingUp,
                title: "You Keep the Margin",
                desc: "We charge you wholesale. You charge your client retail. Typical partner margin: $500–$1,500/mo per client, recurring.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
              >
                <Card className="h-full bg-card border-border">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto rounded-xl border border-border overflow-hidden"
          >
            <div className="bg-card border-b border-border p-5">
              <h3 className="font-bold text-lg">Partner Program — What's Included</h3>
            </div>
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
              <div className="p-6 space-y-3">
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-4">Per Client Deployment</p>
                {[
                  "Full AIOS stack built to their business",
                  "White-labeled under your brand",
                  "Notion workspace + all 8 databases",
                  "Zapier stack (tier-appropriate Zaps)",
                  "Voice training for their communication style",
                  "7–10 day build + handoff",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <div className="p-6 space-y-3">
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-4">Partner Requirements</p>
                {[
                  "Minimum 3 client deployments in first 90 days",
                  "Active GHL agency account",
                  "You handle client relationship + support tier 1",
                  "Myers Digital handles build + tier 2 escalations",
                  "Setup: $5,000–$10,000 per client (wholesale)",
                  "Monthly: $500–$1,500/client (wholesale)",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 bg-primary/5 border-t border-border text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Partner inquiries are reviewed individually. Not every agency is the right fit — and that's intentional.
              </p>
              <Button
                onClick={() => {
                  const el = document.getElementById("contact");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Apply for Partner Program <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CONTACT / CTA ── */}
      <section id="contact" className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-4">
                5 Founding Spots Available
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Your Business Can{" "}
                <span className="text-primary">Run Itself.</span>
                <br />
                Let's Build It.
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Book a 30-minute AIOS demo. We'll map out exactly what would run automatically in your business — and show you the exact ROI before you spend a dollar.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: Bot, text: "30-Minute Demo — See your exact automation stack mapped out live" },
                  { icon: DollarSign, text: "Founding Pricing — Lock in the lowest price this system will ever be" },
                  { icon: Rocket, text: "Go Live in 10 Days — Full build, tested and running within two weeks" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground pt-1">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
                <p className="text-sm text-accent font-semibold">
                  No pitch decks. No fluff. Just a live walkthrough of your system.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={1}>
              <Card className="bg-card border-border">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6">Book Your Free AIOS Demo</h3>
                  <iframe
                    src="https://api.myersdigitalconsulting.com/widget/form/bJwjXi1z7vI6Lc0IWk9H"
                    style={{ width: "100%", height: "600px", border: "none", borderRadius: "3px" }}
                    id="inline-bJwjXi1z7vI6Lc0IWk9H"
                    data-layout={"{'id':'INLINE'}"}
                    data-trigger-type="alwaysShow"
                    data-trigger-value=""
                    data-activation-type="alwaysActivated"
                    data-activation-value=""
                    data-deactivation-type="neverDeactivate"
                    data-deactivation-value=""
                    data-form-name="Form 5"
                    data-height="undefined"
                    data-layout-iframe-id="inline-bJwjXi1z7vI6Lc0IWk9H"
                    data-form-id="bJwjXi1z7vI6Lc0IWk9H"
                    title="Book Your AIOS Demo"
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold">
                Myers Digital <span className="text-primary">Consulting</span>
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              {["how-it-works", "agents", "pricing", "contact"].map((id) => (
                <button key={id} onClick={() => scrollTo(id)} className="hover:text-primary transition-colors">
                  {id === "how-it-works" ? "How It Works" : id.charAt(0).toUpperCase() + id.slice(1)}
                </button>
              ))}
            </div>

            <p className="text-sm text-muted-foreground text-center">
              © 2026 Myers Digital Consulting · myersdigitalconsulting.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
