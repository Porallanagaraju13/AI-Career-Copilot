"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText, Target, Briefcase, BarChart3, Zap, Shield, ArrowRight,
  CheckCircle2, Star, ChevronDown, Upload, Sparkles, TrendingUp, Users
} from "lucide-react";
import { useState } from "react";

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0f766e] flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-[#0f172a]">Career Copilot</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-[#3e4947] hover:text-[#181c1c] transition font-medium">Features</a>
          <a href="#pricing" className="text-sm text-[#3e4947] hover:text-[#181c1c] transition font-medium">Pricing</a>
          <a href="#faq" className="text-sm text-[#3e4947] hover:text-[#181c1c] transition font-medium">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[#3e4947] hover:text-[#181c1c] transition font-medium px-4 py-2">Log in</Link>
          <Link href="/signup" className="text-sm bg-[#005c55] hover:bg-[#0f766e] text-white px-5 py-2 rounded-lg font-medium transition shadow-sm">
            Get Started Free
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#005c55]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#dae2fd]/40 rounded-full blur-[100px]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div className="relative max-w-5xl mx-auto px-8 text-center" initial="hidden" animate="show" variants={stagger}>
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#005c55]/8 border border-[#005c55]/15 text-[#005c55] text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" /> AI-Powered Career Platform
        </motion.div>

        <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black tracking-tight text-[#0f172a] leading-[1.1] mb-6" style={{ letterSpacing: '-0.02em' }}>
          Land Your Dream Job
          <br />
          <span className="gradient-text">10x Faster</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="text-lg md:text-xl text-[#3e4947] max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload your resume, get an instant ATS score, discover matching roles,
          and find the perfect job — all powered by AI agents.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup" className="group flex items-center gap-2 bg-[#005c55] hover:bg-[#0f766e] text-white px-8 py-3.5 rounded-lg font-semibold text-lg transition-all shadow-md">
            Start Free Analysis
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#features" className="flex items-center gap-2 text-[#0f172a] hover:bg-[#ebefed] px-8 py-3.5 rounded-lg border border-[#bdc9c6] transition-all font-semibold bg-white shadow-sm">
            See How It Works
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 p-6 rounded-2xl bg-white border border-[#bdc9c6] shadow-sm card-elevated">
          {[
            { value: "50K+", label: "Resumes Analyzed" },
            { value: "95%", label: "Accuracy Rate" },
            { value: "12K+", label: "Jobs Matched" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-[#0f172a]">{stat.value}</div>
              <div className="text-xs font-medium text-[#6e7977] mt-1 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

const features = [
  { icon: Upload, title: "Smart Resume Parser", desc: "Upload PDF or DOCX. Our AI extracts skills, experience, education, and projects instantly.", color: "bg-[#005c55]" },
  { icon: BarChart3, title: "ATS Score Engine", desc: "Get a detailed 0-100 score with breakdown by keywords, format, sections, and readability.", color: "bg-[#0f766e]" },
  { icon: Target, title: "Role Detection AI", desc: "Automatically detect the best-fit job roles based on your skills and experience.", color: "bg-[#565e74]" },
  { icon: Briefcase, title: "Job Matching", desc: "Find live vacancies ranked by compatibility with filters for location, salary, and remote.", color: "bg-[#7f4025]" },
  { icon: TrendingUp, title: "Application Tracker", desc: "Kanban-style board to track applications from Saved to Offer with status updates.", color: "bg-[#005c55]" },
  { icon: Zap, title: "Interview Prep", desc: "AI mock interviews with personalized questions and instant feedback for any role.", color: "bg-[#565e74]" },
];

function Features() {
  return (
    <section id="features" className="py-24 relative bg-[#f1f4f3]">
      <div className="max-w-6xl mx-auto px-8">
        <motion.div className="text-center mb-16" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.p variants={fadeUp} className="text-[#005c55] font-bold text-sm uppercase tracking-wider mb-3">Features</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-[#0f172a] mb-4">Everything You Need to<br /><span className="gradient-text">Get Hired</span></motion.h2>
          <motion.p variants={fadeUp} className="text-[#3e4947] text-lg max-w-xl mx-auto">Seven AI agents work together to analyze your resume, find jobs, and prepare you for interviews.</motion.p>
        </motion.div>

        <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeUp}
              className="group p-6 rounded-2xl bg-white border border-[#bdc9c6] shadow-sm card-hover transition-all duration-300">
              <div className={`w-12 h-12 rounded-lg ${f.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-sm`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] mb-2">{f.title}</h3>
              <p className="text-[#3e4947] text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const plans = [
  { name: "Free", price: "$0", period: "forever", features: ["3 resume analyses/month", "Basic ATS score", "5 job matches", "Email support"], cta: "Get Started", popular: false },
  { name: "Pro", price: "$19", period: "/month", features: ["Unlimited analyses", "Full ATS breakdown", "Unlimited job matches", "AI resume rewrite", "Interview prep", "Priority support"], cta: "Start Pro Trial", popular: true },
  { name: "Enterprise", price: "$49", period: "/month", features: ["Everything in Pro", "Team dashboard", "API access", "Custom integrations", "Dedicated manager", "SLA guarantee"], cta: "Contact Sales", popular: false },
];

function Pricing() {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-5xl mx-auto px-8">
        <motion.div className="text-center mb-16" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.p variants={fadeUp} className="text-[#005c55] font-bold text-sm uppercase tracking-wider mb-3">Pricing</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-[#0f172a] mb-4">Simple, Transparent Pricing</motion.h2>
          <motion.p variants={fadeUp} className="text-[#3e4947] text-lg">Start free. Upgrade when you need more power.</motion.p>
        </motion.div>

        <motion.div className="grid md:grid-cols-3 gap-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          {plans.map((plan) => (
            <motion.div key={plan.name} variants={fadeUp}
              className={`relative p-8 rounded-2xl border transition-all ${plan.popular ? "border-[#005c55] bg-[#005c55]/[0.03] shadow-md" : "border-[#bdc9c6] bg-white shadow-sm"}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#005c55] text-white text-xs font-bold rounded-full shadow-sm">Most Popular</div>
              )}
              <h3 className="text-xl font-bold text-[#0f172a] mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-[#0f172a]">{plan.price}</span>
                <span className="text-[#6e7977] text-sm font-medium">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#3e4947] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#0f766e] shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup"
                className={`block text-center py-3 rounded-lg font-bold transition-all shadow-sm ${plan.popular ? "bg-[#005c55] hover:bg-[#0f766e] text-white" : "bg-white hover:bg-[#f1f4f3] text-[#0f172a] border border-[#bdc9c6]"}`}>
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const faqs = [
  { q: "How does the ATS scoring work?", a: "Our AI analyzes your resume across 6 dimensions: contact info, skills, experience, education, sections, and formatting. Each is scored and combined into a 0-100 ATS compatibility score." },
  { q: "What file formats are supported?", a: "We support PDF and DOCX files up to 10MB. For best results, use a text-based PDF rather than a scanned image." },
  { q: "How accurate is the role detection?", a: "Our AI matches against 16+ role profiles with keyword analysis. It typically achieves 90%+ accuracy for common tech roles." },
  { q: "Are the job listings real?", a: "Yes, we aggregate jobs from multiple sources. Pro users get access to live job feeds from major career portals." },
  { q: "Is my resume data secure?", a: "Absolutely. We use AES-256 encryption, never share your data with third parties, and you can delete your data at any time." },
  { q: "Can I cancel my subscription?", a: "Yes, cancel anytime with no questions asked. You'll retain access until the end of your billing period." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-24 relative bg-[#f1f4f3]">
      <div className="max-w-3xl mx-auto px-8">
        <motion.div className="text-center mb-16" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.p variants={fadeUp} className="text-[#005c55] font-bold text-sm uppercase tracking-wider mb-3">FAQ</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl font-bold text-[#0f172a] mb-4">Frequently Asked Questions</motion.h2>
        </motion.div>

        <motion.div className="space-y-3" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          {faqs.map((faq, i) => (
            <motion.div key={i} variants={fadeUp}
              className="border border-[#bdc9c6] rounded-xl overflow-hidden bg-white shadow-sm">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left text-[#0f172a] font-bold hover:bg-[#f1f4f3] transition-colors">
                {faq.q}
                <ChevronDown className={`w-5 h-5 text-[#6e7977] transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <div className="px-5 pb-5 text-[#3e4947] text-sm leading-relaxed font-medium">{faq.a}</div>}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#bdc9c6] py-12 bg-white">
      <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0f766e] flex items-center justify-center shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-[#0f172a]">Career Copilot</span>
        </div>
        <p className="text-[#6e7977] text-sm font-medium">© 2026 AI Career Copilot. All rights reserved.</p>
        <div className="flex gap-6 text-sm text-[#6e7977] font-medium">
          <a href="#" className="hover:text-[#181c1c] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[#181c1c] transition-colors">Terms</a>
          <a href="#" className="hover:text-[#181c1c] transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7faf8] text-[#181c1c] font-sans">
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}
