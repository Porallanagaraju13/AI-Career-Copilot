"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Briefcase, MapPin, DollarSign, ExternalLink, Clock, Building,
  Bookmark, Search, Filter, ArrowUpRight
} from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function JobsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

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

  const jobs = (data.jobs || []).filter((j: any) => {
    const matchesSearch = j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.company?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" ||
      (filter === "remote" && j.remote) ||
      (filter === "onsite" && !j.remote);
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-[#0f172a]">Job Matches</h1>
        <p className="text-[#3e4947] text-sm mt-1">{jobs.length} jobs matched to your profile</p>
      </motion.div>

      {/* Search & Filter */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7977]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs or companies..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#bdc9c6] rounded-lg text-[#181c1c] placeholder:text-[#6e7977] focus:outline-none focus:border-[#006a63] focus:ring-2 focus:ring-[#006a63]/20 transition" />
        </div>
        <div className="flex gap-2">
          {["all", "remote", "onsite"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition capitalize ${filter === f ? "bg-[#005c55] text-white shadow-sm" : "bg-white border border-[#bdc9c6] text-[#3e4947] hover:bg-[#f1f4f3]"}`}>
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Job Cards */}
      {jobs.length === 0 ? (
        <motion.div variants={fadeUp} className="p-8 rounded-2xl bg-white border border-[#bdc9c6] text-center card-elevated">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#565e74]/10 flex items-center justify-center mb-4">
            <Briefcase className="w-8 h-8 text-[#565e74]" />
          </div>
          <h3 className="text-xl font-bold text-[#0f172a] mb-2">No Jobs Found</h3>
          <p className="text-[#3e4947] text-sm">Try adjusting your search or upload your resume for personalized matches.</p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job: any, i: number) => (
            <motion.div key={i} variants={fadeUp}
              className="p-5 rounded-2xl bg-white border border-[#bdc9c6] card-hover transition group card-elevated">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#f1f4f3] border border-[#e5e9e7] flex items-center justify-center shrink-0 overflow-hidden">
                  {job.logo ? (
                    <img src={job.logo} alt="" className="w-7 h-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <Building className="w-5 h-5 text-[#6e7977]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-[#0f172a] group-hover:text-[#005c55] transition">{job.title}</h3>
                      <p className="text-sm text-[#3e4947]">{job.company}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-1 bg-[#005c55]/8 border border-[#005c55]/15 text-[#005c55] text-xs font-bold rounded-lg">
                        {job.match_score}% match
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[#6e7977]">
                    {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>}
                    {job.salary && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {job.salary}</span>}
                    {job.type && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.type}</span>}
                    {job.remote && <span className="px-1.5 py-0.5 bg-[#0f766e]/10 text-[#0f766e] rounded text-[10px] font-medium">Remote</span>}
                  </div>

                  {/* AI Match Reason */}
                  {job.match_reason && (
                    <p className="mt-2 text-xs text-[#3e4947] italic">&ldquo;{job.match_reason}&rdquo;</p>
                  )}

                  {/* Matched Skills */}
                  {job.matched_skills && job.matched_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {job.matched_skills.map((skill: string, si: number) => (
                        <span key={si} className="px-2 py-0.5 bg-[#005c55]/8 text-[#005c55] text-[10px] font-medium rounded border border-[#005c55]/15">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-4">
                    {job.url && (
                      <a href={job.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#005c55] hover:bg-[#0f766e] text-white text-xs font-medium rounded-lg transition shadow-sm">
                        Apply <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button className="p-2 text-[#6e7977] hover:text-[#005c55] transition">
                      <Bookmark className="w-4 h-4" />
                    </button>
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
