"use client";

import { useEffect, useRef, useState } from "react";
import { getSkills } from "@/lib/db";
import type { SkillNode } from "@/types";

type SkillCategory = SkillNode["cat"];
type DrawSkill = SkillNode & {
  x: number;
  y: number;
  bx: number;
  by: number;
  r: number;
  ph: number;
};

const FALLBACK_SKILLS: SkillNode[] = [
  { id: "cpp",        label: "C++",        cat: "core",     level: 90, desc: "Systems, robotics, performance-focused code", order: 1, url: "#projects" },
  { id: "python",     label: "Python",     cat: "core",     level: 95, desc: "ML, scripting, automation, backend tools", order: 2, url: "#projects" },
  { id: "typescript", label: "TypeScript", cat: "web",      level: 82, desc: "React, Next.js, admin dashboards", order: 3, url: "#projects" },
  { id: "pytorch",    label: "PyTorch",    cat: "ai",       level: 88, desc: "Deep learning, model training, anomaly detection", order: 4, url: "#projects" },
  { id: "ros2",       label: "ROS2",       cat: "robotics", level: 85, desc: "Robotics pipelines, sensors, autonomy", order: 5, url: "#projects" },
  { id: "react",      label: "React",      cat: "web",      level: 84, desc: "Interactive interfaces and portfolio systems", order: 6, url: "#projects" },
  { id: "linux",      label: "Linux",      cat: "systems",  level: 88, desc: "Development environments, OS-level workflows", order: 7, url: "#projects" },
  { id: "firebase",   label: "Firebase",   cat: "web",      level: 78, desc: "Firestore, Auth, Storage, admin tools", order: 8, url: "#projects" },
  { id: "embedded",   label: "Embedded",   cat: "robotics", level: 75, desc: "Arduino, Raspberry Pi, sensors, RTOS ideas", order: 9, url: "#projects" },
];

const CAT: Record<SkillCategory, { stroke: string; alpha: number; glow: number }> = {
  core:     { stroke: "#0ea5e9", alpha: 0.12, glow: 0.28 },
  systems:  { stroke: "#0891b2", alpha: 0.10, glow: 0.22 },
  ai:       { stroke: "#7c3aed", alpha: 0.10, glow: 0.22 },
  robotics: { stroke: "#059669", alpha: 0.10, glow: 0.22 },
  web:      { stroke: "#2563eb", alpha: 0.10, glow: 0.22 },
  learning: { stroke: "#d97706", alpha: 0.10, glow: 0.22 },
};

const LEGEND: { cat: SkillCategory; label: string; color: string }[] = [
  { cat: "core",     label: "Core Languages", color: CAT.core.stroke },
  { cat: "systems",  label: "Systems",        color: CAT.systems.stroke },
  { cat: "ai",       label: "AI / ML",        color: CAT.ai.stroke },
  { cat: "robotics", label: "Robotics",       color: CAT.robotics.stroke },
  { cat: "web",      label: "Web / Cloud",    color: CAT.web.stroke },
  { cat: "learning", label: "Learning Now",   color: CAT.learning.stroke },
];

