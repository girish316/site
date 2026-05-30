import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | Timestamp | string | number | { seconds?: number; nanoseconds?: number } | undefined | null): string {
  if (!date) return "";

  let d: Date;

  if (date instanceof Timestamp) {
    d = date.toDate();
  } else if (date instanceof Date) {
    d = date;
  } else if (typeof date === "string" || typeof date === "number") {
    d = new Date(date);
  } else if (typeof date === "object" && typeof date.seconds === "number") {
    d = new Date(date.seconds * 1000);
  } else {
    return "";
  }

  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}


export function formatDateShort(date: Date | Timestamp | string | number | { seconds?: number; nanoseconds?: number } | undefined | null): string {
  if (!date) return "";

  let d: Date;

  if (date instanceof Timestamp) {
    d = date.toDate();
  } else if (date instanceof Date) {
    d = date;
  } else if (typeof date === "string" || typeof date === "number") {
    d = new Date(date);
  } else if (typeof date === "object" && typeof date.seconds === "number") {
    d = new Date(date.seconds * 1000);
  } else {
    return "";
  }

  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export const CAT_LABELS: Record<string, string> = {
  ai: "AI / ML", robotics: "Robotics", systems: "Systems",
  fullstack: "Full Stack", hackathon: "Hackathon", experimental: "Experimental",
};

export const CAT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ai:           { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200" },
  robotics:     { bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200"   },
  systems:      { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200"},
  fullstack:    { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200"   },
  hackathon:    { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200"   },
  experimental: { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"  },
};

export const STATUS_COLORS: Record<string, string> = {
  active: "text-emerald-600", paused: "text-amber-600",
  shipped: "text-blue-600",  abandoned: "text-slate-400",
};

export function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (_key, value) => {
    if (value && typeof value === "object" && typeof value.toDate === "function") {
      return value.toDate().toISOString();
    }
    return value;
  }));
}