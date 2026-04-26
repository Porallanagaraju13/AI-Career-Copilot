import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
