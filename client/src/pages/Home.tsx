import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Bot, 
  Zap, 
  Target, 
  TrendingUp, 
  Clock, 
  Shield,
  CheckCircle,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

// Image URLs
const HERO_IMAGE = "https://private-us-east-1.manuscdn.com/sessionFile/gqGk4kxlyKhGCgknFVhN2w/sandbox/nlEKyOnc0qDX2Hb2Ie5WTz-img-1_1770186250000_na1fn_aGVyby1uZXVyYWwtbmV0d29yaw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZ3FHazRreGx5S2hHQ2drbkZWaE4ydy9zYW5kYm94L25sRUt5T25jMHFEWDJIYjJJZTVXVHotaW1nLTFfMTc3MDE4NjI1MDAwMF9uYTFmbl9hR1Z5YnkxdVpYVnlZV3d0Ym1WMGQyOXlhdy5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=X67xpphHe4tHodirfhuUH1WPX~XUPG4ST6MjhmoOIpAwOqZQuiOS8zf1ZcV27P7qUkToox7T3nRMtMIctogLHy6GQkTVdN-5mrOp2eOqNx3-M5~Deassby2QXivEpB1mm-VrMHUejMS-k4MkIE59BKW1NYVRjJeC7lOTahOLin78aQ9Ha7w9J8OunTv78iCsDwafFn69FKHtnMeNVS5rV6dkICOrYQw6EwTO4e47cGSfFt71DCqqWtXtcJaSpfjTulNkxtKofZWXSxqSBgfe3ihQ7nK3wg7uuVGTTgYojk0PcTkqJ0OC77w3KyMQndjn8dK~jzUjaW9EJ0N1n-Bnmg__";

const AI_AUTOMATION_IMAGE = "https://private-us-east-1.manuscdn.com/sessionFile/gqGk4kxlyKhGCgknFVhN2w/sandbox/nlEKyOnc0qDX2Hb2Ie5WTz-img-2_1770186242000_na1fn_YWktYXV0b21hdGlvbi1hYnN0cmFjdA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZ3FHazRreGx5S2hHQ2drbkZWaE4ydy9zYW5kYm94L25sRUt5T25jMHFEWDJIYjJJZTVXVHotaW1nLTJfMTc3MDE4NjI0MjAwMF9uYTFmbl9ZV2t0WVhWMGIyMWhkR2x2YmkxaFluTjBjbUZqZEEucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=BjnDhe4zYy4Wsdm2540ASkOsc5acrZ4HV5s4RnhfnUUObx~8MvY1gcjnvl0tYL0gb-lIQ~dvl8u-GnGRpx33saY8ZSKji~-QQHdNJIccoY43ZTcuhVOuUDRMK5PemcBEqPt6gyvE9ShmQBDn1W01VQupEefv2JcqcTXAG2IUz0l1O7PJOe4PR6MpUjZK5kCdArs4bJDM2JEBxqjz5gM4DfncPgP7f2V~kpyBR3jSzku8kj3THV0Nn1Z8fCn8ZjjJGVR875ihkZusXLir5YOA-tdgQlQsZ4CuYfgGDmUrmI9Tg8XtCRJ~EQqS-JEsmXW2UNWmSdVrPdPLo-je~OjjdQ__";

