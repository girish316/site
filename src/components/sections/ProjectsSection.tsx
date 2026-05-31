"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";
import { Github, ExternalLink, Play, ChevronRight } from "lucide-react";
import type { Project } from "@/types";
import { CAT_LABELS, CAT_COLORS, cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "ai", label: "AI / ML" },
  { key: "robotics", label: "Robotics" },
  { key: "systems", label: "Systems" },
  { key: "fullstack", label: "Full Stack" },
  { key: "hackathon", label: "Hackathon" },
];

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState("all");
  const filtered = active === "all" ? projects : projects.filter(p => p.category === active);

  return (
    <section id="projects" className="py-28 bg-white">
      <div className="container-section">
        {/* Header */}
        <div className="mb-12">
          <p className="section-eyebrow">01 — Selected Work</p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-slate-900 tracking-tight">
            Projects<span className="text-brand-500">.</span>
          </h2>
          <p className="mt-3 text-slate-500 max-w-md">
            From autonomous robots to distributed systems — things I've shipped, broken, and fixed at 2am.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActive(f.key)}
              className={cn(
                "font-mono text-xs px-4 py-1.5 rounded-full border transition-all duration-200",
                active === f.key
                  ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                  : "bg-white text-slate-500 border-surface-200 hover:border-brand-300 hover:text-brand-600"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </AnimatePresence>
        </div>

        {projects.length === 0 && (
          <div className="text-center py-20 text-slate-400 font-mono text-sm">
            No projects yet — add some from the admin panel.
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectCard({ project: p, index }: { project: Project; index: number }) {
  const router = useRouter();
  const cat = CAT_COLORS[p.category] ?? CAT_COLORS.ai;
  const hasDemo = !!(p.demoVideo || (p.images && p.images.length > 0));

  function openProject() {
    router.push(`/projects/${p.slug}`);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: .95 }}
      transition={{ duration: .35, delay: index * .05 }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={openProject}
        onKeyDown={(e) => {
          if (e.key === "Enter") openProject();
        }}
        className="group block card p-6 h-full hover:-translate-y-1 cursor-pointer"
      >
        {p.coverImage && (
          <div className="relative h-40 -mx-6 -mt-6 mb-5 overflow-hidden rounded-t-2xl bg-surface-100">
            <img
              src={p.coverImage}
              alt={p.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {hasDemo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                  <Play size={16} className="text-slate-800 ml-0.5" />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-start justify-between mb-3">
          <span className={cn("chip border", cat.bg, cat.text, cat.border)}>
            {CAT_LABELS[p.category]}
          </span>

          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {p.githubUrl && (
              <a
                href={p.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg hover:bg-surface-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <Github size={14} />
              </a>
            )}

            {p.liveUrl && (
              <a
                href={p.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg hover:bg-surface-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        <h3 className="font-display font-bold text-xl text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
          {p.name}
        </h3>

        <p className="font-mono text-sm text-slate-500 leading-relaxed mb-4 line-clamp-3">
          {p.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {p.stack.slice(0, 5).map((s) => (
            <span key={s} className="chip">{s}</span>
          ))}
          {p.stack.length > 5 && <span className="chip">+{p.stack.length - 5}</span>}
        </div>

        {p.metrics?.length > 0 && (
          <div className="flex gap-4 pt-3 border-t border-surface-100">
            {p.metrics.slice(0, 3).map((m, i) => (
              <div key={i}>
                <div className="font-mono font-bold text-lg text-slate-900">{m.val}</div>
                <div className="font-mono text-xs text-slate-400 uppercase tracking-wide">{m.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-1 font-mono text-xs text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
          View case study <ChevronRight size={12} />
        </div>
      </div>
    </motion.div>
  );
}