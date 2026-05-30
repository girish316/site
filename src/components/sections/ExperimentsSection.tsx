"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Experiment } from "@/types";
import { cn, STATUS_COLORS } from "@/lib/utils";

const FALLBACK: Experiment[] = [
  { id:"1",name:"Neural Radiance Arm",status:"active",statusLabel:"Building",thought:"What if a robot arm reconstructed 3D scenes with NeRF and planned grasps in the learned latent space?",tags:["NeRF","RL","PyTorch","ROS2"],progress:35,order:1,createdAt:new Date(),updatedAt:new Date() },
  { id:"2",name:"Mesh OS",status:"active",statusLabel:"Designing",thought:"Distributed OS where every laptop becomes a compute node. CRDT-based state sync, zero-config mesh networking.",tags:["Go","CRDT","P2P"],progress:15,order:2,createdAt:new Date(),updatedAt:new Date() },
  { id:"3",name:"RL for Speedruns",status:"active",statusLabel:"Running",thought:"Training an RL agent to speedrun Super Mario using screen pixels only. Currently hitting 4min on World 1.",tags:["RL","PPO","CV","Fun"],progress:72,order:3,createdAt:new Date(),updatedAt:new Date() },
  { id:"4",name:"LLM Kernel",status:"active",statusLabel:"Researching",thought:"Can you run 7B model inference in Linux kernel space? Probably terrible idea. Will find out.",tags:["C","CUDA","Linux","LLM"],progress:8,order:4,createdAt:new Date(),updatedAt:new Date() },
  { id:"5",name:"TouchType",status:"paused",statusLabel:"Paused",thought:"Haptic language for the deaf using skin-based tactile encoding. Need collaborators.",tags:["HCI","Haptics","Hardware"],progress:60,order:5,createdAt:new Date(),updatedAt:new Date() },
  { id:"6",name:"Spatial Audio Nav",status:"paused",statusLabel:"On Hold",thought:"Navigation for blind users using binaural audio rendering. Prototype works, needs user testing.",tags:["DSP","Accessibility","C++"],progress:45,order:6,createdAt:new Date(),updatedAt:new Date() },
];

const DOT_COLORS: Record<string, string> = {
  active:    "bg-emerald-500 animate-pulse",
  paused:    "bg-amber-400",
  shipped:   "bg-brand-500",
  abandoned: "bg-slate-300",
};

export default function ExperimentsSection({ experiments }: { experiments: Experiment[] }) {
  const items = experiments.length > 0 ? experiments : FALLBACK;
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit",timeZone:"America/Toronto"})+" EST");
    update(); const id = setInterval(update, 1000); return () => clearInterval(id);
  }, []);

  return (
    <section id="experiments" className="py-28 bg-surface-50">
      <div className="container-section">
        <div className="mb-10">
          <p className="section-eyebrow">04 — R&amp;D Lab</p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-slate-900 tracking-tight">Current Experiments<span className="text-brand-500">.</span></h2>
          <p className="mt-3 text-slate-500 max-w-md">Impulsive ideas, unfinished builds, and things that might be brilliant or terrible.</p>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-2.5 mb-6 bg-white rounded-xl border border-surface-200 font-mono text-xs">
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LAB ACTIVE — {items.filter(e=>e.status==="active").length} experiments running
          </div>
          <div className="text-slate-400">{time}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((exp, i) => (
            <motion.div key={exp.id} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.4,delay:i*.06}}
              className="card p-5 hover:border-violet-200 hover:shadow-violet-50 group">
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("w-2 h-2 rounded-full flex-shrink-0", DOT_COLORS[exp.status]??DOT_COLORS.active)} />
                <span className={cn("font-mono text-xs uppercase tracking-widest", STATUS_COLORS[exp.status])}>{exp.statusLabel}</span>
                <span className="ml-auto font-mono text-xs text-slate-400">{exp.progress}%</span>
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 mb-2 group-hover:text-violet-700 transition-colors">{exp.name}</h3>
              <p className="font-mono text-xs text-slate-500 leading-relaxed mb-3">{exp.thought}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {exp.tags.map(t => <span key={t} className="chip">{t}</span>)}
              </div>
              <div className="h-1 bg-surface-100 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-brand-400 to-violet-400 rounded-full"
                  initial={{width:0}} whileInView={{width:`${exp.progress}%`}} viewport={{once:true}} transition={{duration:.8,delay:.2}} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
