"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, BarChart3, Target, Briefcase, TrendingUp, Award, Upload,
  ArrowUpRight, Clock, Sparkles, ChevronRight
} from "lucide-react";
import Link from "next/link";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

interface AnalysisData {
  ats?: { score: number; grade: string };
  roles?: Array<{ role: string; confidence: number; emoji: string; color: string }>;
  jobs?: Array<{ title: string; company: string; match_score: number; logo: string }>;
  skills?: string[];
  profile?: { name: string };
}

export default function DashboardPage() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const analysisData = localStorage.getItem("analysis");
    if (userData) setUser(JSON.parse(userData));
    if (analysisData) setData(JSON.parse(analysisData));
  }, []);

  const stats = [
    { label: "ATS Score", value: data?.ats?.score ?? "—", suffix: "/100", icon: BarChart3, color: "bg-[#005c55]" },
    { label: "Roles Detected", value: data?.roles?.length ?? 0, suffix: "", icon: Target, color: "bg-[#565e74]" },
    { label: "Job Matches", value: data?.jobs?.length ?? 0, suffix: "", icon: Briefcase, color: "bg-[#0f766e]" },
    { label: "Skills Found", value: data?.skills?.length ?? 0, suffix: "", icon: Award, color: "bg-[#7f4025]" },
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      {/* Welcome */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">
            Welcome back, {user?.full_name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-[#3e4947] text-sm mt-1">Here&apos;s your career dashboard overview</p>
        </div>
        <Link href="/dashboard/upload"
          className="flex items-center gap-2 bg-[#005c55] hover:bg-[#0f766e] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition group shadow-sm">
          <Upload className="w-4 h-4" />
          Upload Resume
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-5 rounded-2xl bg-white border border-[#bdc9c6] card-hover transition group card-elevated">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center shadow-sm`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#bdc9c6] group-hover:text-[#6e7977] transition" />
            </div>
            <div className="text-3xl font-bold text-[#0f172a]">
              {stat.value}<span className="text-lg text-[#6e7977] font-normal">{stat.suffix}</span>
            </div>
            <div className="text-xs text-[#6e7977] mt-1">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions & Recent */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Upload CTA */}
        {!data && (
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <div className="gradient-border p-8 rounded-2xl text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#005c55]/8 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-[#005c55]" />
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-2">Start Your Career Analysis</h3>
              <p className="text-[#3e4947] text-sm mb-6 max-w-md mx-auto">
                Upload your resume to get an AI-powered ATS score, role detection, and personalized job recommendations.
              </p>
              <Link href="/dashboard/upload"
                className="inline-flex items-center gap-2 bg-[#005c55] hover:bg-[#0f766e] text-white px-6 py-3 rounded-lg font-medium transition shadow-sm">
                <Upload className="w-4 h-4" /> Upload Your Resume
              </Link>
            </div>
          </motion.div>
        )}

        {/* ATS Summary */}
        {data?.ats && (
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <div className="p-6 rounded-2xl bg-white border border-[#bdc9c6] card-elevated">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#0f172a]">ATS Score Summary</h3>
                <Link href="/dashboard/ats-score" className="text-xs text-[#005c55] hover:text-[#0f766e] font-medium flex items-center gap-1">
                  View Details <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="flex items-center gap-8">
                {/* Score ring */}
                <div className="relative w-32 h-32 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 150 150">
                    <circle cx="75" cy="75" r="65" fill="none" stroke="#ebefed" strokeWidth="10" />
                    <circle cx="75" cy="75" r="65" fill="none"
                      stroke={data.ats.score >= 80 ? "#0f766e" : data.ats.score >= 60 ? "#005c55" : data.ats.score >= 40 ? "#7f4025" : "#ba1a1a"}
                      strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${(data.ats.score / 100) * 408} 408`}
                      style={{ animation: "score-fill 1.5s ease-out" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-[#0f172a]">{data.ats.score}</span>
                    <span className="text-xs text-[#6e7977]">out of 100</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="text-sm font-medium text-[#0f172a]">{data.ats.grade}</div>
                  {data.ats.score >= 80 && <p className="text-xs text-[#3e4947]">Your resume is highly optimized for ATS systems!</p>}
                  {data.ats.score < 80 && data.ats.score >= 60 && <p className="text-xs text-[#3e4947]">Good start! A few improvements will push you into the excellent range.</p>}
                  {data.ats.score < 60 && <p className="text-xs text-[#3e4947]">Your resume needs some optimization. Check the detailed breakdown.</p>}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Links */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <div className="p-6 rounded-2xl bg-white border border-[#bdc9c6] h-full card-elevated">
            <h3 className="text-lg font-semibold text-[#0f172a] mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { href: "/dashboard/upload", icon: Upload, label: "Upload New Resume", color: "text-[#005c55]" },
                { href: "/dashboard/jobs", icon: Briefcase, label: "Browse Jobs", color: "text-[#0f766e]" },
                { href: "/dashboard/applications", icon: FileText, label: "Track Applications", color: "text-[#565e74]" },
                { href: "/dashboard/roles", icon: Target, label: "View Detected Roles", color: "text-[#7f4025]" },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#f1f4f3] transition group">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-sm text-[#3e4947] group-hover:text-[#181c1c] transition">{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#bdc9c6] ml-auto group-hover:text-[#6e7977]" />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Roles & Jobs */}
      {data && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Roles */}
          {data.roles && data.roles.length > 0 && (
            <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-white border border-[#bdc9c6] card-elevated">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#0f172a]">Top Matching Roles</h3>
                <Link href="/dashboard/roles" className="text-xs text-[#005c55] hover:text-[#0f766e] font-medium flex items-center gap-1">
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {data.roles.slice(0, 4).map((role, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#f1f4f3]">
                    <span className="text-xl">{role.emoji}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[#0f172a]">{role.role}</div>
                      <div className="w-full h-1.5 bg-[#e5e9e7] rounded-full mt-1.5">
                        <div className="h-full rounded-full transition-all" style={{ width: `${role.confidence}%`, background: role.color }} />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#0f172a]">{role.confidence}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Top Jobs */}
          {data.jobs && data.jobs.length > 0 && (
            <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-white border border-[#bdc9c6] card-elevated">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#0f172a]">Top Job Matches</h3>
                <Link href="/dashboard/jobs" className="text-xs text-[#005c55] hover:text-[#0f766e] font-medium flex items-center gap-1">
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {data.jobs.slice(0, 4).map((job: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#f1f4f3]">
                    <div className="w-10 h-10 rounded-lg bg-[#e5e9e7] flex items-center justify-center overflow-hidden shrink-0">
                      <img src={job.logo} alt="" className="w-6 h-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#0f172a] truncate">{job.title}</div>
                      <div className="text-xs text-[#6e7977]">{job.company}</div>
                    </div>
                    <span className="text-sm font-bold text-[#005c55]">{job.match_score}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
