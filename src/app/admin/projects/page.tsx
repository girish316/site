"use client";
import { useEffect, useState } from "react";
import { getProjects, upsertProject, deleteProject } from "@/lib/db";
import type { Project, ProjectCategory } from "@/types";
import { CAT_LABELS, cn } from "@/lib/utils";
import { Plus, Pencil, Trash2, X, Save, Loader2, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const ALL_CATS: ProjectCategory[] = ["ai","robotics","systems","fullstack","hackathon","experimental"];

const EMPTY: Partial<Project> = {
  name: "", category: "ai", description: "", longDescription: "",
  stack: [], metrics: [], featured: false, order: 99,
  githubUrl: "", liveUrl: "", demoType: "youtube", demoVideo: "",
};

// ── Chip input for tech stack ─────────────────────────────────
function ChipInput({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("");

  function add(raw: string) {
    const newTags = raw.split(",").map(t => t.trim()).filter(Boolean);
    const merged  = Array.from(new Set([...values, ...newTags]));
    onChange(merged);
    setInput("");
  }

  function handleChange(val: string) {
    if (val.includes(",")) {
      const parts = val.split(",");
      const last  = parts.pop() ?? "";
      add(parts.join(","));
      setInput(last.trimStart());
    } else {
      setInput(val);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); if (input.trim()) add(input); }
    if (e.key === "Backspace" && !input && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div className="border border-surface-200 rounded-xl p-2 bg-white focus-within:border-brand-400 min-h-[44px] flex flex-wrap gap-1.5 items-center">
      {values.map(v => (
        <span key={v} className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
          {v}
          <button type="button" onClick={() => onChange(values.filter(x => x !== v))} className="hover:text-rose-500">
            <X size={9}/>
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => handleChange(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => { if (input.trim()) add(input); }}
        placeholder={values.length === 0 ? "C++, ROS2, Python — type then Enter or comma" : "add more..."}
        className="flex-1 min-w-[140px] outline-none text-sm text-slate-800 bg-transparent font-mono placeholder:text-slate-300"
      />
    </div>
  );
}

// ── Multi-select category picker ──────────────────────────────
// We store category as a single string (matching the type) but allow picking
// from all options visually. Primary category = first selected.
function CategoryPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ALL_CATS.map(cat => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={cn(
            "font-mono text-xs px-3 py-1.5 rounded-lg border transition-all",
            value === cat
              ? "bg-brand-600 text-white border-brand-600 shadow-sm"
              : "bg-white text-slate-500 border-surface-200 hover:border-brand-300 hover:text-brand-600"
          )}
        >
          {CAT_LABELS[cat]}
        </button>
      ))}
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-xs uppercase tracking-widest text-slate-400 block mb-1.5">{label}</label>
      {children}
      {hint && <p className="font-mono text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, className }: any) {
  return (
    <input
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn("w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-400 bg-white", className)}
    />
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing]   = useState<Partial<Project> | null>(null);
  const [editId, setEditId]     = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(true);

  const load = () => getProjects().then(setProjects).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  function startNew()          { setEditing({ ...EMPTY }); setEditId(null); }
  function startEdit(p: Project) { setEditing({ ...p });    setEditId(p.id); }
  function cancel()            { setEditing(null); setEditId(null); }

  const addMetric    = () => setEditing(e => ({ ...e, metrics: [...(e?.metrics ?? []), { val: "", label: "" }] }));
  const removeMetric = (i: number) => setEditing(e => ({ ...e, metrics: (e?.metrics ?? []).filter((_, j) => j !== i) }));
  const updateMetric = (i: number, k: "val" | "label", v: string) =>
    setEditing(e => ({ ...e, metrics: (e?.metrics ?? []).map((m, j) => j === i ? { ...m, [k]: v } : m) }));

  async function save() {
    if (!editing?.name?.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    try {
      await upsertProject(editing as any, editId ?? undefined);
      toast.success(editId ? "Project updated!" : "Project added!");
      cancel(); load();
    } catch (e: any) {
      console.error(e);
      toast.error(`Save failed: ${e?.message ?? String(e)}`);
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    await deleteProject(id); toast.success("Deleted"); load();
  }

  // ── Editor view ──────────────────────────────────────────────
  if (editing) {
    const [showDemo, setShowDemo] = [!!editing.demoVideo, (v: boolean) => {}];
    return (
      <div className="p-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={cancel} className="btn-ghost p-2"><ArrowLeft size={16}/></button>
          <h1 className="font-display font-bold text-2xl text-slate-900">{editId ? "Edit Project" : "New Project"}</h1>
          <div className="ml-auto flex gap-2">
            <button onClick={cancel} className="btn-secondary">Cancel</button>
            <button onClick={save} disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Save
            </button>
          </div>
        </div>

        <div className="space-y-6">

          {/* Name */}
          <Field label="Project Name">
            <TextInput
              value={editing.name}
              onChange={(v: string) => setEditing(e => ({ ...e, name: v }))}
              placeholder="AutonomNav-ROS2"
            />
          </Field>

          {/* Category — visual picker */}
          <Field label="Category" hint="Select one category for this project">
            <CategoryPicker
              value={editing.category ?? "ai"}
              onChange={(v: string) => setEditing(e => ({ ...e, category: v as ProjectCategory }))}
            />
          </Field>

          {/* Short description */}
          <Field label="Short Description" hint="Shown on the project card">
            <textarea
              value={editing.description ?? ""}
              onChange={e => setEditing(f => ({ ...f, description: e.target.value }))}
              placeholder="One-paragraph description shown in project card..."
              rows={3}
              className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-400 bg-white resize-y"
            />
          </Field>

          {/* Tech stack — chip input */}
          <Field label="Tech Stack" hint='Type a technology, then press Enter or comma to add it'>
            <ChipInput
              values={editing.stack ?? []}
              onChange={(v: string[]) => setEditing(e => ({ ...e, stack: v }))}
            />
          </Field>

          {/* Links */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="GitHub URL">
              <TextInput value={editing.githubUrl} onChange={(v: string) => setEditing(e => ({ ...e, githubUrl: v }))} placeholder="https://github.com/..."/>
            </Field>
            <Field label="Live URL">
              <TextInput value={editing.liveUrl} onChange={(v: string) => setEditing(e => ({ ...e, liveUrl: v }))} placeholder="https://..."/>
            </Field>
          </div>

          {/* Metrics */}
          <Field label="Metrics">
            <div className="space-y-2">
              {(editing.metrics ?? []).map((m: any, i: number) => (
                <div key={i} className="flex gap-2 items-center">
                  <TextInput value={m.val} onChange={(v: string) => updateMetric(i, "val", v)} placeholder="40×" className="w-24"/>
                  <TextInput value={m.label} onChange={(v: string) => updateMetric(i, "label", v)} placeholder="Speedup"/>
                  <button onClick={() => removeMetric(i)} className="p-2 text-slate-400 hover:text-rose-500"><X size={14}/></button>
                </div>
              ))}
              <button onClick={addMetric} className="btn-ghost text-xs"><Plus size={12}/> Add Metric</button>
            </div>
          </Field>

          {/* Demo */}
          <Field label="Demo / Video">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(["youtube", "iframe", "video"] as const).map(t => (
                  <button key={t} type="button"
                    onClick={() => setEditing(e => ({ ...e, demoType: t }))}
                    className={cn(
                      "font-mono text-xs px-3 py-1.5 rounded-lg border transition-colors",
                      editing.demoType === t
                        ? "bg-brand-600 text-white border-brand-600"
                        : "border-surface-200 text-slate-500 hover:border-brand-300"
                    )}>
                    {t === "youtube" ? "YouTube" : t === "iframe" ? "iFrame / Link" : "Video URL"}
                  </button>
                ))}
              </div>
              <TextInput
                value={editing.demoVideo ?? ""}
                onChange={(v: string) => setEditing(e => ({ ...e, demoVideo: v }))}
                placeholder={
                  editing.demoType === "youtube" ? "https://youtube.com/watch?v=..."
                  : editing.demoType === "iframe" ? "https://..."
                  : "https://... (direct video URL)"
                }
              />
            </div>
          </Field>

          {/* Featured */}
          <Field label="Featured">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editing.featured ?? false}
                onChange={e => setEditing(f => ({ ...f, featured: e.target.checked }))}
                className="w-4 h-4 accent-brand-600"/>
              <span className="font-mono text-sm text-slate-600">Show in featured section on homepage</span>
            </label>
          </Field>

          {/* Long description — plain textarea, no Tiptap */}
          <Field label="Detailed Write-up" hint="Shown on the project detail page. Markdown supported.">
            <textarea
              value={editing.longDescription ?? ""}
              onChange={e => setEditing(f => ({ ...f, longDescription: e.target.value }))}
              placeholder={"## Overview\n\nDescribe your project in detail...\n\n## Challenges\n\n## Results"}
              rows={10}
              className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm font-mono text-slate-800 outline-none focus:border-brand-400 bg-white resize-y leading-relaxed"
            />
          </Field>

          {/* Order */}
          <Field label="Display Order" hint="Lower number = appears first">
            <TextInput
              value={String(editing.order ?? 99)}
              onChange={(v: string) => setEditing(e => ({ ...e, order: parseInt(v) || 99 }))}
              placeholder="1"
              className="w-24"
            />
          </Field>

        </div>
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900">Projects</h1>
          <p className="text-slate-500 text-sm mt-1">{projects.length} projects</p>
        </div>
        <button onClick={startNew} className="btn-primary"><Plus size={16}/> Add Project</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-500" size={24}/></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-5xl mb-3">🚀</div>
          <p className="font-mono text-sm mb-4">No projects yet.</p>
          <button onClick={startNew} className="btn-primary">Add your first project</button>
        </div>
      ) : (
        <div className="space-y-2 max-w-3xl">
          {projects.map(p => (
            <div key={p.id} className="card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-xs text-slate-400">{CAT_LABELS[p.category] ?? p.category}</span>
                  {p.featured && <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">featured</span>}
                </div>
                <div className="font-display font-semibold text-slate-900">{p.name}</div>
                <div className="font-mono text-xs text-slate-400 mt-0.5 truncate">
                  {(p.stack ?? []).join(", ")}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(p)} className="p-2 rounded-lg hover:bg-surface-100 text-slate-400 hover:text-brand-600 transition-colors"><Pencil size={15}/></button>
                <button onClick={() => handleDelete(p.id, p.name)} className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={15}/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
