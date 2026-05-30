"use client";
import { useEffect, useState } from "react";
import { getExperiments, upsertExperiment, deleteExperiment } from "@/lib/db";
import type { Experiment, ExperimentStatus } from "@/types";
import { cn, STATUS_COLORS } from "@/lib/utils";
import { Plus, Pencil, Trash2, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const EMPTY: Partial<Experiment> = { name:"",thought:"",status:"active",statusLabel:"Building",tags:[],progress:0,order:99 };
const STATUSES: {val:ExperimentStatus;label:string}[] = [
  {val:"active",label:"Active"},{val:"paused",label:"Paused"},{val:"shipped",label:"Shipped"},{val:"abandoned",label:"Abandoned"}
];

export default function AdminExperimentsPage() {
  const [items,setItems]     = useState<Experiment[]>([]);
  const [editing,setEditing] = useState<Partial<Experiment>|null>(null);
  const [editId,setEditId]   = useState<string|null>(null);
  const [saving,setSaving]   = useState(false);
  const [loading,setLoading] = useState(true);
  const load = ()=>getExperiments().then(setItems).finally(()=>setLoading(false));
  useEffect(()=>{load();},[]);

  async function save() {
    if (!editing?.name?.trim()){toast.error("Name required");return;}
    setSaving(true);
    try { await upsertExperiment(editing,editId??undefined); toast.success("Saved!"); setEditing(null);setEditId(null);load(); }
    catch{toast.error("Save failed");} finally{setSaving(false);}
  }
  async function del(id:string,name:string){
    if(!confirm(`Delete "${name}"?`))return;
    await deleteExperiment(id);toast.success("Deleted");load();
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="font-display font-bold text-3xl text-slate-900">Experiments</h1>
          <p className="text-slate-500 text-sm mt-1">{items.filter(e=>e.status==="active").length} active</p></div>
        <button onClick={()=>{setEditing({...EMPTY});setEditId(null);}} className="btn-primary"><Plus size={16}/> Add</button>
      </div>

      {editing && (
        <div className="card p-5 mb-6 border-brand-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-slate-900">{editId?"Edit":"New"} Experiment</h2>
            <button onClick={()=>{setEditing(null);setEditId(null);}} className="p-1.5 rounded hover:bg-surface-100"><X size={14}/></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="font-mono text-xs text-slate-400 block mb-1">Name</label>
              <input value={editing.name??""} onChange={e=>setEditing(v=>({...v,name:e.target.value}))} className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white"/></div>
            <div><label className="font-mono text-xs text-slate-400 block mb-1">Status Label</label>
              <input value={editing.statusLabel??""} onChange={e=>setEditing(v=>({...v,statusLabel:e.target.value}))} placeholder="Building, Running..." className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white"/></div>
          </div>
          <div><label className="font-mono text-xs text-slate-400 block mb-1">The Thought</label>
            <textarea value={editing.thought??""} onChange={e=>setEditing(v=>({...v,thought:e.target.value}))} rows={2} className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white resize-none"/></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="font-mono text-xs text-slate-400 block mb-1">Status</label>
              <select value={editing.status??'active'} onChange={e=>setEditing(v=>({...v,status:e.target.value as ExperimentStatus}))} className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
                {STATUSES.map(s=><option key={s.val} value={s.val}>{s.label}</option>)}</select></div>
            <div><label className="font-mono text-xs text-slate-400 block mb-1">Progress %</label>
              <input type="number" min={0} max={100} value={editing.progress??0} onChange={e=>setEditing(v=>({...v,progress:+e.target.value}))} className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white"/></div>
            <div><label className="font-mono text-xs text-slate-400 block mb-1">Order</label>
              <input type="number" value={editing.order??99} onChange={e=>setEditing(v=>({...v,order:+e.target.value}))} className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white"/></div>
          </div>
          <div><label className="font-mono text-xs text-slate-400 block mb-1">Tags (comma-separated)</label>
            <input value={(editing.tags??[]).join(", ")} onChange={e=>setEditing(v=>({...v,tags:e.target.value.split(",").map(t=>t.trim()).filter(Boolean)}))} className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white"/></div>
          <div className="flex gap-2 justify-end">
            <button onClick={()=>{setEditing(null);setEditId(null);}} className="btn-secondary text-sm">Cancel</button>
            <button onClick={save} disabled={saving} className="btn-primary text-sm">{saving?<Loader2 size={13} className="animate-spin"/>:<Save size={13}/>} Save</button>
          </div>
        </div>
      )}

      {loading?<div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-500" size={24}/></div>
      :<div className="space-y-2">{items.map(exp=>(
        <div key={exp.id} className="card p-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={cn("font-mono text-xs",STATUS_COLORS[exp.status])}>{exp.statusLabel}</span>
              <span className="font-mono text-xs text-slate-400">{exp.progress}%</span>
            </div>
            <div className="font-display font-semibold text-slate-900">{exp.name}</div>
            <div className="font-mono text-xs text-slate-400 truncate mt-0.5">{exp.tags.join(", ")}</div>
          </div>
          <div className="flex gap-1">
            <button onClick={()=>{setEditing({...exp});setEditId(exp.id);}} className="p-2 rounded-lg hover:bg-surface-100 text-slate-400 hover:text-brand-600 transition-colors"><Pencil size={14}/></button>
            <button onClick={()=>del(exp.id,exp.name)} className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={14}/></button>
          </div>
        </div>))}</div>}
    </div>
  );
}
