import Link from "next/link";
import type { BlogPost } from "@/types";
import { formatDate } from "@/lib/utils";
import { ArrowRight, Clock } from "lucide-react";

export default function BlogPreviewSection({ posts }: { posts: BlogPost[] }) {
  // Remove the "if (posts.length === 0) return null;" line entirely
  return (
    <section id="blog" className="py-28 bg-white">
      <div className="container-section">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="section-eyebrow">05 — Writing</p>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-slate-900 tracking-tight">
              Blog<span className="text-brand-500">.</span>
            </h2>
          </div>
          <Link href="/blog" className="btn-ghost font-mono text-sm">
            All posts <ArrowRight size={14}/>
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-surface-200 rounded-2xl text-slate-400">
            <p className="font-mono text-sm">No posts yet — write your first one in the</p>
            <Link href="/admin/blogs/new" className="btn-primary mt-3 inline-flex">
              Admin → Blog Posts
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group card p-6 hover:-translate-y-1">
                {post.coverImage && (
                  <div className="h-36 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-2xl bg-surface-100">
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {post.tags.slice(0,2).map(t => (
                    <span key={t} className="font-mono text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-100">{t}</span>
                  ))}
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-brand-600 transition-colors mb-2 line-clamp-2">{post.title}</h3>
                <p className="font-mono text-xs text-slate-400 flex items-center gap-3">
                  <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
                  <span className="flex items-center gap-1"><Clock size={10}/>{post.readingTime}m</span>
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}