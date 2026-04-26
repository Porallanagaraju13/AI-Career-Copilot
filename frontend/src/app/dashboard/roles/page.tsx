"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Target, ArrowRight, TrendingUp, Award } from "lucide-react";
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

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="space-y-6">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Detected Roles</h1>
          <p className="text-[#3e4947] text-sm mt-1">{roles.length} matching roles found for your profile</p>
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

                  {role.matching_skills && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {role.matching_skills.slice(0, 5).map((skill: string, si: number) => (
                        <span key={si} className="px-2 py-0.5 bg-[#005c55]/8 text-[#005c55] text-[11px] font-medium rounded-md border border-[#005c55]/15">
                          {skill}
                        </span>
                      ))}
                      {role.matching_skills.length > 5 && (
                        <span className="px-2 py-0.5 bg-[#f1f4f3] text-[#6e7977] text-[11px] font-medium rounded-md">
                          +{role.matching_skills.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-[#6e7977]">
                    <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {role.demand || "High"} Demand</span>
                    <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {role.level || "Mid-Senior"}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
