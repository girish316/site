"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";
import type { SiteConfig } from "@/types";

const DEFAULT_ROLES = ["Software Engineer","Robot Geek","AI Exploiter","Full Stack Hacker","Builder of Weird Things"];
const DEFAULT_BIO   = "I build systems that move, think, react, and occasionally break in spectacular ways.";
const DEFAULT_STATS = [{ val: "12+", label: "Projects" }, { val: "7+", label: "Robots Touched" }, { val: "∞", label: "Lines of Curiosity" }, { val: "∞", label: "Side Quests" }];

export default function HeroSection({ config }: { config: SiteConfig | null }) {
  const roles  = config?.roles ?? DEFAULT_ROLES;
  const stats  = config?.stats ?? DEFAULT_STATS;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [role, setRole]     = useState("");
  const [typing, setTyping] = useState(true);
  const [roleIdx, setRoleIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasEl = canvas;
    const ctx = canvasEl.getContext("2d")!;

    let W = 0, H = 0, raf = 0;
    const particles: { x:number; y:number; vx:number; vy:number; r:number }[] = [];

    function resize() {
      W = canvasEl.width = canvasEl.offsetWidth;
      H = canvasEl.height = canvasEl.offsetHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 60; i++) {
      particles.push({ x: Math.random()*W, y: Math.random()*H, vx: (Math.random()-.5)*.4, vy: (Math.random()-.5)*.4, r: Math.random()*2+.5 });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // Dot grid
      ctx.fillStyle = "rgba(148,163,184,0.18)";
      for (let x = 0; x < W; x += 28) for (let y = 0; y < H; y += 28) {
        ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI*2); ctx.fill();
      }
      // Particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = "rgba(14,165,233,0.35)"; ctx.fill();
      });
      // Connections
      for (let i = 0; i < particles.length; i++) for (let j = i+1; j < particles.length; j++) {
        const dx = particles[i].x-particles[j].x, dy = particles[i].y-particles[j].y;
        const d = Math.hypot(dx, dy);
        if (d < 90) {
          ctx.strokeStyle = `rgba(14,165,233,${.12*(1-d/90)})`;
          ctx.lineWidth = .5;
          ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y); ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  // Typewriter
  useEffect(() => {
    const current = roles[roleIdx];
    const delay = typing ? 65 : 38;
    const pause = typing && charIdx === current.length ? 1800 : 0;
    const timer = setTimeout(() => {
      if (typing) {
        if (charIdx < current.length) { setRole(current.slice(0, charIdx+1)); setCharIdx(c => c+1); }
        else { setTyping(false); }
      } else {
        if (charIdx > 0) { setRole(current.slice(0, charIdx-1)); setCharIdx(c => c-1); }
        else { setTyping(true); setRoleIdx(i => (i+1)%roles.length); }
      }
    }, pause || delay);
    return () => clearTimeout(timer);
  }, [typing, charIdx, roleIdx, roles]);

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden bg-surface-50">
      {/* Animated background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden />

      {/* Warm gradient blob */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-brand-100/60 via-violet-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-50/50 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="container-section relative z-10 pt-24 pb-20">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .6, delay: .2 }}
            className="section-eyebrow mb-6"
          >
            System Online — SWE @ UWaterloo
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .7, delay: .35 }}
            className="font-display font-extrabold tracking-tight leading-[.9] mb-4"
            style={{ fontSize: "clamp(3.5rem, 10vw, 8.5rem)" }}
          >
            <span className="text-slate-900">{config?.name?.split(" ")[0] ?? "GIRISH"}</span>{" "}
            <span className="gradient-text">{config?.name?.split(" ")[1] ?? "M"}</span>
            <span className="text-brand-400">.</span>
          </motion.h1>

          {/* Animated role */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .6, delay: .55 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="font-mono text-slate-400 text-lg">I am a</span>
            <span className="font-display font-bold text-xl text-brand-600 min-w-[260px]">
              {role}<span className="inline-block w-[3px] h-5 bg-brand-500 ml-0.5 align-middle animate-pulse" />
            </span>
          </motion.div>

          {/* Bio */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .6, delay: .7 }}
            className="text-slate-600 text-lg leading-relaxed max-w-xl mb-8"
          >
            {config?.bio ?? DEFAULT_BIO}{" "}
            <span className="font-semibold text-slate-800">Currently building robots that don't need babysitting.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .6, delay: .85 }}
            className="flex flex-wrap gap-3 mb-12"
          >
            <a href="#projects" className="btn-primary text-base px-6 py-3">View My Work</a>
            <a href="#contact" className="btn-secondary text-base px-6 py-3">Get In Touch</a>
            <a href={config?.github ?? "#"} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              <Github size={16} /> GitHub
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .6, delay: 1 }}
            className="flex flex-wrap gap-8"
          >
            {stats.map((s, i) => (
              <div key={i}>
                <div className="font-mono font-bold text-3xl text-slate-900">
                  {s.val.includes("∞") ? <span className="gradient-text">∞</span> : s.val}
                </div>
                <div className="font-mono text-xs uppercase tracking-widest text-slate-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="w-px h-10 bg-gradient-to-b from-brand-400 to-transparent animate-float" />
        <ArrowDown size={12} className="text-slate-400" />
      </motion.div>
    </section>
  );
}
