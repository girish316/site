"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProjects, upsertProject, deleteProject } from "@/lib/db";
import { uploadProjectImage, uploadProjectVideo } from "@/lib/storage";
import type { Project, ProjectCategory } from "@/types";
import { CAT_LABELS, cn } from "@/lib/utils";
import RichEditor from "@/components/admin/RichEditor";
import { useDropzone } from "react-dropzone";
import {
  Plus, Pencil, Trash2, X, Save, Loader2, ImagePlus,
  Video, ChevronDown, ChevronUp, GripVertical, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

const EMPTY: Partial<Project> = {
  name: "", category: "ai", description: "", longDescription: "",
  stack: [], metrics: [], featured: false, order: 99,
  githubUrl: "", liveUrl: "", demoType: "video",
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing]   = useState<Partial<Project> | null>(null);
  const [editId, setEditId]     = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const [imgUpload, setImgUpload] = useState(0);
  const [vidUpload, setVidUpload] = useState(0);

  const load = () => getProjects().then(setProjects).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  function startNew() { setEditing({ ...EMPTY }); setEditId(null); }
  function startEdit(p: Project) { setEditing({ ...p }); setEditId(p.id); }
  function cancel() { setEditing(null); setEditId(null); }

  // Cover image dropzone
  const { getRootProps: imgProps, getInputProps: imgInput } = useDropzone({
    accept: { "image/*": [] }, maxFiles: 1,
    onDrop: async ([file]) => {
      if (!file || !editing) return;
      setImgUpload(1);
      try {
        const url = await uploadProjectImage(file, editId ?? "new", p => setImgUpload(p));
        setEditing(e => ({ ...e, coverImage: url }));
        toast.success("Image uploaded");
      } catch { toast.error("Upload failed"); }
      finally { setImgUpload(0); }
    }
  });

  // Demo video dropzone
  const { getRootProps: vidProps, getInputProps: vidInput } = useDropzone({
    accept: { "video/*": [] }, maxFiles: 1,
    onDrop: async ([file]) => {
      if (!file || !editing) return;
      setVidUpload(1);
      try {
        const url = await uploadProjectVideo(file, editId ?? "new", p => setVidUpload(p));
        setEditing(e => ({ ...e, demoVideo: url, demoType: "video" }));
        toast.success("Video uploaded");
      } catch { toast.error("Upload failed"); }
      finally { setVidUpload(0); }
    }
  });

  async function save() {
    if (!editing?.name?.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    try {
      await upsertProject(editing as any, editId ?? undefined);
      toast.success(editId ? "Project updated" : "Project added!");
      cancel(); load();
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    await deleteProject(id);
    toast.success("Deleted");
    load();
  }

  // Metrics helpers
  const addMetric   = () => setEditing(e => ({ ...e, metrics: [...(e?.metrics??[]), { val: "", label: "" }] }));
  const removeMetric = (i: number) => setEditing(e => ({ ...e, metrics: (e?.metrics??[]).filter((_,j)=>j!==i) }));
  const updateMetric = (i: number, k: "val"|"label", v: string) =>
    setEditing(e => ({ ...e, metrics: (e?.metrics??[]).map((m,j) => j===i ? {...m,[k]:v} : m) }));

  if (editing) return <ProjectEditor
    editing={editing} setEditing={setEditing} editId={editId} saving={saving}
    imgProps={imgProps} imgInput={imgInput} imgUpload={imgUpload}
    vidProps={vidProps} vidInput={vidInput} vidUpload={vidUpload}
    addMetric={addMetric} removeMetric={removeMetric} updateMetric={updateMetric}
    save={save} cancel={cancel}
  />;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900">Projects</h1>
          <p className="text-slate-500 text-sm mt-1">{projects.length} projects</p>
        </div>
        <button onClick={startNew} className="btn-primary"><Plus size={16}/> Add Project</button>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-500" size={24}/></div>
      : projects.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-5xl mb-3">🚀</div>
          <p className="font-mono text-sm">No projects yet.</p>
          <button onClick={startNew} className="btn-primary mt-4">Add your first project</button>
        </div>
      ) : (
        <div className="space-y-2 max-w-3xl">
          {projects.map(p => (
            <div key={p.id} className="card p-4 flex items-center gap-4">
              {p.coverImage && <img src={p.coverImage} alt="" className="w-14 h-10 object-cover rounded-lg flex-shrink-0"/>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-xs text-slate-400">{CAT_LABELS[p.category]}</span>
                  {p.featured && <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">featured</span>}
                </div>
                <div className="font-display font-semibold text-slate-900">{p.name}</div>
                <div className="font-mono text-xs text-slate-400 mt-0.5 truncate">{p.stack.join(", ")}</div>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-xs uppercase tracking-widest text-slate-400 block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, className }: any) {
  return <input value={value??""} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    className={cn("w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-400 bg-white", className)} />;
}

function ProjectEditor({ editing, setEditing, editId, saving, imgProps, imgInput, imgUpload, vidProps, vidInput, vidUpload, addMetric, removeMetric, updateMetric, save, cancel }: any) {
  const [showDemo, setShowDemo] = useState(!!editing.demoVideo);

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

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Project Name">
            <Input value={editing.name} onChange={(v:string)=>setEditing((e:any)=>({...e,name:v}))} placeholder="AutonomNav-ROS2"/>
          </Field>
          <Field label="Category">
            <select value={editing.category??'ai'} onChange={e=>setEditing((f:any)=>({...f,category:e.target.value as ProjectCategory}))}
              className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-400 bg-white">
              {Object.entries(CAT_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Short Description">
          <textarea value={editing.description??""} onChange={e=>setEditing((f:any)=>({...f,description:e.target.value}))}
            placeholder="One-paragraph description shown in project card..."
            rows={3} className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-400 bg-white resize-y"/>
        </Field>

        <Field label="Tech Stack (comma-separated)">
          <Input value={(editing.stack??[]).join(", ")} onChange={(v:string)=>setEditing((f:any)=>({...f,stack:v.split(",").map((s:string)=>s.trim()).filter(Boolean)}))} placeholder="C++, ROS2, Python, PyTorch"/>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="GitHub URL"><Input value={editing.githubUrl} onChange={(v:string)=>setEditing((f:any)=>({...f,githubUrl:v}))} placeholder="https://github.com/..."/></Field>
          <Field label="Live URL"><Input value={editing.liveUrl} onChange={(v:string)=>setEditing((f:any)=>({...f,liveUrl:v}))} placeholder="https://..."/></Field>
        </div>

        {/* Metrics */}
        <Field label="Metrics">
          <div className="space-y-2">
            {(editing.metrics??[]).map((m:any,i:number)=>(
              <div key={i} className="flex gap-2 items-center">
                <Input value={m.val} onChange={(v:string)=>updateMetric(i,"val",v)} placeholder="40×" className="w-24"/>
                <Input value={m.label} onChange={(v:string)=>updateMetric(i,"label",v)} placeholder="Speedup"/>
                <button onClick={()=>removeMetric(i)} className="p-2 text-slate-400 hover:text-rose-500"><X size={14}/></button>
              </div>
            ))}
            <button onClick={addMetric} className="btn-ghost text-xs"><Plus size={12}/> Add Metric</button>
          </div>
        </Field>

        {/* Cover image */}
        <Field label="Cover Image">
          {editing.coverImage ? (
            <div className="relative inline-block">
              <img src={editing.coverImage} alt="" className="h-28 rounded-xl object-cover"/>
              <button onClick={()=>setEditing((f:any)=>({...f,coverImage:""}))} className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center"><X size={10}/></button>
            </div>
          ) : (
            <div {...imgProps()} className="border-2 border-dashed border-surface-200 rounded-xl p-6 text-center cursor-pointer hover:border-brand-300">
              <input {...imgInput()}/>
              {imgUpload > 0 && imgUpload < 100 ? <p className="font-mono text-sm text-brand-500">{imgUpload}%</p>
                : <><ImagePlus size={20} className="mx-auto text-slate-300 mb-1"/><p className="font-mono text-xs text-slate-400">Drop image or click</p></>}
            </div>
          )}
        </Field>

        {/* Demo */}
        <Field label="Demo / Explanation">
          <div className="border border-surface-200 rounded-xl overflow-hidden">
            <button onClick={()=>setShowDemo(v=>!v)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-50 transition-colors">
              <span className="font-mono text-sm text-slate-600">Add video demo or YouTube embed</span>
              {showDemo ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            </button>
            {showDemo && (
              <div className="p-4 border-t border-surface-200 space-y-3">
                <div className="flex gap-2">
                  {(["video","youtube","iframe","images"] as const).map(t=>(
                    <button key={t} onClick={()=>setEditing((f:any)=>({...f,demoType:t}))}
                      className={cn("font-mono text-xs px-3 py-1.5 rounded-lg border transition-colors",
                        editing.demoType===t ? "bg-brand-600 text-white border-brand-600" : "border-surface-200 text-slate-500 hover:border-brand-300")}>
                      {t}
                    </button>
                  ))}
                </div>

                {editing.demoType === "video" && (
                  <>
                    {editing.demoVideo ? (
                      <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <Video size={16} className="text-emerald-600"/>
                        <span className="font-mono text-xs text-emerald-700 flex-1 truncate">{editing.demoVideo}</span>
                        <button onClick={()=>setEditing((f:any)=>({...f,demoVideo:""}))} className="text-slate-400 hover:text-rose-500"><X size={12}/></button>
                      </div>
                    ) : (
                      <div {...vidProps()} className="border-2 border-dashed border-surface-200 rounded-xl p-6 text-center cursor-pointer hover:border-brand-300">
                        <input {...vidInput()}/>
                        {vidUpload > 0 && vidUpload < 100 ? <p className="font-mono text-sm text-brand-500">{vidUpload}%</p>
                          : <><Video size={20} className="mx-auto text-slate-300 mb-1"/><p className="font-mono text-xs text-slate-400">Upload demo video (MP4)</p></>}
                      </div>
                    )}
                  </>
                )}

                {(editing.demoType === "youtube" || editing.demoType === "iframe") && (
                  <Input value={editing.demoVideo} onChange={(v:string)=>setEditing((f:any)=>({...f,demoVideo:v}))}
                    placeholder={editing.demoType==="youtube" ? "https://youtube.com/watch?v=..." : "https://..."}/>
                )}
              </div>
            )}
          </div>
        </Field>

        <Field label="Featured">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={editing.featured??false} onChange={e=>setEditing((f:any)=>({...f,featured:e.target.checked}))}
              className="w-4 h-4 accent-brand-600"/>
            <span className="font-mono text-sm text-slate-600">Show in featured section</span>
          </label>
        </Field>

        <Field label="Detailed Description (shown on project page)">
          <RichEditor
            content={editing.longDescription??""} contentType="html"
            onChange={(v:string)=>setEditing((f:any)=>({...f,longDescription:v}))}
            placeholder="Write a detailed case study about this project..."/>
        </Field>
      </div>
    </div>
  );
}
