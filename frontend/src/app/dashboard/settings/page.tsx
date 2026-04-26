"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Bell, Shield, Save, Loader2, CheckCircle2 } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", location: "" });

  useEffect(() => {
    const d = localStorage.getItem("user");
    if (d) { const u = JSON.parse(d); setUser(u); setForm({ full_name: u.full_name || "", email: u.email || "", phone: "", location: "" }); }
  }, []);

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      const updated = { ...user, full_name: form.full_name, email: form.email };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      setSaving(false); setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="max-w-3xl mx-auto space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-[#0f172a]">Settings</h1>
        <p className="text-[#3e4947] text-sm mt-1">Manage your account preferences</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="flex gap-1 p-1 bg-[#f1f4f3] rounded-xl border border-[#bdc9c6]">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition flex-1 justify-center
              ${tab === t.id ? "bg-white text-[#0f172a] shadow-sm" : "text-[#6e7977] hover:text-[#3e4947]"}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </motion.div>

      {/* Profile Tab */}
      {tab === "profile" && (
        <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-white border border-[#bdc9c6] card-elevated space-y-5">
          <div className="flex items-center gap-4 pb-5 border-b border-[#e5e9e7]">
            <div className="w-16 h-16 rounded-2xl bg-[#0f766e] flex items-center justify-center text-xl font-bold text-white">
              {(form.full_name || "U")[0].toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0f172a]">{form.full_name || "User"}</h3>
              <p className="text-sm text-[#6e7977]">{form.email}</p>
            </div>
          </div>

          {[
            { label: "Full Name", key: "full_name", icon: User, type: "text", ph: "Your name" },
            { label: "Email", key: "email", icon: Mail, type: "email", ph: "you@example.com" },
            { label: "Phone", key: "phone", icon: User, type: "tel", ph: "+1 (555) 000-0000" },
            { label: "Location", key: "location", icon: User, type: "text", ph: "City, Country" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-[#181c1c] mb-1.5">{f.label}</label>
              <div className="relative">
                <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7977]" />
                <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-[#f1f4f3] border border-[#bdc9c6] rounded-lg text-[#181c1c] placeholder:text-[#6e7977] focus:outline-none focus:border-[#006a63] focus:ring-2 focus:ring-[#006a63]/20 transition"
                  placeholder={f.ph} />
              </div>
            </div>
          ))}

          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-[#005c55] hover:bg-[#0f766e] disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition shadow-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {tab === "notifications" && (
        <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-white border border-[#bdc9c6] card-elevated space-y-4">
          {[
            { label: "Email Notifications", desc: "Receive updates about new job matches", on: true },
            { label: "Application Updates", desc: "Get notified when application status changes", on: true },
            { label: "Weekly Digest", desc: "Summary of your career activity", on: false },
            { label: "Marketing Emails", desc: "Tips, offers, and product updates", on: false },
          ].map((n, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[#f1f4f3] border border-[#e5e9e7]">
              <div>
                <div className="text-sm font-medium text-[#0f172a]">{n.label}</div>
                <div className="text-xs text-[#6e7977] mt-0.5">{n.desc}</div>
              </div>
              <div className={`toggle-track ${n.on ? "active" : ""}`} />
            </div>
          ))}
        </motion.div>
      )}

      {/* Security Tab */}
      {tab === "security" && (
        <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-white border border-[#bdc9c6] card-elevated space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#181c1c] mb-1.5">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7977]" />
              <input type="password" className="w-full pl-10 pr-4 py-3 bg-[#f1f4f3] border border-[#bdc9c6] rounded-lg text-[#181c1c] placeholder:text-[#6e7977] focus:outline-none focus:border-[#006a63] focus:ring-2 focus:ring-[#006a63]/20 transition" placeholder="••••••••" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#181c1c] mb-1.5">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7977]" />
              <input type="password" className="w-full pl-10 pr-4 py-3 bg-[#f1f4f3] border border-[#bdc9c6] rounded-lg text-[#181c1c] placeholder:text-[#6e7977] focus:outline-none focus:border-[#006a63] focus:ring-2 focus:ring-[#006a63]/20 transition" placeholder="••••••••" />
            </div>
          </div>
          <button className="flex items-center gap-2 bg-[#005c55] hover:bg-[#0f766e] text-white px-6 py-3 rounded-lg font-medium transition shadow-sm">
            <Lock className="w-4 h-4" /> Update Password
          </button>

          <div className="pt-5 border-t border-[#e5e9e7]">
            <h4 className="text-sm font-bold text-[#ba1a1a] mb-2">Danger Zone</h4>
            <button className="px-4 py-2.5 bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#93000a] text-sm font-medium rounded-lg border border-[#ba1a1a]/15 transition">
              Delete Account
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
