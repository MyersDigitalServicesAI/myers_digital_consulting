import AiosQuiz from "@/components/AiosQuiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Brain,
  CheckCircle,
  FileText,
  Menu,
  Shield,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.07 } }),
};

// ── Agent data — verified from server/agents/ codebase ────────────────────────

const CSUITE = [
  { name: "Director", desc: "Routes every task and decision across all 23 agents" },
  { name: "CRM", desc: "Client health scoring, pipeline tracking, GHL integration" },
  { name: "Finance", desc: "P&L monitoring, MRR tracking, invoice and payment triggers" },
  { name: "Marketing", desc: "Content strategy oversight, newsletter pipeline, growth ops" },
  { name: "Operations", desc: "GHL delivery tracking, client onboarding, SLA monitoring" },
  { name: "Analytics", desc: "Daily KPI digest, anomaly detection, performance reporting" },
  { name: "HR", desc: "Team capacity signals, hiring intelligence" },
  { name: "Legal", desc: "Contract monitoring, compliance alerts" },
];

const SPECIALISTS = [
  { name: "Transcript Miner", desc: "Mines call recordings for hooks and proof points scored 1–10" },
  { name: "Sales Call Coach", desc: "Scores calls on a 100-point rubric, writes scripted improvements" },
  { name: "Newsletter Writer", desc: "7-part framework, two A/B subject line variants per issue" },
  { name: "Scroll Stopper Ad Builder", desc: "Builds ad creative directly from top-scoring call hooks" },
  { name: "Content Calendar", desc: "Plans the full week's content from the highest-scoring hook" },
  { name: "Social Media Manager", desc: "Drafts and publishes to LinkedIn, Instagram, Facebook, Twitter" },
  { name: "Meta Ads Manager", desc: "Monitors campaigns, applies pause/scale rules, logs every decision" },
  { name: "Google Ads Manager", desc: "Bid strategy monitoring and quality score management" },
  { name: "Ad Performance Monitor", desc: "Blended CPL across platforms, weekly winners/losers report" },
  { name: "GEO/SEO Auditor", desc: "Local search visibility audit — Google, GBP, and AI search" },
  { name: "Meeting Transcript Agent", desc: "Extracts action items, decisions, and follow-ups from any meeting" },
  { name: "Bookkeeping Categorizer", desc: "Categorizes transactions, prepares monthly P&L summary" },
  { name: "Cost Breakdown Analyst", desc: "Tracks weekly AI spend across all agents, flags overspend" },
  { name: "Workspace Architect", desc: "Audits and optimizes the AIOS skill and SOP file structure" },
  { name: "AIOS Sales Agent", desc: "Qualifies prospects, recommends tiers, drafts proposals" },
];

// ── Cron schedule — verified from server/scheduler/index.ts ──────────────────

const SCHEDULE = [
  { time: "Daily · 7:00 AM", task: "Analytics KPI digest — MRR, pipeline, delivery, and system health to Slack" },
  { time: "Daily · 9:00 AM", task: "Transcript Miner — scans for new call recordings, mines for hooks scored 7+" },
  { time: "Monday · 7:00 AM", task: "Weekly AI cost report — all 23 agents, top drivers, overspend alerts" },
  { time: "Monday · 8:00 AM", task: "Weekly business report via Director — KPIs, pipeline, ops, decisions" },
  { time: "Monday · 8:30 AM", task: "Content Calendar — full week planned from the top-scoring hook" },
  { time: "Tuesday · 9:00 AM", task: "Social posts drafted for LinkedIn, Instagram, and Facebook" },
  { time: "Tuesday · 10:00 AM", task: "Newsletter draft — 7-part framework with two A/B subject lines" },
  { time: "Thursday · 8:00 AM", task: "Approved content publishes to all connected platforms" },
  { time: "Friday · 4:00 PM", task: "Ad performance review — blended CPL, recommended actions for next week" },
  { time: "1st of Month", task: "Bookkeeping reminder + monthly P&L triggered via Finance agent" },
  { time: "1st Monday", task: "Monthly finance report — revenue, expenses, MRR vs prior month" },
];

// ── Pricing tiers ─────────────────────────────────────────────────────────────

