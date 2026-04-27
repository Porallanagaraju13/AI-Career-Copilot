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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        className="w-full max-w-md relative z-10"
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
            Welcome to Career Copilot
          </h1>
          <p className="text-[#6e7977] text-sm text-center mb-8">
            Sign in or create an account to get started
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/20 text-[#93000a] text-sm text-center">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#0f766e]" />
              <p className="text-sm text-[#6e7977]">Securing your login...</p>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google login failed")}
                theme="outline"
                size="large"
                text="continue_with"
                width="100%"
              />
            </div>
          )}

          <div className="mt-8 text-center text-xs text-[#6e7977]">
            By continuing, you agree to our <br />
            <Link href="/terms" className="text-[#0f766e] hover:underline">Terms & Conditions</Link> and{" "}
            <Link href="/privacy" className="text-[#0f766e] hover:underline">Privacy Policy</Link>.
          </div>
        </div>
      </motion.div>
    </div>
  );
}

