"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, ArrowRight, Loader2, KeyRound } from "lucide-react";
import { apiFetch } from "@/lib/utils";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await apiFetch("/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSuccess("We've sent a 6-digit code to your email.");
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp_code: otp }),
      });
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/auth/google", {
        method: "POST",
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Google login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#005c55]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#dae2fd]/30 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#0f766e] flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#0f172a]">Career Copilot</span>
        </Link>

        {/* Card */}
        <div className="p-8 rounded-2xl bg-white border border-[#bdc9c6] shadow-sm card-elevated">
          <h1 className="text-2xl font-bold text-[#0f172a] text-center mb-1">
            {step === "email" ? "Sign in or Create Account" : "Enter Verification Code"}
          </h1>
          <p className="text-[#6e7977] text-sm text-center mb-8">
            {step === "email" ? "Use your email or Google to continue" : `We sent a code to ${email}`}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/20 text-[#93000a] text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-[#cce8e4] border border-[#006a63]/20 text-[#006a63] text-sm">{success}</div>
          )}

          {step === "email" ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#181c1c] mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7977]" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full pl-10 pr-4 py-3 bg-[#f1f4f3] border border-[#bdc9c6] rounded-lg text-[#181c1c] placeholder:text-[#6e7977] focus:outline-none focus:border-[#006a63] focus:ring-2 focus:ring-[#006a63]/20 transition"
                    placeholder="you@example.com" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-[#005c55] hover:bg-[#0f766e] disabled:opacity-50 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 shadow-sm">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue with Email <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#181c1c] mb-1.5">6-Digit OTP</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7977]" />
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6}
                    className="w-full pl-10 pr-4 py-3 bg-[#f1f4f3] border border-[#bdc9c6] rounded-lg text-[#181c1c] placeholder:text-[#6e7977] focus:outline-none focus:border-[#006a63] focus:ring-2 focus:ring-[#006a63]/20 transition tracking-widest font-mono text-center text-lg"
                    placeholder="------" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-[#005c55] hover:bg-[#0f766e] disabled:opacity-50 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 shadow-sm">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify & Sign In <ArrowRight className="w-4 h-4" /></>}
              </button>
              
              <button type="button" onClick={() => { setStep("email"); setOtp(""); setSuccess(""); setError(""); }} 
                className="w-full py-2 text-sm text-[#005c55] hover:text-[#0f766e] transition">
                Use a different email
              </button>
            </form>
          )}

          {step === "email" && (
            <>
              <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#bdc9c6]" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-[#6e7977]">or</span></div>
              </div>

              <div className="mt-4 flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google login failed")}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  width="100%"
                />
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
