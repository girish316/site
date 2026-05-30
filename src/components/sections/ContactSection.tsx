"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import type { SiteConfig } from "@/types";
import { Github, Linkedin, Mail, Download, Send } from "lucide-react";

export default function ContactSection({ config, resumeUrl }: { config: SiteConfig|null; resumeUrl?: string|null }) {
  const email    = config?.email    ?? "girishm1603@gmail.com";
  const github   = config?.github   ?? "https://github.com/girish316";
  const linkedin = config?.linkedin ?? "https://www.linkedin.com/in/girish-m-788b9a303/";
  const status   = config?.status   ?? "Open to Winter 2027 internships";

  const [form, setForm] = useState({ name:"", email:"", message:"" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    window.open(`mailto:${email}?subject=Hey from ${form.name}&body=${encodeURIComponent(form.message)}`);
    setSent(true);
  }

  return (
    <section id="contact" className="py-28 bg-surface-50">
      <div className="container-section">
        <div className="mb-12 text-center">
          <p className="section-eyebrow justify-center">06 — Transmit Signal</p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-slate-900 tracking-tight">
            Let us build<br />
            <span className="gradient-text">something.</span>
          </h2>
          <p className="mt-4 text-slate-500 max-w-sm mx-auto">
            Open to internships, research collabs, and building weird things with people who care.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 font-mono text-sm text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {status}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Terminal card */}
          <motion.div initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:.5}}>
            <div className="terminal-block">
              <div className="terminal-bar">
                <div className="terminal-dot bg-[#ff5f57]" /><div className="terminal-dot bg-[#febc2e]" /><div className="terminal-dot bg-[#28c840]" />
                <span className="ml-2 font-mono text-xs text-slate-400">contact.sh</span>
              </div>
              <div className="p-5 space-y-1.5 font-mono text-sm">
                <div className="text-slate-400">$ cat contact.md</div>
                <br/>
                {[
                  ["name",     config?.name ?? "Girish M"],
                  ["email",    email],
                  ["github",   github.replace("https://","")],
                  ["linkedin", linkedin.replace("https://","")],
                  ["location", config?.location ?? "Toronto, Canada"],
                ].map(([k,v])=>(
                  <div key={k} className="flex gap-2">
                    <span className="text-violet-400 w-16 flex-shrink-0">{k}</span>
                    <span className="text-slate-400">:</span>
                    <span className="text-slate-200">{v}</span>
                  </div>
                ))}
                <br/>
                <div className="text-slate-400">$ echo "response: ~24hrs"</div>
                <div className="text-emerald-400">response: ~24hrs</div>
                <div className="flex items-center gap-1 mt-1 text-slate-400">$ <span className="inline-block w-2 h-4 bg-brand-400 animate-pulse ml-1"/></div>
              </div>
            </div>

            {/* Social links */}
            <div className="flex flex-wrap gap-3 mt-5">
              <a href={github} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm"><Github size={14}/> GitHub</a>
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm"><Linkedin size={14}/> LinkedIn</a>
              <a href={`mailto:${email}`} className="btn-secondary text-sm"><Mail size={14}/> Email</a>
              {resumeUrl && <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm"><Download size={14}/> Resume</a>}
            </div>
          </motion.div>

          {/* Quick contact form */}
          <motion.div initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:.5}}>
            {sent ? (
              <div className="card p-8 text-center h-full flex flex-col items-center justify-center">
                <div className="text-5xl mb-3">🚀</div>
                <h3 className="font-display font-bold text-xl text-slate-900 mb-2">Message sent!</h3>
                <p className="text-slate-500 text-sm">Your mail client should have opened. Looking forward to connecting.</p>
                <button onClick={()=>setSent(false)} className="btn-ghost mt-4 text-sm">Send another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card p-6 space-y-4">
                <h3 className="font-display font-bold text-lg text-slate-900">Quick message</h3>
                {[{id:"name",label:"Your name",type:"text",ph:"Jane Smith"},{id:"email",label:"Your email",type:"email",ph:"jane@company.com"}].map(f=>(
                  <div key={f.id}>
                    <label className="font-mono text-xs uppercase tracking-widest text-slate-400 block mb-1.5">{f.label}</label>
                    <input type={f.type} required placeholder={f.ph} value={(form as any)[f.id]}
                      onChange={e=>setForm(v=>({...v,[f.id]:e.target.value}))}
                      className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-400 bg-white"/>
                  </div>
                ))}
                <div>
                  <label className="font-mono text-xs uppercase tracking-widest text-slate-400 block mb-1.5">Message</label>
                  <textarea required placeholder="I'd love to talk about..." rows={4} value={form.message}
                    onChange={e=>setForm(v=>({...v,message:e.target.value}))}
                    className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-400 bg-white resize-none"/>
                </div>
                <button type="submit" className="btn-primary w-full justify-center"><Send size={14}/> Send Message</button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
