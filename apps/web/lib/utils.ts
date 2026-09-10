import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format INR currency
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format INR in lakhs/crores shorthand
export function formatINRShort(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)}Cr`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`;
  return `₹${amount}`;
}

// Risk level from score
export function getRiskLevel(score: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (score < 30) return "LOW";
  if (score < 55) return "MEDIUM";
  if (score < 75) return "HIGH";
  return "CRITICAL";
}

// Risk colour class
export function getRiskColor(level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"): string {
  switch (level) {
    case "LOW": return "text-green-600";
    case "MEDIUM": return "text-amber-500";
    case "HIGH": return "text-red-500";
    case "CRITICAL": return "text-red-700";
  }
}

export function getRiskBgColor(level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"): string {
  switch (level) {
    case "LOW": return "bg-green-50 border-green-200";
    case "MEDIUM": return "bg-amber-50 border-amber-200";
    case "HIGH": return "bg-red-50 border-red-200";
    case "CRITICAL": return "bg-red-100 border-red-300";
  }
}

// Truncate Ethereum address
export function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

// Format relative time
export function timeAgo(date: Date | number): string {
  const seconds = Math.floor((Date.now() - Number(date)) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
