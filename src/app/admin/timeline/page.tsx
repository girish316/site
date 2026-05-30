"use client";
import { useEffect, useState } from "react";
import { getTimeline, upsertTimelineEvent, deleteTimelineEvent } from "@/lib/db";
import type { TimelineEvent } from "@/types";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const COLORS: TimelineEvent["color"][] = ["cyan","purple","neon","pink","amber"];
const COLOR_PREVIEW: Record<string,string> = {
  cyan:"bg-brand-500", purple:"bg-violet-500", neon:"bg-emerald-500", pink:"bg-rose-500", amber:"bg-amber-500"
};
const EMPTY: Partial<TimelineEvent> = { date:"", event:"", place:"", description:"", tag:"", color:"cyan", order:99 };

export default function AdminTimelinePage() {
  const [items, setItems]     = useState<TimelineEvent[]>([]);
  const [editing, setEditing] = useState<Partial<TimelineEvent>|null>(null);
  const [editId, setEditId]   = useState<string|null>(null);
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => getTimeline().then(setItems).finally(()=>setLoading(false));
  useEffect(()=>{ load(); },[]);

  async function save() {
    if (!editing?.event?.trim() || !editing?.date?.trim()) { toast.error("Date and event name required"); return; }
    setSaving(true);
    try {
      await upsertTimelineEvent(editing, editId??undefined);
      toast.success("Saved!"); setEditing(null); setEditId(null); load();
    } catch { toast.error("Save failed"); } finally { setSaving(false); }
  }

  async function del(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    await deleteTimelineEvent(id); toast.success("Deleted"); load();
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900">Timeline</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your career and project timeline events.</p>
        </div>
        <button onClick={()=>{setEditing({...EMPTY});setEditId(null);}} className="btn-primary"><Plus size={16}/> Add Event</button>
      </div>

      {editing && (
        <div className="card p-5 mb-6 border-brand-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-slate-900">{editId?"Edit":"New"} Event</h2>
            <button onClick={()=>{setEditing(null);setEditId(null);}} className="p-1.5 rounded hover:bg-surface-100 text-slate-400"><X size={14}/></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-xs text-slate-400 block mb-1">Date / Range</label>
              <input value={editing.date??""} onChange={e=>setEditing(v=>({...v,date:e.target.value}))}
                placeholder="Summer 2024  or  Sep 2024 – Present"
                className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white"/>
            </div>
            <div>
              <label className="font-mono text-xs text-slate-400 block mb-1">Tag</label>
              <input value={editing.tag??""} onChange={e=>setEditing(v=>({...v,tag:e.target.value}))}
                placeholder="Internship, Hackathon, Education…"
                className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white"/>
            </div>
          </div>
          <div>
            <label className="font-mono text-xs text-slate-400 block mb-1">Event title</label>
            <input value={editing.event??""} onChange={e=>setEditing(v=>({...v,event:e.target.value}))}
              placeholder="Software Engineering Intern"
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white font-semibold"/>
          </div>
          <div>
            <label className="font-mono text-xs text-slate-400 block mb-1">Company / Place</label>
            <input value={editing.place??""} onChange={e=>setEditing(v=>({...v,place:e.target.value}))}
              placeholder="Cohere AI, Toronto"
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white"/>
          </div>
          <div>
            <label className="font-mono text-xs text-slate-400 block mb-1">Description</label>
            <textarea value={editing.description??""} onChange={e=>setEditing(v=>({...v,description:e.target.value}))}
              rows={2} placeholder="What you did, what you built, what you learned…"
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white resize-none"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-xs text-slate-400 block mb-1">Dot colour</label>
              <div className="flex gap-2 mt-1">
                {COLORS.map(c=>(
                  <button key={c} onClick={()=>setEditing(v=>({...v,color:c}))}
                    className={cn("w-7 h-7 rounded-full border-2 transition-all", COLOR_PREVIEW[c],
                      editing.color===c ? "border-slate-700 scale-110" : "border-transparent opacity-60 hover:opacity-100")}
                    title={c}/>
                ))}
              </div>
            </div>
            <div>
              <label className="font-mono text-xs text-slate-400 block mb-1">Order (lower = top)</label>
              <input type="number" value={editing.order??99} onChange={e=>setEditing(v=>({...v,order:+e.target.value}))}
                className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white"/>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={()=>{setEditing(null);setEditId(null);}} className="btn-secondary text-sm">Cancel</button>
            <button onClick={save} disabled={saving} className="btn-primary text-sm">
              {saving?<Loader2 size={13} className="animate-spin"/>:<Save size={13}/>} Save
            </button>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-500" size={24}/></div>
      : items.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-surface-200 rounded-2xl text-slate-400">
          <p className="font-mono text-sm mb-3">No events yet — the timeline will show hardcoded defaults.</p>
          <button onClick={()=>{setEditing({...EMPTY});setEditId(null);}} className="btn-primary">Add first event</button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item=>(
            <div key={item.id} className="card p-4 flex items-start gap-3">
              <div className={cn("w-3 h-3 rounded-full mt-1.5 flex-shrink-0", COLOR_PREVIEW[item.color]??COLOR_PREVIEW.cyan)}/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-xs text-slate-400">{item.date}</span>
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-surface-100 text-slate-500 border border-surface-200">{item.tag}</span>
                </div>
                <div className="font-display font-semibold text-slate-900">{item.event}</div>
                <div className="font-mono text-xs text-brand-600">{item.place}</div>
                <div className="font-mono text-xs text-slate-400 mt-0.5 line-clamp-1">{item.description}</div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={()=>{setEditing({...item});setEditId(item.id);}} className="p-1.5 rounded hover:bg-surface-100 text-slate-400 hover:text-brand-600 transition-colors"><Pencil size={13}/></button>
                <button onClick={()=>del(item.id,item.event)} className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={13}/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
