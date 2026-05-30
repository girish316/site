"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllBlogs, getProjects, getExperiments } from "@/lib/db";
import { FileText, FolderKanban, FlaskConical, FileUp, Plus, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ blogs: 0, projects: 0, experiments: 0, published: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllBlogs(), getProjects(), getExperiments()])
      .then(([blogs, projects, experiments]) => {
        setCounts({
          blogs: blogs.length,
          projects: projects.length,
          experiments: experiments.length,
          published: blogs.filter(b => b.status === "published").length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Blog Posts",      val: counts.blogs,       sub: `${counts.published} published`,  href: "/admin/blogs",       icon: FileText,      color: "text-violet-600 bg-violet-50 border-violet-100" },
    { label: "Projects",        val: counts.projects,    sub: "in showcase",                     href: "/admin/projects",    icon: FolderKanban,  color: "text-brand-600 bg-brand-50 border-brand-100"   },
    { label: "Experiments",     val: counts.experiments, sub: "in lab",                          href: "/admin/experiments", icon: FlaskConical,  color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  ];

  const quickLinks = [
    { label: "Write New Post",      href: "/admin/blogs/new",       icon: Plus,     color: "btn-primary"    },
    { label: "Add Project",         href: "/admin/projects/new",    icon: Plus,     color: "btn-secondary"  },
    { label: "Update Resume",       href: "/admin/resume",          icon: FileUp,   color: "btn-secondary"  },
  ];

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your portfolio content from here.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {cards.map(c => (
          <Link key={c.label} href={c.href} className="card p-5 hover:-translate-y-0.5">
            <div className={`inline-flex p-2 rounded-lg border mb-3 ${c.color}`}>
              <c.icon size={18} />
            </div>
            <div className="font-mono font-bold text-3xl text-slate-900 mb-0.5">
              {loading ? "—" : c.val}
            </div>
            <div className="font-display font-semibold text-slate-700 text-sm">{c.label}</div>
            <div className="font-mono text-xs text-slate-400 mt-0.5">{c.sub}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card p-6 mb-6">
        <h2 className="font-display font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map(l => (
            <Link key={l.label} href={l.href} className={l.color}>
              <l.icon size={15} /> {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-700 font-mono">
        <strong>Tip:</strong> Changes you save here are reflected on your portfolio within ~60 seconds (Vercel ISR). For instant updates, trigger a redeploy from Vercel.
      </div>
    </div>
  );
}

function FirestoreTest() {
  const [result, setResult] = useState<string>("idle");

  async function runTest() {
    setResult("testing...");
    try {
      // Dynamically import to avoid SSR issues
      const { db } = await import("@/lib/firebase");
      const { collection, addDoc, deleteDoc, serverTimestamp } = await import("firebase/firestore");
      
      // Try writing a test document
      const ref = await addDoc(collection(db, "_test"), {
        ts: serverTimestamp(),
        msg: "connection test"
      });
      
      // Clean it up immediately
      await deleteDoc(ref);
      
      setResult("✅ Firestore is working! Writes succeed.");
    } catch (e: any) {
      setResult(`❌ Error: ${e?.code} — ${e?.message}`);
    }
  }

  return (
    <div>
      <button onClick={runTest} className="btn-secondary text-sm mb-3">Run Firestore Test</button>
      {result !== "idle" && (
        <div className={`font-mono text-xs p-3 rounded-lg border ${
          result.startsWith("✅") 
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : result === "testing..."
            ? "bg-blue-50 border-blue-200 text-blue-700"
            : "bg-rose-50 border-rose-200 text-rose-700"
        }`}>
          {result}
        </div>
      )}
    </div>
  );
}