const PRICING = [
  {
    name: "Starter",
    price: "$1,497",
    setup: "$3,500",
    highlight: false,
    includes: [
      "Director + CRM + Analytics agents",
      "Meeting Transcript Agent",
      "GEO/SEO Auditor",
      "Bookkeeping Categorizer",
      "9 Notion databases configured",
      "Core Zapier automations (SAL, DEL, DAT series)",
    ],
    best: "Owners who want operational visibility and lead automation without the full content machine.",
  },
  {
    name: "Growth",
    price: "$2,997",
    setup: "$5,000",
    highlight: true,
    includes: [
      "Everything in Starter",
      "Marketing + Content Calendar agents",
      "Social Media Manager",
      "Meta Ads + Transcript Miner",
      "Newsletter Writer + Ad Builder",
      "Full MKT + ADS Zapier series",
    ],
    best: "Businesses generating leads and content who want it all automated end-to-end.",
  },
  {
    name: "Full Stack",
    price: "$4,997",
    setup: "$7,500",
    highlight: false,
    includes: [
      "All 23 agents configured",
      "Complete 24-Zap automation stack",
      "All 10 GHL workflows built",
      "Social + ads platforms connected",
      "Full Zapier + GHL integration",
      "Voice training on every agent",
    ],
    best: "Agency owners and high-volume service businesses who want total operational autonomy.",
  },
  {
    name: "Build-Out Only",
    price: "$12,500",
    setup: "One-time",
    highlight: false,
    includes: [
      "Full AIOS built to your business",
      "All 23 agents + 24 Zaps configured",
      "Complete handover documentation",
      "You own and run it independently",
    ],
    best: "Operators who want full ownership without a monthly retainer.",
  },
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
    desc: "Local service businesses spending money on agencies with no reporting. AIOS replaces the agency and gives full visibility.",
  },
];

