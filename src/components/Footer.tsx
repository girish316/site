import Link from "next/link";
import type { SiteConfig } from "@/types";

export default function Footer({ config }: { config?: SiteConfig | null }) {
  return (
    <footer className="border-t border-surface-200 bg-white">
      <div className="container-section py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-mono text-sm text-slate-400">
          © {new Date().getFullYear()} <span className="text-slate-700 font-semibold">{config?.name ?? "Girish M"}</span> — Built with Next.js 15 + Firebase
        </div>
        <div className="flex items-center gap-6">
          {[["/#projects","Projects"],["/#skills","Skills"],["/#timeline","Timeline"],["/blog","Blog"],["/#contact","Contact"]].map(([href,label])=>(
            <Link key={href} href={href} className="font-mono text-xs text-slate-400 hover:text-brand-600 transition-colors">{label}</Link>
          ))}
        </div>
        <div className="font-mono text-xs text-slate-400 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> online
        </div>
      </div>
    </footer>
  );
}
