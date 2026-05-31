export default function ResumePage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 bg-slate-800 border-b border-slate-700">
        <a
          href="/"
          className="font-mono text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Back to portfolio
        </a>
        <a
          href="/api/resume"
          download="resume.pdf"
          className="font-mono text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Download PDF
        </a>
      </div>
      <iframe
        src="/api/resume"
        className="flex-1 w-full"
        style={{ minHeight: "calc(100vh - 52px)" }}
        title="Resume"
      />
    </div>
  );
}
