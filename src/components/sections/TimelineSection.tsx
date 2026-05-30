"use client";
import { motion } from "framer-motion";
import type { TimelineEvent } from "@/types";
import { cn } from "@/lib/utils";

const COLOR_MAP: Record<string, string> = {
  cyan:   "bg-brand-500 border-brand-200",
  purple: "bg-violet-500 border-violet-200",
  neon:   "bg-emerald-500 border-emerald-200",
  pink:   "bg-rose-500 border-rose-200",
  amber:  "bg-amber-500 border-amber-200",
};
const TAG_MAP: Record<string, string> = {
  cyan:   "bg-brand-50 text-brand-700 border-brand-200",
  purple: "bg-violet-50 text-violet-700 border-violet-200",
  neon:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  pink:   "bg-rose-50 text-rose-700 border-rose-200",
  amber:  "bg-amber-50 text-amber-700 border-amber-200",
};
const FALLBACK: TimelineEvent[] = [
  { id:"1",order:1,date:"Sep 2024 – Present",event:"CS & AI Double Major",place:"University of Toronto",description:"Focusing on systems, computer vision, and ML theory. Building weird side projects between lecture slides.",tag:"Education",color:"cyan" },
  { id:"2",order:2,date:"Summer 2024",event:"Software Engineering Intern",place:"Cohere AI, Toronto",description:"Worked on inference optimization. Reduced p99 latency by 35% through CUDA kernel development.",tag:"Internship",color:"purple" },
  { id:"3",order:3,date:"Jan 2024",event:"🥇 1st Place — HackMIT",place:"MIT, Cambridge MA",description:"Built MindBridge in 36 hours. Won Best Hardware Hack out of 400+ teams.",tag:"Hackathon",color:"pink" },
  { id:"4",order:4,date:"Sep 2023",event:"Robotics Team Lead",place:"UofT Robotics Club",description:"Leading a 12-person team building an autonomous rover for the Canadian Robotics Competition.",tag:"Leadership",color:"neon" },
  { id:"5",order:5,date:"Summer 2023",event:"Research Assistant",place:"Toronto Robotics Institute",description:"Differentiable simulation pipeline for robot policy learning. Co-authored paper on sim-to-real transfer.",tag:"Research",color:"cyan" },
];

export default function TimelineSection({ events }: { events: TimelineEvent[] }) {
  const items = events.length > 0 ? events : FALLBACK;
  return (
    <section id="timeline" className="py-28 bg-white">
      <div className="container-section">
        <div className="mb-12">
          <p className="section-eyebrow">03 — Journey</p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-slate-900 tracking-tight">Timeline<span className="text-brand-500">.</span></h2>
          <p className="mt-3 text-slate-500 max-w-md">Where I have been, what I have built, how I got here.</p>
        </div>
        <div className="relative max-w-2xl">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-brand-300 via-violet-300 to-transparent" />
          <div className="space-y-10">
            {items.map((item, i) => (
              <motion.div key={item.id} initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true,margin:"-60px"}} transition={{duration:.5,delay:i*.08}} className="flex gap-6">
                <div className="flex-shrink-0 mt-1">
                  <div className={cn("w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-sm", COLOR_MAP[item.color]??COLOR_MAP.cyan)}>
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-slate-400">{item.date}</span>
                    <span className={cn("font-mono text-xs px-2 py-0.5 rounded-full border", TAG_MAP[item.color]??TAG_MAP.cyan)}>{item.tag}</span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-slate-900 mb-0.5">{item.event}</h3>
                  <p className="font-mono text-sm text-brand-600 mb-2">{item.place}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
