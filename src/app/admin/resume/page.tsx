"use client";
import { useEffect, useState } from "react";
import { getAllResumes, setActiveResume } from "@/lib/db";
import { uploadResume, formatBytes } from "@/lib/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, COLLECTIONS } from "@/lib/firebase";
import type { ResumeFile } from "@/types";
import { useDropzone } from "react-dropzone";
import { FileUp, CheckCircle2, Clock, Loader2, ExternalLink, Star } from "lucide-react";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";

export default function AdminResumePage() {
  const [resumes, setResumes] = useState<ResumeFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => getAllResumes().then(setResumes).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async ([file]) => {
      if (!file) return;
      setUploading(true);
      setProgress(0);
      try {
        const url = await uploadResume(file, pct => setProgress(pct));
        // Save record
        await addDoc(collection(db, COLLECTIONS.resume), {
          url, filename: file.name, size: file.size,
          active: resumes.length === 0, // auto-activate if first upload
          uploadedAt: serverTimestamp(),
        });
        toast.success("Resume uploaded!");
        // If this is the first one, mark active
        const updated = await getAllResumes();
        if (updated.length === 1) {
          await setActiveResume(updated[0].id, [updated[0].id]);
        }
        load();
      } catch { toast.error("Upload failed"); }
      finally { setUploading(false); setProgress(0); }
    }
  });

  async function handleSetActive(id: string) {
    await setActiveResume(id, resumes.map(r => r.id));
    toast.success("Active resume updated — site will update within 60s");
    load();
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-900">Resume</h1>
        <p className="text-slate-500 text-sm mt-1">Upload a PDF — it will appear as a download button on your site. The active version is always served.</p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all mb-6",
          isDragActive ? "border-brand-500 bg-brand-50 scale-[1.01]" : "border-surface-200 hover:border-brand-300 bg-white hover:bg-surface-50"
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-brand-500" size={32} />
            <div className="w-48 h-1.5 bg-surface-200 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <span className="font-mono text-sm text-slate-500">{progress}% uploaded</span>
          </div>
        ) : (
          <>
            <FileUp size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="font-display font-semibold text-slate-700 mb-1">
              {isDragActive ? "Drop your PDF here" : "Drag & drop your resume PDF"}
            </p>
            <p className="font-mono text-xs text-slate-400">or click to browse · PDF only</p>
          </>
        )}
      </div>

      {/* Resume history */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-300" size={24} /></div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-8 text-slate-400 font-mono text-sm">No resumes uploaded yet.</div>
      ) : (
        <div className="space-y-3">
          <h2 className="font-mono text-xs uppercase tracking-widest text-slate-400">Upload History</h2>
          {resumes.map(r => (
            <div key={r.id} className={cn(
              "card p-4 flex items-center gap-4",
              r.active && "border-emerald-200 bg-emerald-50/30"
            )}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {r.active && (
                    <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 size={10} /> Active
                    </span>
                  )}
                <span className="font-mono text-xs text-slate-400">
                  {typeof r.size === "number" ? formatBytes(r.size) : "Unknown size"}
                </span>                </div>
                <div className="font-mono text-sm text-slate-700 truncate">{r.filename}</div>
                <div className="font-mono text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <Clock size={10} /> {formatDate(r.uploadedAt)}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <a href={r.url} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-surface-100 text-slate-400 hover:text-slate-700 transition-colors">
                  <ExternalLink size={15} />
                </a>
                {!r.active && (
                  <button onClick={() => handleSetActive(r.id)}
                    className="btn-secondary text-xs px-3 py-1.5">
                    <Star size={12} /> Set Active
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