const BUILD_STEPS = [
  {
    n: "01",
    title: "Operational Audit",
    desc: "You answer a 5-step quiz about how your business runs today — sales, marketing, operations, and what's currently manual vs. automated.",
  },
  {
    n: "02",
    title: "Detailed Intake Form",
    desc: "We auto-send a comprehensive intake form scoped to your answers. You document your exact workflows, tools, client flow, and KPIs.",
  },
  {
    n: "03",
    title: "Build & Configure",
    desc: "We wire all 23 agents, 9 Notion databases, 24 Zapier automations, and your GHL workflows to your specific business — not a template.",
  },
  {
    n: "04",
    title: "Test & Launch",
    desc: "Every agent, every Zap, every GHL workflow tested end-to-end before handoff. You get documentation for everything that runs automatically.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

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
              {["how-it-works", "agents", "pricing", "audit"].map((id) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="text-muted-foreground hover:text-primary transition-colors capitalize"
                >
                  {id === "how-it-works" ? "How It Works" : id === "audit" ? "Get Blueprint" : id.charAt(0).toUpperCase() + id.slice(1)}
                </button>
              ))}
              <Button onClick={() => scrollTo("audit")} className="glow-cyan-hover">
                Get Your Blueprint <ArrowRight className="ml-2 w-4 h-4" />
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
              {["how-it-works", "agents", "pricing", "audit"].map((id) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="text-left py-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {id === "how-it-works" ? "How It Works" : id === "audit" ? "Get Blueprint" : id.charAt(0).toUpperCase() + id.slice(1)}
                </button>
              ))}
              <Button onClick={() => scrollTo("audit")} className="w-full glow-cyan-hover">
                Get Your Blueprint <ArrowRight className="ml-2 w-4 h-4" />
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
                23 AI Agents · 24 Zapier Automations · Running Our Business 24/7
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
              className="text-xl md:text-2xl text-muted-foreground mb-6 max-w-3xl"
            >
              The Myers Digital AI Operating System handles content, ads, CRM, finance, analytics, and operations — continuously — while you focus on closing and delivering.
            </motion.p>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="text-base text-muted-foreground mb-10 max-w-2xl leading-relaxed"
            >
              This isn't a concept. This is Myers Digital Consulting's production AIOS. Every agent on this page is active in our system. Every automation is wired. This site is its own proof of concept — and we build the same system for your business.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Button size="lg" onClick={() => scrollTo("audit")} className="text-lg px-8 py-6 glow-cyan glow-cyan-hover">
                Get Your Free AIOS Blueprint <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollTo("how-it-works")}
                className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10"
              >
                See How It's Built
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
                { val: "23", label: "AI Agents" },
                { val: "24", label: "Zapier Automations" },
                { val: "17", label: "Webhook Endpoints" },
                { val: "11", label: "Scheduled Jobs" },
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

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-card/30">
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
              Three Layers.{" "}
              <span className="text-primary">One Coherent System.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Claude makes decisions. Notion remembers everything. Zapier and GHL execute.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-10">
            {[
              {
                icon: Brain,
                layer: "The Brain",
                tool: "Claude AI",
                desc: "Makes decisions, writes content, scores leads, analyzes data, and routes every task to the right specialist agent — automatically.",
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                icon: FileText,
                layer: "The Memory",
                tool: "Notion",
                desc: "9 live databases storing every decision, KPI snapshot, client record, SOP, and automation log. Everything the agents need — always accessible.",
                color: "text-accent",
                bg: "bg-accent/10",
              },
              {
                icon: Zap,
                layer: "The Hands",
                tool: "Zapier + GHL",
                desc: "24 automations across every business function — plus 10 GHL workflows that handle lead response, onboarding, and client delivery without human input.",
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
            <span>Every output is logged to Notion.</span>
            <ArrowRight className="w-4 h-4 text-primary" />
            <span>Every decision is traceable.</span>
          </div>
        </div>
      </section>

      {/* ── AGENTS ── */}
      <section id="agents" className="py-24">
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
              23 Specialists.{" "}
              <span className="text-primary">Running 24/7.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              8 executive modules and 15 specialist agents — each with its own skill file, tool suite, and Notion memory layer.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <h3 className="text-sm font-bold mb-4 text-accent uppercase tracking-wider">Executive Modules (8)</h3>
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
              <h3 className="text-sm font-bold mb-4 text-accent uppercase tracking-wider">Specialist Agents (15)</h3>
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
              What Runs{" "}
              <span className="text-primary">While You Sleep</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              11 scheduled jobs running in our production system — plus 17 webhook endpoints that fire in real-time.
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
                custom={i * 0.4}
                className="grid grid-cols-[200px_1fr] gap-4 p-4 rounded-lg bg-card border border-border items-start"
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
              17 webhook endpoints fire in real-time for lead routing, CRM updates, ad alerts, and Slack notifications — no cron delay, no missed triggers.
            </span>
          </motion.div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
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
              Built for Service Businesses That{" "}
              <span className="text-primary">Run on People Power Today</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              If you're doing everything manually — follow-up, content, ads, reporting — AIOS replaces that labor with a system that doesn't call out sick.
            </p>
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

      {/* ── HOW WE BUILD YOURS ── */}
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
              The Build Process
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              We Don't Use Templates.{" "}
              <span className="text-primary">We Build to Your Business.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every AIOS is configured to mirror how you actually operate — your voice, your workflows, your tools, your KPIs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {BUILD_STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
              >
                <Card className="h-full bg-card border-border">
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-primary/30 font-mono mb-3">{s.n}</div>
                    <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
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
            <Button size="lg" onClick={() => scrollTo("audit")} className="text-lg px-10 py-6 glow-cyan glow-cyan-hover">
              Start Your Operational Audit <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
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
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Three Tiers. <span className="text-primary">One Decision.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every tier includes a full AIOS build specific to your business — not a template, not an off-the-shelf tool. The tier determines which agents and automations are activated.
            </p>
          </motion.div>

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
                      {tier.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
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
            <Button size="lg" onClick={() => scrollTo("audit")} className="text-lg px-10 py-6 glow-cyan glow-cyan-hover">
              Find the Right Tier for Your Business <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── WHITE LABEL ── */}
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

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            {[
              {
                icon: Brain,
                title: "We Build It",
                desc: "Full AIOS deployment for your client — all agents, Zapier stack, Notion workspace, GHL workflows, voice training.",
              },
              {
                icon: Shield,
                title: "Your Brand On It",
                desc: "Every output, every report, every email carries your agency's name. The client sees only you.",
              },
              {
                icon: TrendingUp,
                title: "You Keep the Margin",
                desc: "We charge you wholesale. You charge your client retail. Recurring monthly margin per client.",
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
                  "Full AIOS built to their business and voice",
                  "White-labeled under your brand",
                  "9 Notion databases configured",
                  "Zapier stack scoped to their tier",
                  "GHL workflows built for their workflows",
                  "Handoff documentation included",
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
                  "You handle client relationship and tier-1 support",
                  "Myers Digital handles build and tier-2 escalations",
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
                Partner inquiries are reviewed individually. Apply through the operational audit below.
              </p>
              <Button
                onClick={() => scrollTo("audit")}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Apply for Partner Program <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── OPERATIONAL AUDIT / QUIZ ── */}
      <section id="audit" className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-4">
                Start Here
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Tell Us How Your Business Runs Today.{" "}
                <span className="text-primary">We'll Show You What Runs Itself Tomorrow.</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                The 5-step operational audit takes about 3 minutes. Based on your answers, we'll send you a personalized intake form scoped to your business — and show you exactly which agents and automations you need before we build anything.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { n: "1", text: "Answer 5 steps about how your business operates today" },
                  { n: "2", text: "Receive your personalized detailed intake form automatically" },
                  { n: "3", text: "We map your full AIOS architecture before a single line is written" },
                ].map((item) => (
                  <div key={item.n} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0 text-primary text-xs font-bold">
                      {item.n}
                    </div>
                    <span className="text-sm text-muted-foreground pt-1">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
                <p className="text-sm text-accent font-semibold">
                  No pitch decks. No vague promises. Just a clear map of what your AIOS looks like — before you spend anything.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={1}>
              <Card className="bg-card border-border">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-2">Your Operational Audit</h3>
                  <p className="text-sm text-muted-foreground mb-6">~3 minutes · 5 steps · No commitment required</p>
                  <AiosQuiz />
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
              {["how-it-works", "agents", "pricing", "audit"].map((id) => (
                <button key={id} onClick={() => scrollTo(id)} className="hover:text-primary transition-colors">
                  {id === "how-it-works" ? "How It Works" : id === "audit" ? "Get Blueprint" : id.charAt(0).toUpperCase() + id.slice(1)}
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