const DIGITAL_WORKFORCE_IMAGE = "https://private-us-east-1.manuscdn.com/sessionFile/gqGk4kxlyKhGCgknFVhN2w/sandbox/nlEKyOnc0qDX2Hb2Ie5WTz-img-3_1770186263000_na1fn_ZGlnaXRhbC13b3JrZm9yY2UtY29uY2VwdA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZ3FHazRreGx5S2hHQ2drbkZWaE4ydy9zYW5kYm94L25sRUt5T25jMHFEWDJIYjJJZTVXVHotaW1nLTNfMTc3MDE4NjI2MzAwMF9uYTFmbl9aR2xuYVhSaGJDMTNiM0pyWm05eVkyVXRZMjl1WTJWd2RBLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=mQbfGOEsPYnvpfrdApwfzTVHZOeSULkYEgVQYiIYgNMerqER1DesKYSI6ZtVRdslchQewpmTg4BSGwDG-e6AOHCbwNT6wEnUGChu4i~dPffr28jOTtineRXt5t3NPaopv7uIKfzneXHSGf0yVeEoOSylTdnzUyGy54U8NtD6ZwfbyINUyOSTG1ftysmsVrPmXE0GMElsbKjtbMnAFrH7kcjVwiK6tLB8R5UFR4khIQys8E0nQ0uk1cXQU7V3feglaEBNC4pKLTMYczO75Mm-oEwRG-szbei5DTyE9ubckmVdsGr2vSBQVvhyf4LuF-oaqN4N-S5Q9eV3CPc5xJgDfA__";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  });

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission would integrate with GHL here
    alert("Thank you for your interest! We'll be in touch within 24 hours.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-cyan">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Myers Digital <span className="text-primary">Consulting</span>
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection("services")} className="text-muted-foreground hover:text-primary transition-colors">
                Services
              </button>
              <button onClick={() => scrollToSection("about")} className="text-muted-foreground hover:text-primary transition-colors">
                About
              </button>
              <button onClick={() => scrollToSection("process")} className="text-muted-foreground hover:text-primary transition-colors">
                Process
              </button>
              <Button onClick={() => scrollToSection("contact")} className="glow-cyan-hover">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden pt-4 pb-2 flex flex-col gap-4"
            >
              <button onClick={() => scrollToSection("services")} className="text-left py-2 text-muted-foreground hover:text-primary transition-colors">
                Services
              </button>
              <button onClick={() => scrollToSection("about")} className="text-left py-2 text-muted-foreground hover:text-primary transition-colors">
                About
              </button>
              <button onClick={() => scrollToSection("process")} className="text-left py-2 text-muted-foreground hover:text-primary transition-colors">
                Process
              </button>
              <Button onClick={() => scrollToSection("contact")} className="w-full glow-cyan-hover">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src={HERO_IMAGE} 
            alt="Neural Network Visualization" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6">
                ROI-First AI Systems
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            >
              Stop Trading Hours for Dollars.{" "}
              <span className="gradient-text">Build Your Digital Workforce.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl"
            >
              We design and deploy intelligent AI agents that automate your sales, marketing, and operations—so you can focus on what matters most: growing your business.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button 
                size="lg" 
                onClick={() => scrollToSection("contact")}
                className="text-lg px-8 py-6 glow-cyan glow-cyan-hover"
              >
                Get Your Free AI Audit <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => scrollToSection("services")}
                className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10"
              >
                See How It Works
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
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

      {/* Value Proposition */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Your Competition is Still Clicking.{" "}
                <span className="text-primary">You're Closing Deals.</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                While your competitors are buried in manual tasks, your business will be running on autopilot. Myers Digital Consulting provides bespoke AI solutions that handle the repetitive, time-consuming work that's holding you back.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Clock, text: "Save 40+ hours per week" },
                  { icon: TrendingUp, text: "Increase revenue by 3x" },
                  { icon: Target, text: "Never miss a lead again" },
                  { icon: Shield, text: "Enterprise-grade security" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                    <item.icon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden border border-border glow-cyan">
                <img 
                  src={AI_AUTOMATION_IMAGE} 
                  alt="AI Automation Visualization" 
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-4">
              Our Services
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Your <span className="text-primary">Unfair Advantage</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We build AI systems that integrate seamlessly with your existing tools and workflows.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Bot,
                title: "AI-Powered Lead Generation",
                description: "Custom AI agents that integrate with your website, social media, and ad campaigns to capture, qualify, and nurture leads in real-time."
              },
              {
                icon: Zap,
                title: "Automated Sales & Marketing",
                description: "From personalized email sequences to intelligent social media engagement, our AI automates your marketing efforts with precision."
              },
              {
                icon: Target,
                title: "Intelligent Operations",
                description: "Free up your team from customer support and admin tasks. Our AI agents handle inquiries, schedule appointments, and manage workflows."
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-card border-border card-hover">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 glow-cyan">
                      <service.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                    <p className="text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Future of Work Section */}
      <section id="about" className="py-24 relative">
        <div className="absolute inset-0 z-0">
          <img 
            src={DIGITAL_WORKFORCE_IMAGE} 
            alt="Digital Workforce" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent text-sm font-medium mb-4">
                The Future is Now
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                This Isn't The Future.{" "}
                <span className="text-accent">This is Your New Reality.</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                The world is changing. Businesses that embrace AI will thrive. Those that don't will be left behind. We're not just building websites; we're building the future of your business.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Our AI agents are more than just code; they're your partners in growth—learning and adapting to your needs, providing insights you never thought possible, and delivering measurable ROI from day one.
              </p>
              
              <div className="flex flex-wrap gap-4">
                {["ROI-First Approach", "Deep Integration", "24/7 Operation", "Continuous Optimization"].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-4">
              Our Process
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              How We <span className="text-primary">Transform</span> Your Business
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Discovery", description: "We analyze your operations to identify high-ROI automation opportunities." },
              { step: "02", title: "Design", description: "Custom AI agents are designed around your specific workflows and goals." },
              { step: "03", title: "Deploy", description: "Seamless integration with your existing tools—CRM, ERP, and more." },
              { step: "04", title: "Optimize", description: "Continuous monitoring and refinement to maximize your returns." }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 right-0 w-1/2 h-px bg-gradient-to-r from-primary/30 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "40+", label: "Hours Saved Weekly" },
              { value: "3x", label: "Revenue Increase" },
              { value: "99%", label: "Uptime Guarantee" },
              { value: "24/7", label: "AI Agent Operation" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2 font-mono">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / CTA Section */}
      <section id="contact" className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-4">
                Get Started
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to Build Your{" "}
                <span className="text-primary">Digital Workforce?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Let's find out how AI can revolutionize your business. Schedule your free, no-obligation AI audit today and discover the ROI waiting for you.
              </p>
              
              <div className="space-y-4">
                {[
                  "Free ROI analysis of your current operations",
                  "Custom AI agent recommendations",
                  "Integration roadmap with your existing tools",
                  "No commitment required"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6">Schedule Your Free AI Audit</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Input
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-background border-border"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-background border-border"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Company Name"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <Textarea
                        placeholder="Tell us about your biggest operational challenge..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="bg-background border-border min-h-[120px]"
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full glow-cyan glow-cyan-hover">
                      Get My Free AI Audit <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
              <button onClick={() => scrollToSection("services")} className="hover:text-primary transition-colors">
                Services
              </button>
              <button onClick={() => scrollToSection("about")} className="hover:text-primary transition-colors">
                About
              </button>
              <button onClick={() => scrollToSection("process")} className="hover:text-primary transition-colors">
                Process
              </button>
              <button onClick={() => scrollToSection("contact")} className="hover:text-primary transition-colors">
                Contact
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2026 Myers Digital Consulting. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
