"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Target, ArrowRight, TrendingUp, Award, Sparkles, Lightbulb } from "lucide-react";
import Link from "next/link";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function RolesPage() {
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

  const roles = data.roles || [];
  const coaching = data.coaching || {};

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="space-y-6">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Detected Roles</h1>
          <p className="text-[#3e4947] text-sm mt-1">
            {roles.length} matching roles found for your profile
            {data.engine === "gemini-ai-agent" && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-[#005c55]/10 text-[#005c55] text-[10px] font-semibold rounded-full">
                <Sparkles className="w-3 h-3" /> AI-Powered
              </span>
            )}
          </p>
        </div>
        <Link href="/dashboard/jobs" className="flex items-center gap-2 bg-[#005c55] hover:bg-[#0f766e] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm">
          Browse Jobs <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      {roles.length === 0 ? (
        <motion.div variants={fadeUp} className="p-8 rounded-2xl bg-white border border-[#bdc9c6] text-center card-elevated">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#565e74]/10 flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-[#565e74]" />
          </div>
          <h3 className="text-xl font-bold text-[#0f172a] mb-2">No Roles Detected Yet</h3>
          <p className="text-[#3e4947] text-sm mb-4">Upload your resume to discover matching roles</p>
          <Link href="/dashboard/upload" className="inline-flex items-center gap-2 bg-[#005c55] hover:bg-[#0f766e] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm">
            Upload Resume
          </Link>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {roles.map((role: any, i: number) => (
            <motion.div key={i} variants={fadeUp}
              className="p-5 rounded-2xl bg-white border border-[#bdc9c6] card-hover transition group card-elevated">
              <div className="flex items-start gap-4">
                <div className="text-3xl">{role.emoji}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-[#0f172a] mb-1">{role.role}</h3>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-2 bg-[#ebefed] rounded-full">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${role.confidence}%`, background: role.color || "#0f766e" }} />
                    </div>
                    <span className="text-sm font-bold text-[#0f172a]">{role.confidence}%</span>
                  </div>

                  {/* Matched skills */}
                  {(role.matched_skills || role.matching_skills) && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(role.matched_skills || role.matching_skills).slice(0, 6).map((skill: string, si: number) => (
                        <span key={si} className="px-2 py-0.5 bg-[#005c55]/8 text-[#005c55] text-[11px] font-medium rounded-md border border-[#005c55]/15">
                          {skill}
                        </span>
                      ))}
                      {(role.matched_skills || role.matching_skills).length > 6 && (
                        <span className="px-2 py-0.5 bg-[#f1f4f3] text-[#6e7977] text-[11px] font-medium rounded-md">
                          +{(role.matched_skills || role.matching_skills).length - 6}
                        </span>
                      )}
                    </div>
                  )}

                  {/* AI-generated reason */}
                  {role.reason && (
                    <p className="text-xs text-[#3e4947] mb-2 leading-relaxed">
                      {role.reason}
                    </p>
                  )}

                  {/* Growth tip */}
                  {role.growth_tip && (
                    <div className="flex items-start gap-1.5 p-2 rounded-lg bg-[#005c55]/5 border border-[#005c55]/10">
                      <Lightbulb className="w-3 h-3 text-[#005c55] mt-0.5 shrink-0" />
                      <span className="text-[11px] text-[#005c55] leading-relaxed">{role.growth_tip}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-[#6e7977] mt-2">
                    <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {role.demand || "High"} Demand</span>
                    <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {role.level || "Mid-Senior"}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Career Coaching Section — only shows with AI agent results */}
      {coaching.career_roadmap && Object.keys(coaching.career_roadmap).length > 0 && (
        <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-gradient-to-br from-[#005c55]/5 to-[#0f766e]/5 border border-[#005c55]/20 card-elevated">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#005c55]" />
            <h3 className="text-lg font-semibold text-[#0f172a]">AI Career Roadmap</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div className="p-3 rounded-xl bg-white/80 border border-[#bdc9c6]">
              <div className="text-xs text-[#6e7977] mb-1">Current Level</div>
              <div className="text-sm font-semibold text-[#0f172a]">{coaching.career_roadmap.current_level}</div>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-[#bdc9c6]">
              <div className="text-xs text-[#6e7977] mb-1">Next Target</div>
              <div className="text-sm font-semibold text-[#005c55]">{coaching.career_roadmap.next_target}</div>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-[#bdc9c6]">
              <div className="text-xs text-[#6e7977] mb-1">Timeline</div>
              <div className="text-sm font-semibold text-[#0f172a]">{coaching.career_roadmap.timeline}</div>
            </div>
          </div>
          {coaching.career_roadmap.key_actions && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-[#3e4947] mb-2">Key Actions:</div>
              {coaching.career_roadmap.key_actions.map((action: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm text-[#3e4947]">
                  <span className="text-[#005c55] font-bold mt-0.5">→</span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Skill Gaps */}
      {coaching.skill_gaps && coaching.skill_gaps.length > 0 && (
        <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-white border border-[#bdc9c6] card-elevated">
          <h3 className="text-lg font-semibold text-[#0f172a] mb-4">📈 Skill Gaps to Fill</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {coaching.skill_gaps.map((gap: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-[#7f4025]/5 border border-[#7f4025]/15">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-[#0f172a]">{gap.skill}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${gap.importance === "high" ? "bg-[#ba1a1a]/10 text-[#ba1a1a]" : "bg-[#7f4025]/10 text-[#7f4025]"}`}>
                    {(gap.importance || "medium").toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-[#3e4947]">{gap.reason}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Interview Prep */}
      {coaching.interview_questions && coaching.interview_questions.length > 0 && (
        <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-white border border-[#bdc9c6] card-elevated">
          <h3 className="text-lg font-semibold text-[#0f172a] mb-4">🎯 Interview Prep Questions</h3>
          <div className="space-y-3">
            {coaching.interview_questions.slice(0, 6).map((q: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-[#f1f4f3] border border-[#bdc9c6]">
                <div className="flex items-start gap-3">
                  <span className="text-sm font-bold text-[#005c55] mt-0.5">{i + 1}.</span>
                  <div>
                    <p className="text-sm font-medium text-[#0f172a] mb-1">{q.question}</p>
                    {q.tip && (
                      <p className="text-xs text-[#6e7977] flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" /> {q.tip}
                      </p>
                    )}
                    {q.category && (
                      <span className="mt-1 inline-block text-[10px] font-medium px-2 py-0.5 bg-[#005c55]/10 text-[#005c55] rounded-full">
                        {q.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
