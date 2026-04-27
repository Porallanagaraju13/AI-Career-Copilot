"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/utils";
import { Users, FileText, Briefcase, BarChart2, CheckSquare, Lock } from "lucide-react";
import { motion } from "framer-motion";

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
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setAdminToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!adminToken) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/admin/stats`, {
          headers: {
            "Authorization": `Bearer ${adminToken}`,
            "Content-Type": "application/json"
          }
        });

        if (res.status === 401) {
          localStorage.removeItem("adminToken");
          setAdminToken(null);
          setError("Session expired. Please log in again.");
          return;
        }

        if (!res.ok) throw new Error("Failed to load stats");

        const data = await res.json();
        setStats(data);
        setError("");
      } catch (err: any) {
        setError(err.message || "Failed to load admin stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [adminToken]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        let errData;
        try {
          errData = await res.json();
        } catch {
          throw new Error(`HTTP Error: ${res.status}`);
        }
        throw new Error(errData.detail || "Invalid admin credentials");
      }

      const data = await res.json();
      localStorage.setItem("adminToken", data.token);
      setAdminToken(data.token);
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setAdminToken(null);
    setStats(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#0f766e] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-[#f7faf8] flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl border border-[#e1e8e5] shadow-sm max-w-md w-full"
        >
          <div className="w-16 h-16 bg-[#e1e8e5] text-[#0f766e] rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-center text-[#0f172a] mb-2">Admin Access</h1>
          <p className="text-center text-[#6e7977] mb-8">Please enter your credentials to view the dashboard.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0f172a] mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-lg border border-[#e1e8e5] focus:outline-none focus:ring-2 focus:ring-[#0f766e] bg-[#f7faf8]"
                placeholder="Admin username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0f172a] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg border border-[#e1e8e5] focus:outline-none focus:ring-2 focus:ring-[#0f766e] bg-[#f7faf8]"
                placeholder="••••••••"
                required
              />
            </div>
            
            {loginError && <p className="text-[#ba1a1a] text-sm">{loginError}</p>}
            {error && <p className="text-[#ba1a1a] text-sm">{error}</p>}
            
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-[#0f766e] text-white rounded-lg hover:bg-[#005c55] transition-colors font-medium disabled:opacity-50"
            >
              {isLoggingIn ? "Authenticating..." : "Login to Admin Panel"}
            </button>
          </form>
        </motion.div>
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
          <button 
            onClick={handleLogout}
            className="text-sm font-medium text-[#ba1a1a] hover:underline"
          >
            Logout
          </button>
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
                {stats?.recent_users?.length === 0 && (
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

