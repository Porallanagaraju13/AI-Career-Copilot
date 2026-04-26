import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_LOCAL_API_URL = "http://localhost:8000/api";
const DEFAULT_PRODUCTION_API_URL = "https://ai-career-copilot-api-porallanagaraju13.onrender.com/api";

export const API_URL = process.env.NEXT_PUBLIC_API_URL
  || (process.env.NODE_ENV === "production" ? DEFAULT_PRODUCTION_API_URL : DEFAULT_LOCAL_API_URL);

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }

  return res.json();
}

export function formatSalary(min: number, max: number, currency: string = "USD") {
  const fmt = (n: number) => {
    if (currency === "INR") return `₹${(n / 100000).toFixed(0)}L`;
    if (currency === "EUR") return `€${(n / 1000).toFixed(0)}K`;
    return `$${(n / 1000).toFixed(0)}K`;
  };
  return `${fmt(min)} - ${fmt(max)}`;
}

export function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export function getScoreColor(score: number) {
  if (score >= 80) return "text-[#0f766e]";
  if (score >= 60) return "text-[#005c55]";
  if (score >= 40) return "text-[#7f4025]";
  return "text-[#ba1a1a]";
}

export function getScoreGrade(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  return "Needs Work";
}
