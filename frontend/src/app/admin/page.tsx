"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/utils";
import { Users, FileText, Briefcase, BarChart2, CheckSquare } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Stats {
  counts: {
    users: number;
    resumes: number;
    jobs: number;
    applications: number;
  };
  recent_users: Array<{
    id: string;
    email: string;
    full_name: string;
    created_at: string;
    plan: string;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          router.push("/login");
          return;
        }
        
        const user = JSON.parse(userStr);
        if (user.role !== "admin") {
          setError("You do not have permission to view this page.");
          setLoading(false);
          return;
        }

        const data = await apiFetch("/admin/stats");
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Failed to load admin stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#0f766e] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7faf8] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-[#ba1a1a]/20 shadow-sm text-center max-w-md w-full">
          <div className="w-16 h-16 bg-[#ffdad6] text-[#93000a] rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-[#0f172a] mb-2">Access Denied</h1>
          <p className="text-[#6e7977] mb-6">{error}</p>
          <Link href="/dashboard" className="px-6 py-2 bg-[#0f766e] text-white rounded-lg hover:bg-[#005c55] transition-colors inline-block">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf8] pb-12">
      {/* Header */}
      <header className="bg-white border-b border-[#e1e8e5] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0f766e] rounded-lg flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#0f172a]">Admin Panel</span>
          </div>
          <Link href="/dashboard" className="text-sm font-medium text-[#0f766e] hover:underline">
            Exit Admin
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <h1 className="text-2xl font-bold text-[#0f172a] mb-8">Platform Analytics</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Users" value={stats?.counts.users || 0} icon={Users} color="bg-blue-100 text-blue-700" />
          <StatCard title="Resumes Parsed" value={stats?.counts.resumes || 0} icon={FileText} color="bg-green-100 text-green-700" />
          <StatCard title="Active Jobs" value={stats?.counts.jobs || 0} icon={Briefcase} color="bg-purple-100 text-purple-700" />
          <StatCard title="Job Applications" value={stats?.counts.applications || 0} icon={CheckSquare} color="bg-orange-100 text-orange-700" />
        </div>

        {/* Recent Signups */}
        <div className="bg-white rounded-2xl border border-[#e1e8e5] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e1e8e5]">
            <h2 className="font-bold text-[#0f172a]">Recent Signups</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f7faf8] border-b border-[#e1e8e5] text-sm text-[#6e7977]">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Plan</th>
                  <th className="px-6 py-3 font-medium">Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recent_users.map((user, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={user.id} 
                    className="border-b border-[#e1e8e5] last:border-0 hover:bg-[#f7faf8]/50"
                  >
                    <td className="px-6 py-4 font-medium text-[#0f172a]">
                      {user.full_name || "Anonymous"}
                    </td>
                    <td className="px-6 py-4 text-[#6e7977]">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-[#dae2fd] text-[#001849] rounded-md text-xs font-medium uppercase tracking-wide">
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#6e7977]">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
                {stats?.recent_users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-[#6e7977]">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-2xl border border-[#e1e8e5] shadow-sm flex items-start justify-between"
    >
      <div>
        <p className="text-[#6e7977] text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-[#0f172a]">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </motion.div>
  );
}
