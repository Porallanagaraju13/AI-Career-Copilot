import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "AI Career Copilot — Smart Resume Screening & Job Matching",
  description: "Upload your resume and get instant ATS scoring, AI-powered role detection, and personalized job recommendations. Land your dream job faster.",
  keywords: ["resume screening", "ATS score", "job matching", "career", "AI"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Use env var, fallback to dummy ID if not set (useful for UI development before actual Google setup)
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "dummy-client-id.apps.googleusercontent.com";
  
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <GoogleOAuthProvider clientId={clientId}>
          {children}
        </GoogleOAuthProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
