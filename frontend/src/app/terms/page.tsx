import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

export default function TermsAndConditionsPage() {
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
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0f172a]">Terms & Conditions</h1>
              <p className="text-[#6e7977] mt-1">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none prose-headings:text-[#0f172a] prose-p:text-[#4b5563] prose-a:text-[#005c55]">
            <h3>1. Acceptance of Terms</h3>
            <p>
              By accessing and using Career Copilot, you accept and agree to be bound by the terms and provision 
              of this agreement. If you do not agree to abide by these terms, please do not use this service.
            </p>

            <h3>2. Service Description</h3>
            <p>
              Career Copilot provides AI-powered resume analysis and career insights. Our services are provided 
              "as is" and "as available". We reserve the right to modify, suspend, or discontinue the service 
              with or without notice at any time.
            </p>

            <h3>3. User Accounts</h3>
            <p>
              To use our service, you must authenticate using your Google account. You are responsible for 
              maintaining the confidentiality of your account and for all activities that occur under your account. 
              We are not liable for any loss or damage arising from your failure to protect your account.
            </p>

            <h3>4. User Content</h3>
            <p>
              You retain all rights to any resumes or documents you upload to Career Copilot. By uploading, you 
              grant us a license to process the document strictly for the purpose of providing you with our analysis 
              and feedback services. You agree not to upload any illegal or unauthorized content.
            </p>

            <h3>5. Limitation of Liability</h3>
            <p>
              Career Copilot shall not be liable for any indirect, incidental, special, consequential or punitive 
              damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of 
              data, use, goodwill, or other intangible losses, resulting from your use of the service.
            </p>

            <h3>6. Governing Law</h3>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which 
              we operate, without regard to its conflict of law provisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
