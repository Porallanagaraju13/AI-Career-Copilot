"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Upload, BarChart3, Briefcase, Target, FileText,
  Settings, LogOut, ChevronLeft, Sparkles, Menu, Bell, Search, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getInitials } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/upload", icon: Upload, label: "Upload Resume" },
  { href: "/dashboard/ats-score", icon: BarChart3, label: "ATS Score" },
  { href: "/dashboard/roles", icon: Target, label: "Detected Roles" },
  { href: "/dashboard/jobs", icon: Briefcase, label: "Job Matches" },
  { href: "/dashboard/applications", icon: FileText, label: "Applications" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token) {
      router.push("/login");
      return;
    }
    if (userData) setUser(JSON.parse(userData));
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  if (!user) return (
    <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#0f766e] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7faf8] flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col border-r border-[#bdc9c6] bg-white transition-all duration-300
        ${collapsed ? "w-[68px]" : "w-64"} ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-[#bdc9c6] px-4 ${collapsed ? "justify-center" : "gap-2.5"}`}>
          <div className="w-8 h-8 shrink-0 rounded-lg bg-[#0f766e] flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {!collapsed && <span className="text-base font-bold text-[#0f172a] whitespace-nowrap">Career Copilot</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active ? "bg-[#005c55]/8 text-[#005c55]" : "text-[#3e4947] hover:text-[#181c1c] hover:bg-[#f1f4f3]"}`}>
                <item.icon className={`w-[18px] h-[18px] shrink-0 ${active ? "text-[#005c55]" : "text-[#6e7977] group-hover:text-[#3e4947]"}`} />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0f766e]" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-[#bdc9c6] p-2.5 space-y-1">
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex items-center gap-3 px-3 py-2.5 w-full text-sm text-[#6e7977] hover:text-[#181c1c] rounded-lg hover:bg-[#f1f4f3] transition">
            <ChevronLeft className={`w-[18px] h-[18px] transition-transform ${collapsed ? "rotate-180" : ""}`} />
            {!collapsed && <span>Collapse</span>}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-[#6e7977] hover:text-[#ba1a1a] rounded-lg hover:bg-[#ffdad6]/30 transition">
            <LogOut className="w-[18px] h-[18px]" />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-[#bdc9c6] flex items-center justify-between px-4 lg:px-6 bg-white/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-[#3e4947] hover:text-[#181c1c]">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#f1f4f3] rounded-lg border border-[#bdc9c6] w-64">
              <Search className="w-4 h-4 text-[#6e7977]" />
              <input type="text" placeholder="Search..." className="bg-transparent text-sm text-[#181c1c] placeholder:text-[#6e7977] outline-none w-full" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-[#3e4947] hover:text-[#181c1c] transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#0f766e] rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-[#bdc9c6]">
              <div className="w-8 h-8 rounded-full bg-[#0f766e] flex items-center justify-center text-xs font-bold text-white">
                {getInitials(user.full_name || user.email)}
              </div>
              {!collapsed && <span className="hidden sm:block text-sm text-[#181c1c] font-medium">{user.full_name || user.email}</span>}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
