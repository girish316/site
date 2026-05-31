"use client";
import { useState } from "react";
import { ExternalLink, CheckCircle2, Loader2, Github, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminResumePage() {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  async function testConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/resume", { cache: "no-store" });
      if (res.ok && res.headers.get("content-type")?.includes("pdf")) {
        const size = res.headers.get("content-length");
        setTestResult({ ok: true, msg: `✅ PDF fetched successfully${size ? ` (${Math.round(parseInt(size)/1024)} KB)` : ""}` });
      } else {
        const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        setTestResult({ ok: false, msg: `❌ ${data.error ?? `HTTP ${res.status}`}` });
      }
    } catch (e: any) {
      setTestResult({ ok: false, msg: `❌ ${e?.message}` });
    } finally {
      setTesting(false); }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-900">Resume</h1>
        <p className="text-slate-500 text-sm mt-1">
          Served from your private GitHub repo — always the latest committed PDF.
        </p>
      </div>

      {/* How it works */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Github size={18} className="text-slate-700"/>
          <h2 className="font-display font-semibold text-slate-900">GitHub Private Repo Setup</h2>
        </div>

        <div className="space-y-4">

          {/* Step 1 */}
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <p className="font-semibold text-slate-800 text-sm mb-1">Create a GitHub Personal Access Token</p>
              <p className="font-mono text-xs text-slate-500 mb-2">Needs <code className="bg-surface-100 px-1 rounded">repo</code> scope (read-only is enough).</p>
              <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer"
                className="btn-secondary text-xs inline-flex">
                <ExternalLink size={12}/> github.com/settings/tokens/new
              </a>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <p className="font-semibold text-slate-800 text-sm mb-1">Add these to your <code className="bg-surface-100 px-1 rounded">.env.local</code></p>
              <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs leading-relaxed overflow-x-auto">{`GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_RESUME_OWNER=your-github-username
GITHUB_RESUME_REPO=your-private-repo-name
GITHUB_RESUME_BRANCH=x          # the branch name you mentioned
GITHUB_RESUME_PATH=resume.pdf   # path inside the repo`}</pre>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <p className="font-semibold text-slate-800 text-sm mb-1">Restart dev server</p>
              <pre className="bg-slate-900 text-slate-100 rounded-xl px-4 py-2.5 font-mono text-xs">rm -rf .next && npm run dev</pre>
            </div>
          </div>

          {/* Step 4 — Vercel */}
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <p className="font-semibold text-slate-800 text-sm mb-1">On Vercel — add the same env vars</p>
              <p className="font-mono text-xs text-slate-500">Vercel Dashboard → Your Project → Settings → Environment Variables → add all 5 above.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Test button */}
      <div className="card p-5 mb-6">
        <h2 className="font-display font-semibold text-slate-900 mb-1">Test Connection</h2>
        <p className="font-mono text-xs text-slate-400 mb-4">
          Checks that the env vars are set and the PDF is reachable.
        </p>
        <div className="flex items-center gap-3">
          <button onClick={testConnection} disabled={testing} className="btn-primary">
            {testing ? <Loader2 size={14} className="animate-spin"/> : <Github size={14}/>}
            {testing ? "Fetching PDF..." : "Test Resume Link"}
          </button>
          <a href="/api/resume" target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
            <ExternalLink size={14}/> Open PDF
          </a>
        </div>

        {testResult && (
          <div className={`mt-3 flex items-start gap-2 font-mono text-sm p-3 rounded-xl border ${
            testResult.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-rose-50 border-rose-200 text-rose-700"
          }`}>
            {testResult.ok
              ? <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5"/>
              : <AlertCircle size={15} className="flex-shrink-0 mt-0.5"/>}
            {testResult.msg}
          </div>
        )}
      </div>

      {/* How resume updates */}
      <div className="rounded-xl border border-surface-200 bg-surface-50 p-4 font-mono text-xs text-slate-500 space-y-1.5">
        <p className="font-semibold text-slate-700">How resume updates work</p>
        <p>1. Edit your resume in your private repo and commit to the <code className="bg-white border border-surface-200 px-1 rounded">x</code> branch.</p>
        <p>2. Push to GitHub.</p>
        <p>3. Your portfolio immediately serves the new PDF — no redeploy needed.</p>
        <p>4. The resume URL is always <code className="bg-white border border-surface-200 px-1 rounded">/api/resume</code> — never changes.</p>
      </div>
    </div>
  );
}
