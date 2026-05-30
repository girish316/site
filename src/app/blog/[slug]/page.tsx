import { notFound } from "next/navigation";
import { getBlogBySlug, getPublishedBlogs } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatDate, cn } from "@/lib/utils";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPublishedBlogs().catch(() => []);
  return posts.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug).catch(() => null);  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: post.coverImage ? [post.coverImage] : [] },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug).catch(() => null);
  if (!post || post.status !== "published") notFound();

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-white">
        {/* Cover image */}
        {post.coverImage && (
          <div className="h-72 md:h-96 overflow-hidden bg-surface-100">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="container-section py-12 max-w-3xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-1.5 font-mono text-sm text-slate-500 hover:text-brand-600 mb-8 transition-colors">
            <ArrowLeft size={14} /> All Posts
          </Link>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(t => (
              <span key={t} className="font-mono text-xs px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 border border-brand-100">{t}</span>
            ))}
          </div>

          <h1 className="font-display font-extrabold text-4xl md:text-5xl text-slate-900 leading-tight tracking-tight mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 font-mono text-sm text-slate-400 mb-10 pb-8 border-b border-surface-200">
            <span className="flex items-center gap-1.5"><Calendar size={13} />{formatDate(post.publishedAt ?? post.createdAt)}</span>
            <span className="flex items-center gap-1.5"><Clock size={13} />{post.readingTime} min read</span>
          </div>

          {/* Content */}
          <article className="prose prose-slate prose-lg max-w-none">
            {post.contentType === "markdown" ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            )}
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
