"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, X, CheckCircle2, Loader2, Sparkles,
  AlertTriangle, BarChart3, Target, Briefcase, ArrowRight
} from "lucide-react";
import { apiFetch, API_URL } from "@/lib/utils";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");

  const stages = [
    "📄 Extracting text from resume...",
    "🔍 Parsing skills & experience...",
    "📊 Running ATS analysis...",
    "🎯 Detecting matching roles...",
    "💼 Finding job matches...",
    "✨ Generating recommendations...",
  ];

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFile(droppedFile)) setFile(droppedFile);
  }, []);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && isValidFile(selected)) setFile(selected);
  };

  function isValidFile(f: File) {
    const valid = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!valid.includes(f.type)) { setError("Please upload a PDF or DOCX file"); return false; }
    if (f.size > 10 * 1024 * 1024) { setError("File must be under 10MB"); return false; }
    setError("");
    return true;
  }

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setError("");

    // Animate through stages
    const stageInterval = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(prev + 1, 95);
        const stageIdx = Math.min(Math.floor(next / 17), stages.length - 1);
        setStage(stages[stageIdx]);
        return next;
      });
    }, 80);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");

      // Try authenticated endpoint first, fall back to guest
      let url = `${API_URL}/resume/analyze`;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      else url = `${API_URL}/resume/analyze-guest`;

      const res = await fetch(url, { method: "POST", body: formData, headers });

      if (!res.ok) {
        // Fallback: try guest endpoint
        const guestRes = await fetch(`${API_URL}/resume/analyze-guest`, {
          method: "POST", body: formData,
        });
        if (!guestRes.ok) throw new Error("Analysis failed. Please try again.");
        const data = await guestRes.json();
        localStorage.setItem("analysis", JSON.stringify(data));
      } else {
        const data = await res.json();
        localStorage.setItem("analysis", JSON.stringify(data));
      }

      clearInterval(stageInterval);
      setProgress(100);
      setStage("✅ Analysis complete!");

      setTimeout(() => router.push("/dashboard/ats-score"), 800);
    } catch (err: any) {
      clearInterval(stageInterval);
      setError(err.message || "Analysis failed");
      setLoading(false);
      setProgress(0);
    }
  }

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="max-w-3xl mx-auto space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-[#0f172a]">Upload Resume</h1>
        <p className="text-[#3e4947] text-sm mt-1">Upload your resume for AI-powered analysis</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!loading ? (
          <motion.div key="upload" variants={fadeUp} initial="hidden" animate="show" exit="hidden">
            {/* Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
                ${dragActive ? "border-[#006a63] bg-[#005c55]/5" : file ? "border-[#0f766e]/30 bg-[#0f766e]/5" : "border-[#bdc9c6] bg-white hover:border-[#6e7977] hover:bg-[#f1f4f3]"}`}
              onClick={() => !file && document.getElementById("file-input")?.click()}
            >
              <input id="file-input" type="file" accept=".pdf,.docx" onChange={handleSelect} className="hidden" />

              {!file ? (
                <>
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-[#005c55]/8 flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-[#005c55]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0f172a] mb-1">Drop your resume here</h3>
                  <p className="text-sm text-[#3e4947] mb-4">or click to browse • PDF, DOCX up to 10MB</p>
                  <div className="flex items-center justify-center gap-4 text-xs text-[#6e7977]">
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> PDF</span>
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> DOCX</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0f766e]/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-[#0f766e]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-[#0f172a]">{file.name}</p>
                    <p className="text-xs text-[#6e7977]">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-2 text-[#6e7977] hover:text-[#ba1a1a] transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/20 text-[#93000a] text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {/* Analyze Button */}
            <button onClick={handleAnalyze} disabled={!file}
              className={`mt-6 w-full py-4 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2
                ${file ? "bg-[#005c55] hover:bg-[#0f766e] text-white shadow-md" : "bg-[#ebefed] text-[#6e7977] cursor-not-allowed"}`}>
              <Sparkles className="w-5 h-5" />
              Analyze Resume with AI
            </button>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { icon: BarChart3, label: "ATS Score", desc: "Detailed 0-100 analysis", color: "text-[#005c55]" },
                { icon: Target, label: "Role Match", desc: "Best-fit positions", color: "text-[#565e74]" },
                { icon: Briefcase, label: "Job Search", desc: "Ranked opportunities", color: "text-[#0f766e]" },
              ].map((f) => (
                <div key={f.label} className="p-4 rounded-xl bg-white border border-[#bdc9c6] text-center card-elevated">
                  <f.icon className={`w-6 h-6 ${f.color} mx-auto mb-2`} />
                  <div className="text-sm font-medium text-[#0f172a]">{f.label}</div>
                  <div className="text-xs text-[#6e7977] mt-0.5">{f.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Loading State */
          <motion.div key="loading" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl bg-white border border-[#bdc9c6] text-center card-elevated">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#005c55]/8 flex items-center justify-center mb-6">
              {progress < 100 ? (
                <Loader2 className="w-8 h-8 text-[#005c55] animate-spin" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-[#0f766e]" />
              )}
            </div>

            <h3 className="text-xl font-bold text-[#0f172a] mb-2">
              {progress < 100 ? "Analyzing Your Resume" : "Analysis Complete!"}
            </h3>
            <p className="text-sm text-[#3e4947] mb-6">{stage}</p>

            {/* Progress bar */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between text-xs text-[#6e7977] mb-2">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-[#ebefed] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#005c55] to-[#0f766e]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
            </div>

            {progress >= 100 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                <button onClick={() => router.push("/dashboard/ats-score")}
                  className="inline-flex items-center gap-2 bg-[#005c55] hover:bg-[#0f766e] text-white px-6 py-3 rounded-lg font-medium transition shadow-sm">
                  View Results <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
