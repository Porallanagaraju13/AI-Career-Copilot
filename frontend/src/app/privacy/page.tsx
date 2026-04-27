import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#005c55]/5 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-3xl relative z-10">
        <Link href="/login" className="inline-flex items-center gap-2 text-[#005c55] hover:text-[#0f766e] transition mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        
        <div className="p-8 md:p-12 rounded-2xl bg-white border border-[#bdc9c6] shadow-sm card-elevated">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[#bdc9c6]">
            <div className="w-12 h-12 rounded-xl bg-[#005c55]/10 flex items-center justify-center text-[#005c55]">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0f172a]">Privacy Policy</h1>
              <p className="text-[#6e7977] mt-1">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none prose-headings:text-[#0f172a] prose-p:text-[#4b5563] prose-a:text-[#005c55]">
            <h3>1. Information We Collect</h3>
            <p>
              When you use Career Copilot, we only collect the information you voluntarily provide to us, 
              such as your Google account email and basic profile information when you log in using Google OAuth. 
              We also collect resumes and professional data you upload for analysis.
            </p>

            <h3>2. How We Use Your Information</h3>
            <p>
              We use your information exclusively to provide, maintain, and improve our AI resume screening 
              and job matching services. Your uploaded resumes are processed by our AI to generate scores and 
              feedback. We do not sell your personal data to third parties.
            </p>

            <h3>3. Data Security</h3>
            <p>
              We implement industry-standard security measures to protect your personal information and uploaded 
              documents from unauthorized access, alteration, disclosure, or destruction. We utilize secure OAuth 
              authentication to ensure your login credentials remain private.
            </p>

            <h3>4. Third-Party Services</h3>
            <p>
              Our service integrates with third-party APIs (such as Google OAuth for authentication and LLM 
              providers for AI analysis). These providers have their own privacy policies governing the data 
              they process on our behalf.
            </p>

            <h3>5. Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy, please contact us at support@careercopilot.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
