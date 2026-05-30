"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { upsertBlog, getAllBlogs } from "@/lib/db";
import RichEditor from "@/components/admin/RichEditor";
import type { BlogPost, BlogStatus } from "@/types";
import { Save, Eye, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Props { params: Promise<{ id: string }> }

function parseTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap(tag => String(tag).split(","))
      .map(tag => tag.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeStatus(value: unknown): BlogStatus {
  return value === "published" ? "published" : "draft";
}

export default function BlogEditorPage({ params }: Props) {
  const { id: paramId } = use(params);
  const isNew = paramId === "new";
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [tagsText, setTagsText] = useState("");
  const [form, setForm] = useState<Partial<BlogPost>>({
    title: "", excerpt: "", content: "", contentType: "html",
    tags: [], status: "draft", coverImage: "",
  });

  useEffect(() => {
    if (!isNew) {
      getAllBlogs().then(posts => {
        const post = posts.find(p => p.id === paramId);
        if (post) {
          const normalizedPost = {
            ...post,
            tags: parseTags(post.tags),
            status: normalizeStatus(post.status),
          };
          setForm(normalizedPost);
          setTagsText(normalizedPost.tags.join(", "));
        }
      });
    }
  }, [paramId, isNew]);

  async function save(status?: BlogStatus) {
    if (!form.title?.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const id = await upsertBlog(
        {
          ...(form as any),
          tags: parseTags(tagsText),
          status: status ?? normalizeStatus(form.status),
        },
        isNew ? undefined : paramId
      );
      toast.success(status === "published" ? "Published!" : "Saved as draft");
      if (isNew) router.replace(`/admin/blogs/${id}`);
    } catch (e: any) {
      console.error("Blog save error:", e);
      toast.error(`Save failed: ${e?.message ?? "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-surface-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/admin/blogs" className="btn-ghost p-2">
            <ArrowLeft size={16} />
          </Link>
          <span className="font-mono text-xs text-slate-400 bg-surface-100 px-2 py-1 rounded">
            {form.status === "published" ? "🟢 Published" : "🟡 Draft"}
          </span>
          <input
            value={form.title ?? ""}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Post title..."
            className="font-display font-semibold text-lg text-slate-900 bg-transparent outline-none border-none w-72 placeholder:text-slate-300"
          />
        </div>
        <div className="flex items-center gap-2">
          {form.status === "published" && (
            <Link href={`/blog/${form.slug ?? ""}`} target="_blank" className="btn-ghost text-xs">
              <Eye size={14} /> Preview
            </Link>
          )}
          <button onClick={() => save("draft")} disabled={saving} className="btn-secondary text-sm">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Draft
          </button>
          <button onClick={() => save("published")} disabled={saving} className="btn-primary text-sm">
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            {form.status === "published" ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto space-y-4">
            <textarea
              value={form.excerpt ?? ""}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              placeholder="Short excerpt (shown in blog list & SEO)..."
              rows={2}
              className="w-full text-slate-600 text-base bg-transparent outline-none resize-none border border-dashed border-surface-200 rounded-xl p-4 placeholder:text-slate-300 focus:border-brand-300"
            />
            <RichEditor
              content={form.content ?? ""}
              contentType={form.contentType ?? "html"}
              onChange={(content, type) => setForm(f => ({ ...f, content, contentType: type }))}
              placeholder="Write something brilliant..."
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 bg-white border-l border-surface-200 overflow-y-auto p-4 space-y-5">
          <div>
            <label className="font-mono text-xs uppercase tracking-widest text-slate-400 block mb-2">Tags</label>
            <input
              value={tagsText}
              onChange={e => setTagsText(e.target.value)}
              placeholder="robotics, ai, systems"
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-700 outline-none focus:border-brand-300 bg-white"
            />
            <p className="font-mono text-xs text-slate-400 mt-1">Comma-separated</p>
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-widest text-slate-400 block mb-2">Slug</label>
            <input
              value={form.slug ?? ""}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="auto-generated from title"
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-700 outline-none focus:border-brand-300 bg-white"
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-widest text-slate-400 block mb-2">Status</label>
            <select
              value={form.status ?? "draft"}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as BlogStatus }))}
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-700 outline-none focus:border-brand-300 bg-white"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </aside>
      </div>
    </div>
  );
}