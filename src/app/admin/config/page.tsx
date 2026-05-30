"use client";
import { useEffect, useState } from "react";
import { getSiteConfig, updateSiteConfig } from "@/lib/db";
import type { SiteConfig } from "@/types";
import { Save, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const DEFAULT: SiteConfig = {
  name: "Girish M",
  title: "SWE student @ UWaterloo",
  subtitle: "Robotics Developer · AI Builder, Full Stack Hacker",
  bio: "I build systems that move, think, react, and occasionally break in spectacular ways.",
  location: "Ottawa, Canada",
  email: "girishm1603@gmail.com",
  github: "https://github.com/girish316",
  linkedin: "https://www.linkedin.com/in/girish-m-788b9a303/",
  status: "Open to Winter 2027 internships",
  roles: ["Software Engineer","Robotics Developer","AI Builder","Systems Thinker","Full Stack Hacker","Builder of Weird Things"],
  stats: [{ val:"12+", label:"Projects Shipped" },{ val:"3×", label:"Hackathon Wins" }, { val:"∞", label:"Lines of Curiosity" }, { val:"∞", label:"Side Quests" }],
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-xs uppercase tracking-widest text-slate-400 block mb-1.5">{label}</label>
      {children}
      {hint && <p className="font-mono text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type="text" }: { value:string; onChange:(v:string)=>void; placeholder?:string; type?:string }) {
  return (
    <input type={type} value={value??""} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-400 bg-white"/>
  );
}

export default function AdminConfigPage() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    getSiteConfig().then(c=>{ if(c) setConfig(c); }).finally(()=>setLoading(false));
  },[]);

  async function save() {
    setSaving(true);
    try {
      await updateSiteConfig(config);
      toast.success("Site config saved! Changes live within ~60s.");
    } catch { toast.error("Save failed"); } finally { setSaving(false); }
  }

  const updateStat = (i: number, key: "val"|"label", val: string) =>
    setConfig(c=>({ ...c, stats: c.stats.map((s,j)=>j===i?{...s,[key]:val}:s) }));

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-brand-500" size={24}/></div>;

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900">Site Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Your name, status, contact info, and hero content.</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={15} className="animate-spin"/> : <Save size={15}/>} Save Changes
        </button>
      </div>

      <div className="space-y-6">

        {/* ── Identity ── */}
        <div className="card p-6 space-y-4">
          <h2 className="font-display font-semibold text-slate-900 text-lg">Identity</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name">
              <Input value={config.name} onChange={v=>setConfig(c=>({...c,name:v}))} placeholder="Girish M"/>
            </Field>
            <Field label="Location">
              <Input value={config.location} onChange={v=>setConfig(c=>({...c,location:v}))} placeholder="Ottawa, Canada"/>
            </Field>
          </div>
          <Field label="Short bio (shown in hero)" hint="Keep it punchy — 1-2 sentences max.">
            <textarea value={config.bio} onChange={e=>setConfig(c=>({...c,bio:e.target.value}))}
              rows={3} placeholder="I build systems that move, think, react…"
              className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-400 bg-white resize-none"/>
          </Field>
        </div>

        {/* ── Availability status ── */}
        <div className="card p-6 space-y-4">
          <h2 className="font-display font-semibold text-slate-900 text-lg">Availability Status</h2>
          <Field label="Status message" hint='Shown as the green badge e.g. "Open to Winter 2027 internships"'>
            <Input value={config.status} onChange={v=>setConfig(c=>({...c,status:v}))}
              placeholder="Open to Winter 2027 internships"/>
          </Field>
          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 font-mono text-sm text-emerald-700">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
            Preview: {config.status || "Open to opportunities"}
          </div>
        </div>

        {/* ── Contact ── */}
        <div className="card p-6 space-y-4">
          <h2 className="font-display font-semibold text-slate-900 text-lg">Contact Info</h2>
          <Field label="Email">
            <Input type="email" value={config.email} onChange={v=>setConfig(c=>({...c,email:v}))} placeholder="you@email.com"/>
          </Field>
          <Field label="GitHub URL">
            <Input value={config.github} onChange={v=>setConfig(c=>({...c,github:v}))} placeholder="https://github.com/username"/>
          </Field>
          <Field label="LinkedIn URL">
            <Input value={config.linkedin} onChange={v=>setConfig(c=>({...c,linkedin:v}))} placeholder="https://linkedin.com/in/username"/>
          </Field>
        </div>

        {/* ── Hero typing roles ── */}
        <div className="card p-6 space-y-4">
          <h2 className="font-display font-semibold text-slate-900 text-lg">Typing Roles</h2>
          <Field label="Roles (one per line)" hint="These cycle in the hero typewriter animation.">
            <textarea
              value={(config.roles??[]).join("\n")}
              onChange={e=>setConfig(c=>({...c,roles:e.target.value.split("\n").map(r=>r.trim()).filter(Boolean)}))}
              rows={6}
              className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm font-mono text-slate-800 outline-none focus:border-brand-400 bg-white resize-none"
            />
          </Field>
        </div>

        {/* ── Hero stats ── */}
        <div className="card p-6 space-y-4">
          <h2 className="font-display font-semibold text-slate-900 text-lg">Hero Stats</h2>
          <p className="font-mono text-xs text-slate-400">The 3 numbers shown under your bio.</p>
          <div className="space-y-3">
            {(config.stats??[]).map((s,i)=>(
              <div key={i} className="flex gap-3 items-center">
                <input value={s.val} onChange={e=>updateStat(i,"val",e.target.value)}
                  placeholder="12+"
                  className="w-24 border border-surface-200 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-900 outline-none focus:border-brand-400 bg-white text-center"/>
                <input value={s.label} onChange={e=>updateStat(i,"label",e.target.value)}
                  placeholder="Projects Shipped"
                  className="flex-1 border border-surface-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-400 bg-white"/>
              </div>
            ))}
          </div>
        </div>

        <button onClick={save} disabled={saving} className="btn-primary w-full justify-center py-3">
          {saving ? <><Loader2 size={15} className="animate-spin"/> Saving…</> : <><Save size={15}/> Save All Changes</>}
        </button>
      </div>
    </div>
  );
}
