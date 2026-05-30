"use client";
import { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { upsertBlog } from "@/lib/db";
import type { BlogStatus } from "@/types";
import { Save, ArrowLeft, Loader2, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewBlogPage() {
  const router = useRouter();
  const [saving, setSaving]   = useState(false);
  const [title, setTitle]     = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags]       = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [slug, setSlug]       = useState("");

  // Add a tag when user presses Enter, comma, or Tab
  function handleTagKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault();
      addTag();
    }
  }

  function addTag() {
    const val = tagInput.trim().replace(/,/g, "");
    if (val && !tags.includes(val)) {
      setTags(prev => [...prev, val]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag));
  }

  async function save(status: BlogStatus) {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);

    // Flush any pending tag still in the input
    const finalTags = tagInput.trim()
      ? [...tags, tagInput.trim().replace(/,/g, "")]
      : tags;

    const payload = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content,
      contentType: "markdown" as const,
      tags: finalTags,
      slug: slug.trim() || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      status,
    };

    console.log("[blog save] payload:", payload);
    try {
      const id = await upsertBlog(payload);
      console.log("[blog save] success id:", id);
      toast.success(status === "published" ? "✅ Published!" : "✅ Draft saved!");
      router.replace(`/admin/blogs/${id}`);
    } catch (e: any) {
      console.error("[blog save] error:", e);
      toast.error(`Save failed: ${e?.code ?? ""} ${e?.message ?? String(e)}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-surface-200 flex-shrink-0 gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link href="/admin/blogs" className="btn-ghost p-2 flex-shrink-0">
            <ArrowLeft size={16} />
          </Link>
          <span className="font-mono text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-1 rounded flex-shrink-0">
            🟡 New Draft
          </span>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Post title..."
            className="font-display font-semibold text-lg text-slate-900 bg-transparent outline-none border-none flex-1 min-w-0 placeholder:text-slate-300"
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => save("draft")} disabled={saving} className="btn-secondary text-sm">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Draft
          </button>
          <button onClick={() => save("published")} disabled={saving} className="btn-primary text-sm">
            {saving ? <Loader2 size={14} className="animate-spin" /> : null} Publish
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 bg-surface-50">
          <div className="max-w-3xl mx-auto space-y-4">
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="Short excerpt shown in blog list..."
              rows={2}
              className="w-full text-slate-600 bg-white outline-none resize-none border border-dashed border-surface-200 rounded-xl p-4 placeholder:text-slate-300 focus:border-brand-300"
            />
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-2 bg-surface-50 border-b border-surface-100">
                <span className="font-mono text-xs text-slate-400">Markdown</span>
                <span className="font-mono text-xs text-slate-300">
                  **bold** · *italic* · ## heading · - list · `code`
                </span>
              </div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={"Write your post here...\n\n## Introduction\n\nYour content..."}
                className="w-full min-h-[500px] p-6 font-mono text-sm text-slate-800 outline-none resize-y bg-white leading-relaxed placeholder:text-slate-300"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 bg-white border-l border-surface-200 overflow-y-auto p-4 space-y-5">

          {/* Tags — chip input */}
          <div>
            <label className="font-mono text-xs uppercase tracking-widest text-slate-400 block mb-1.5">
              Tags
            </label>

            {/* Existing chips */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-rose-500 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Input */}
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKey}
              onBlur={addTag}
              placeholder="Type tag then press Enter"
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-brand-300 bg-white"
            />
            <p className="font-mono text-xs text-slate-400 mt-1">
              Press <kbd className="bg-surface-100 border border-surface-200 px-1 rounded text-xs">Enter</kbd> or <kbd className="bg-surface-100 border border-surface-200 px-1 rounded text-xs">,</kbd> to add
            </p>
          </div>

          {/* Slug */}
          <div>
            <label className="font-mono text-xs uppercase tracking-widest text-slate-400 block mb-1.5">
              Slug
            </label>
            <input
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="auto-generated from title"
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-brand-300 bg-white"
            />
            <p className="font-mono text-xs text-slate-400 mt-1">Leave blank to auto-generate</p>
            {title && !slug && (
              <p className="font-mono text-xs text-brand-500 mt-0.5">
                → {title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}
              </p>
            )}
          </div>

          {/* Cheatsheet */}
          <div className="rounded-xl border border-surface-200 p-3 space-y-1.5">
            <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-2">Markdown</p>
            {[
              ["## Heading 2", "H2"],
              ["### Heading 3", "H3"],
              ["**bold**", "Bold"],
              ["*italic*", "Italic"],
              ["- item", "List"],
              ["`code`", "Inline code"],
              ["```\\nblock\\n```", "Code block"],
              ["> text", "Blockquote"],
              ["[text](url)", "Link"],
              ["---", "Divider"],
            ].map(([syntax, label]) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-slate-500">{label}</span>
                <span className="font-mono text-xs text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded truncate">{syntax}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
