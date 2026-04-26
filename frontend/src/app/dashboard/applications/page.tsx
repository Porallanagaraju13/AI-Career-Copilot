"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle2, XCircle, MessageSquare, Plus, Calendar, Building, MapPin } from "lucide-react";
import Link from "next/link";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const statusCfg: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  saved: { label: "Saved", color: "text-[#565e74]", bg: "bg-[#dae2fd]/50", border: "border-[#565e74]/20", icon: Clock },
  applied: { label: "Applied", color: "text-[#005c55]", bg: "bg-[#005c55]/8", border: "border-[#005c55]/15", icon: FileText },
  interview: { label: "Interview", color: "text-[#7f4025]", bg: "bg-[#7f4025]/8", border: "border-[#7f4025]/15", icon: MessageSquare },
  offered: { label: "Offered", color: "text-[#0f766e]", bg: "bg-[#0f766e]/10", border: "border-[#0f766e]/20", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "text-[#ba1a1a]", bg: "bg-[#ffdad6]", border: "border-[#ba1a1a]/15", icon: XCircle },
};

interface App { id: string; title: string; company: string; status: string; date: string; location?: string; }

export default function ApplicationsPage() {
  const [apps, setApps] = useState<App[]>([]);

  useEffect(() => {
    const s = localStorage.getItem("applications");
    if (s) { setApps(JSON.parse(s)); } else {
      const d: App[] = [
        { id:"1",title:"Frontend Engineer",company:"Vercel",status:"applied",date:"2026-04-20",location:"Remote" },
        { id:"2",title:"Full Stack Dev",company:"Stripe",status:"interview",date:"2026-04-18",location:"SF" },
        { id:"3",title:"React Developer",company:"Supabase",status:"saved",date:"2026-04-22",location:"Remote" },
        { id:"4",title:"Software Engineer",company:"Linear",status:"offered",date:"2026-04-15",location:"Remote" },
        { id:"5",title:"Backend Engineer",company:"Netlify",status:"applied",date:"2026-04-19",location:"Remote" },
      ];
      setApps(d); localStorage.setItem("applications", JSON.stringify(d));
    }
  }, []);

  const grouped = Object.keys(statusCfg).reduce((a, s) => { a[s] = apps.filter(x => x.status === s); return a; }, {} as Record<string, App[]>);

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="space-y-6">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Applications</h1>
          <p className="text-[#3e4947] text-sm mt-1">{apps.length} tracked</p>
        </div>
        <Link href="/dashboard/jobs" className="flex items-center gap-2 bg-[#005c55] hover:bg-[#0f766e] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm">
          <Plus className="w-4 h-4" /> Add Job
        </Link>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(statusCfg).map(([k, c]) => (
          <div key={k} className={`p-3 rounded-xl border ${c.border} ${c.bg} text-center`}>
            <div className={`text-xl font-bold ${c.color}`}>{grouped[k]?.length||0}</div>
            <div className="text-xs text-[#6e7977]">{c.label}</div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="flex gap-4 overflow-x-auto pb-4">
        {Object.entries(statusCfg).map(([status, cfg]) => (
          <div key={status} className="min-w-[240px] flex-1">
            <div className="flex items-center gap-2 mb-3 px-1">
              <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
              <span className="text-sm font-bold text-[#0f172a]">{cfg.label}</span>
              <span className="text-xs text-[#6e7977] bg-[#ebefed] px-2 py-0.5 rounded-full ml-auto">{grouped[status]?.length||0}</span>
            </div>
            <div className="space-y-2">
              {grouped[status]?.map(a => (
                <div key={a.id} className="p-4 rounded-xl bg-white border border-[#bdc9c6] card-hover transition card-elevated">
                  <h4 className="text-sm font-bold text-[#0f172a] mb-1">{a.title}</h4>
                  <p className="flex items-center gap-1 text-xs text-[#6e7977] mb-1"><Building className="w-3 h-3" />{a.company}</p>
                  {a.location && <p className="flex items-center gap-1 text-xs text-[#6e7977] mb-1"><MapPin className="w-3 h-3" />{a.location}</p>}
                  <p className="flex items-center gap-1 text-xs text-[#6e7977]"><Calendar className="w-3 h-3" />{new Date(a.date).toLocaleDateString()}</p>
                </div>
              ))}
              {(!grouped[status]||grouped[status].length===0) && (
                <div className="p-4 rounded-xl border-2 border-dashed border-[#bdc9c6] text-center text-xs text-[#6e7977]">No applications</div>
              )}
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
