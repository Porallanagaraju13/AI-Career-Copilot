"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  BarChart3, AlertTriangle, CheckCircle2, XCircle, ArrowRight, Lightbulb,
  User, Code2, GraduationCap, FileText, Layout, Briefcase, Sparkles, Star, Clock
} from "lucide-react";
import Link from "next/link";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const sectionIcons: Record<string, any> = {
  "Contact Info": User, "Skills": Code2, "Experience": Briefcase,
  "Education": GraduationCap, "Sections": FileText, "Format": Layout,
};

export default function ATSScorePage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("analysis");
    if (!stored) { router.push("/dashboard/upload"); return; }
    setData(JSON.parse(stored));
  }, [router]);

  if (!data) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#0f766e] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { ats, profile, skills } = data;
  const scoreColor = ats.score >= 80 ? "#0f766e" : ats.score >= 60 ? "#005c55" : ats.score >= 40 ? "#7f4025" : "#ba1a1a";

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="space-y-6">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">ATS Score Analysis</h1>
          <p className="text-[#3e4947] text-sm mt-1">
            {profile?.name ? `Resume: ${profile.name}` : "Your resume analysis results"}
            {data.engine === "gemini-ai-agent" && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-[#005c55]/10 text-[#005c55] text-[10px] font-semibold rounded-full">
                <Sparkles className="w-3 h-3" /> AI-Powered
              </span>
            )}
            {data.analysis_time && (
              <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-[#6e7977]">
                <Clock className="w-3 h-3" /> {data.analysis_time}s
              </span>
            )}
          </p>
        </div>
        <Link href="/dashboard/roles" className="flex items-center gap-2 bg-[#005c55] hover:bg-[#0f766e] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm">
          View Roles <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      {/* Score Card */}
      <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-white border border-[#bdc9c6] card-elevated">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Ring */}
          <div className="relative w-44 h-44 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r="65" fill="none" stroke="#ebefed" strokeWidth="8" />
              <circle cx="75" cy="75" r="65" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(ats.score / 100) * 408} 408`}
                style={{ animation: "score-fill 1.5s ease-out" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-[#0f172a]">{ats.score}</span>
              <span className="text-sm font-medium mt-0.5" style={{ color: scoreColor }}>{ats.grade}</span>
            </div>
          </div>

          {/* Grade info */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#0f172a] mb-3">
              {ats.score >= 80 ? "🎉 Excellent Resume!" : ats.score >= 60 ? "👍 Good Resume" : ats.score >= 40 ? "⚠️ Average Resume" : "🔴 Needs Improvement"}
            </h3>
            <p className="text-[#3e4947] text-sm leading-relaxed">
              {ats.overall_assessment || (
                ats.score >= 80
                  ? "Your resume is highly optimized for Applicant Tracking Systems. It has strong keywords, clear structure, and comprehensive content."
                  : ats.score >= 60
                    ? "Your resume performs well but has room for improvement. Focus on the suggestions below to boost your score."
                    : "Your resume needs significant improvements to pass ATS filters. Review each section below for specific recommendations."
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Strengths — only from AI agent */}
      {ats.strengths && ats.strengths.length > 0 && (
        <motion.div variants={fadeUp} className="p-5 rounded-2xl bg-[#0f766e]/5 border border-[#0f766e]/20 card-elevated">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-[#0f766e]" />
            <h3 className="text-base font-semibold text-[#0f172a]">Resume Strengths</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {ats.strengths.map((s: string, i: number) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/60 border border-[#0f766e]/10">
                <CheckCircle2 className="w-4 h-4 text-[#0f766e] mt-0.5 shrink-0" />
                <span className="text-sm text-[#3e4947]">{s}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Breakdown */}
      <motion.div variants={fadeUp} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(ats.breakdown || {}).map(([key, val]: [string, any]) => {
          const Icon = sectionIcons[key] || FileText;
          const pct = val.max > 0 ? (val.score / val.max) * 100 : 0;
          const barColor = pct >= 80 ? "bg-[#0f766e]" : pct >= 60 ? "bg-[#005c55]" : pct >= 40 ? "bg-[#7f4025]" : "bg-[#ba1a1a]";

          return (
            <div key={key} className="p-5 rounded-xl bg-white border border-[#bdc9c6] card-hover transition card-elevated">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${pct >= 60 ? "bg-[#0f766e]/10" : "bg-[#7f4025]/10"}`}>
                  <Icon className={`w-4 h-4 ${pct >= 60 ? "text-[#0f766e]" : "text-[#7f4025]"}`} />
                </div>
                <div>
                  <div className="text-sm font-medium text-[#0f172a]">{key}</div>
                  <div className="text-xs text-[#6e7977]">{val.score}/{val.max} pts</div>
                </div>
              </div>
              <div className="w-full h-2 bg-[#ebefed] rounded-full mb-2">
                <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
              </div>
              {/* AI-generated details for each section */}
              {val.details && (
                <p className="text-[11px] text-[#6e7977] leading-relaxed mt-1">{val.details}</p>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Suggestions */}
      {ats.suggestions?.length > 0 && (
        <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-white border border-[#bdc9c6] card-elevated">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-[#7f4025]" />
            <h3 className="text-lg font-semibold text-[#0f172a]">Improvement Suggestions</h3>
          </div>
          <div className="space-y-3">
            {ats.suggestions.map((s: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#7f4025]/5 border border-[#7f4025]/10">
                <AlertTriangle className="w-4 h-4 text-[#7f4025] mt-0.5 shrink-0" />
                <span className="text-sm text-[#3e4947]">{s}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Missing Keywords */}
      {ats.missing_keywords?.length > 0 && (
        <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-white border border-[#bdc9c6] card-elevated">
          <h3 className="text-lg font-semibold text-[#0f172a] mb-4">Missing Keywords</h3>
          <p className="text-sm text-[#3e4947] mb-3">Consider adding these commonly expected keywords:</p>
          <div className="flex flex-wrap gap-2">
            {ats.missing_keywords.map((kw: string, i: number) => (
              <span key={i} className="px-3 py-1.5 bg-[#ffdad6] border border-[#ba1a1a]/15 text-[#93000a] text-xs font-medium rounded-lg">
                + {kw}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Skills found */}
      {skills?.length > 0 && (
        <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-white border border-[#bdc9c6] card-elevated">
          <h3 className="text-lg font-semibold text-[#0f172a] mb-4">Skills Detected ({skills.length})</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: string, i: number) => (
              <span key={i} className="px-3 py-1.5 bg-[#005c55]/8 border border-[#005c55]/15 text-[#005c55] text-xs font-medium rounded-lg">
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Summary — only from AI agent */}
      {data.summary && (
        <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-gradient-to-br from-[#005c55]/5 to-[#565e74]/5 border border-[#005c55]/20 card-elevated">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-[#005c55]" />
            <h3 className="text-base font-semibold text-[#0f172a]">AI Professional Summary</h3>
          </div>
          <p className="text-sm text-[#3e4947] leading-relaxed">{data.summary}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
