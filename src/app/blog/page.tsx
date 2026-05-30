import { getPublishedBlogs } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Blog", description: "Thoughts on software, robotics, AI, and building things." };
export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getPublishedBlogs().catch(() => []);

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 min-h-screen bg-surface-50">
        <div className="container-section">
          <div className="mb-12">
            <p className="section-eyebrow">Writing</p>
            <h1 className="font-display font-extrabold text-5xl text-slate-900 tracking-tight">Blog<span className="text-brand-500">.</span></h1>
            <p className="mt-3 text-slate-500 max-w-md">Thoughts on software, robotics, AI, and building things that barely work.</p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-mono text-sm">No posts yet.</div>
          ) : (
            <div className="grid gap-6 max-w-3xl">
              {posts.map(post => (
                <Link key={post.id} href={`/blog/${post.slug}`}
                  className="group card p-6 hover:-translate-y-0.5">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {post.tags.slice(0,3).map(t => (
                      <span key={t} className="font-mono text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-100">{t}</span>
                    ))}
                    <span className="font-mono text-xs text-slate-400 ml-auto">{post.readingTime} min read</span>
                  </div>
                  <h2 className="font-display font-bold text-2xl text-slate-900 group-hover:text-brand-600 transition-colors mb-2">{post.title}</h2>
                  <p className="text-slate-500 leading-relaxed mb-3 line-clamp-2">{post.excerpt}</p>
                  <span className="font-mono text-xs text-slate-400">{formatDate(post.publishedAt ?? post.createdAt)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