function hexRgba(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function normalizeSkills(skills: SkillNode[]) {
  return skills
    .filter((skill) => skill.label?.trim())
    .map((skill, index) => ({
      ...skill,
      id: skill.id || skill.label,
      level: Math.min(100, Math.max(1, Number(skill.level) || 50)),
      order: Number.isFinite(Number(skill.order)) ? Number(skill.order) : index + 1,
      cat: CAT[skill.cat] ? skill.cat : "learning",
      desc: skill.desc || "Click to explore related work.",
      url: skill.url || "",
    }))
    .sort((a, b) => a.order - b.order);
}

export default function SkillsSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [skills, setSkills] = useState<SkillNode[]>(FALLBACK_SKILLS);

  useEffect(() => {
    let alive = true;

    getSkills()
      .then((items) => {
        if (!alive) return;
        const normalized = normalizeSkills(items);
        setSkills(normalized.length ? normalized : FALLBACK_SKILLS);
      })
      .catch(() => {
        if (alive) setSkills(FALLBACK_SKILLS);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const tip = tooltipRef.current;
    if (!canvas || !tip) return;

    const canvasEl: HTMLCanvasElement = canvas;
    const tipEl: HTMLDivElement = tip;
    const context = canvasEl.getContext("2d");
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    let W = 0;
    let H = 0;
    let raf = 0;
    let t = 0;
    let nodes: DrawSkill[] = [];
    let hov: DrawSkill | null = null;

    const activeSkills = normalizeSkills(skills);

    function place() {
      nodes = activeSkills.map((s, i) => {
        const a = (i / Math.max(activeSkills.length, 1)) * Math.PI * 2 - Math.PI / 2;
        const ring = i % 3;
        const spread = 0.26 + ring * 0.045;
        const bx = W / 2 + Math.cos(a) * W * spread;
        const by = H / 2 + Math.sin(a) * H * 0.39;

        return {
          ...s,
          x: bx,
          y: by,
          bx,
          by,
          r: (s.level / 100) * 15 + 11,
          ph: (i * 1.618) % (Math.PI * 2),
        };
      });
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      W = canvasEl.offsetWidth;
      H = canvasEl.offsetHeight;
      canvasEl.width = Math.floor(W * dpr);
      canvasEl.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      place();
    }

    function getPointer(event: MouseEvent) {
      const rc = canvasEl.getBoundingClientRect();
      return { x: event.clientX - rc.left, y: event.clientY - rc.top };
    }

    function setHover(mx: number, my: number) {
      const found = nodes.find((n) => Math.hypot(n.x - mx, n.y - my) < n.r + 8) || null;
      hov = found;

      if (found) {
        const urlHint = found.url ? "<br><span style='opacity:.55'>Click to open linked section/project</span>" : "";
        tipEl.style.opacity = "1";
        tipEl.style.left = `${mx + 14}px`;
        tipEl.style.top = `${my - 12}px`;
        tipEl.innerHTML = `<strong>${found.label}</strong> — ${found.desc}<br><span style="opacity:.55">${found.level}% proficiency</span>${urlHint}`;
        canvasEl.style.cursor = found.url ? "pointer" : "default";
      } else {
        tipEl.style.opacity = "0";
        canvasEl.style.cursor = "default";
      }
    }

    function openSkillUrl(url: string) {
      if (!url) return;

      if (url.startsWith("#")) {
        document.querySelector(url)?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      if (url.startsWith("/")) {
        window.location.href = url;
        return;
      }

      window.open(url, "_blank", "noopener,noreferrer");
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.004;

      nodes.forEach((n) => {
        n.x = n.bx + Math.sin(t + n.ph) * 7;
        n.y = n.by + Math.cos(t * 0.7 + n.ph) * 5;
      });

      nodes.forEach((a, i) => {
        nodes.forEach((b, j) => {
          if (j <= i) return;
          const sameCategory = a.cat === b.cat;
          const bothStrong = a.level > 74 && b.level > 74;
          if (!sameCategory && !bothStrong) return;

          ctx.strokeStyle = hexRgba(sameCategory ? CAT[a.cat].stroke : "#94a3b8", sameCategory ? 0.18 : 0.07);
          ctx.lineWidth = sameCategory ? 0.75 : 0.4;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        });
      });

      nodes.forEach((n) => {
        const c = CAT[n.cat];
        const isH = n === hov;
        const r = n.r + (isH ? 5 : 0);
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2.8);
        grd.addColorStop(0, hexRgba(c.stroke, isH ? c.glow * 1.4 : c.glow));
        grd.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = hexRgba(c.stroke, c.alpha);
        ctx.fill();
        ctx.strokeStyle = c.stroke;
        ctx.lineWidth = isH ? 2 : 1.5;
        ctx.stroke();

        if (n.url) {
          ctx.beginPath();
          ctx.arc(n.x + r * 0.55, n.y - r * 0.55, 3, 0, Math.PI * 2);
          ctx.fillStyle = c.stroke;
          ctx.fill();
        }

        ctx.fillStyle = isH ? "#0f172a" : "#334155";
        ctx.font = `${isH ? 600 : 500} ${isH ? 11 : 10}px "JetBrains Mono", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(n.label, n.x, n.y);
      });

      raf = requestAnimationFrame(draw);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvasEl);

    const onMouseMove = (event: MouseEvent) => {
      const { x, y } = getPointer(event);
      setHover(x, y);
    };

    const onClick = () => {
      if (hov?.url) openSkillUrl(hov.url);
    };

    const onMouseLeave = () => {
      tipEl.style.opacity = "0";
      hov = null;
    };

    canvasEl.addEventListener("mousemove", onMouseMove);
    canvasEl.addEventListener("click", onClick);
    canvasEl.addEventListener("mouseleave", onMouseLeave);

    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvasEl.removeEventListener("mousemove", onMouseMove);
      canvasEl.removeEventListener("click", onClick);
      canvasEl.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [skills]);

  return (
    <section id="skills" className="py-28 bg-surface-50">
      <div className="container-section">
        <div className="mb-10">
          <p className="section-eyebrow">02 — Technical Map</p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-slate-900 tracking-tight">
            Engineering Brain<span className="text-brand-500">.</span>
          </h2>
          <p className="mt-3 text-slate-500 max-w-md font-mono text-sm">
            Hover nodes to explore. Click linked nodes to jump into related work.
          </p>
        </div>

        <div className="relative rounded-2xl border border-surface-200 bg-white overflow-hidden shadow-sm" style={{ height: 480 }}>
          <canvas ref={canvasRef} className="w-full h-full" />
          <div
            ref={tooltipRef}
            className="absolute pointer-events-none bg-slate-900 text-white text-xs font-mono px-3 py-2 rounded-lg shadow-lg opacity-0 transition-opacity duration-150 z-10 max-w-[230px] leading-relaxed"
          />
        </div>

        <div className="flex flex-wrap gap-5 mt-4 px-1">
          {LEGEND.map((l) => (
            <div key={l.cat} className="flex items-center gap-2 font-mono text-xs text-slate-500">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
