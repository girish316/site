"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllBlogs, deleteBlog, upsertBlog } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/types";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

function safeDate(val: any): string {
  try {
    if (!val) return "";
    const d = typeof val.toDate === "function" ? val.toDate() : new Date(val);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return ""; }
}

function safeTags(val: any): string {
  if (!val || !Array.isArray(val)) return "";
  return val.join(", ");
}

export default function AdminBlogsPage() {
  const [posts, setPosts]   = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllBlogs();
      console.log("[admin blogs] loaded:", data.length, "posts", data);
      setPosts(data);
    } catch (e: any) {
      console.error("[admin blogs] load error:", e);
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteBlog(id);
      toast.success("Deleted");
      load();
    } catch (e: any) {
      toast.error(`Delete failed: ${e?.message}`);
    }
  }

  async function togglePublish(post: BlogPost) {
    const newStatus = post.status === "published" ? "draft" : "published";
    try {
      await upsertBlog({ ...post, status: newStatus } as any, post.id);
      toast.success(newStatus === "published" ? "Published!" : "Moved to draft");
      load();
    } catch (e: any) {
      toast.error(`Failed: ${e?.message}`);
    }
  }

  const published = posts.filter(p => p.status === "published").length;
  const drafts    = posts.filter(p => p.status === "draft").length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900">Blog Posts</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? "Loading..." : `${published} published · ${drafts} drafts · ${posts.length} total`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost text-sm" title="Refresh">
            <RefreshCw size={15} />
          </button>
          <Link href="/admin/blogs/new" className="btn-primary">
            <Plus size={16} /> New Post
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl font-mono text-sm text-rose-700">
          <strong>Load error:</strong> {error}
          <button onClick={load} className="ml-3 underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand-500" size={24} />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-5xl mb-4">✍️</div>
          <p className="font-mono text-sm mb-2">No posts found in Firestore.</p>
          <p className="font-mono text-xs text-slate-300 mb-4">
            If you saved posts and don't see them, check the browser console for errors.
          </p>
          <Link href="/admin/blogs/new" className="btn-primary inline-flex">
            Write your first post
          </Link>
        </div>
      ) : (
        <div className="space-y-2 max-w-3xl">
          {posts.map(post => (
            <div key={post.id} className="card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "font-mono text-xs px-2 py-0.5 rounded-full border",
                    post.status === "published"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  )}>
                    {post.status ?? "draft"}
                  </span>
                  {post.readingTime && (
                    <span className="font-mono text-xs text-slate-400">{post.readingTime} min read</span>
                  )}
                </div>
                <div className="font-display font-semibold text-slate-900 truncate">
                  {post.title ?? "(untitled)"}
                </div>
                <div className="font-mono text-xs text-slate-400 mt-0.5 flex gap-2">
                  <span>{safeDate(post.updatedAt ?? post.createdAt)}</span>
                  {safeTags(post.tags) && <span>· {safeTags(post.tags)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => togglePublish(post)}
                  className="p-2 rounded-lg hover:bg-surface-100 text-slate-400 hover:text-slate-700 transition-colors"
                  title={post.status === "published" ? "Unpublish" : "Publish"}
                >
                  {post.status === "published" ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <Link
                  href={`/admin/blogs/${post.id}`}
                  className="p-2 rounded-lg hover:bg-surface-100 text-slate-400 hover:text-brand-600 transition-colors"
                >
                  <Pencil size={15} />
                </Link>
                <button
                  onClick={() => handleDelete(post.id, post.title)}
                  className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
