import { notFound } from "next/navigation";
import { getProjectBySlug, getProjects } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectDemo from "@/components/ProjectDemo";
import { CAT_LABELS, CAT_COLORS, cn, formatDate } from "@/lib/utils";
import { Github, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const projects = await getProjects().catch(() => []);
  return projects.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug).catch(() => null);
  if (!project) return { title: "Project Not Found" };
  return {
    title: project.name,
    description: project.description,
    openGraph: { title: project.name, description: project.description, images: project.coverImage ? [project.coverImage] : [] },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug).catch(() => null);
  if (!project) notFound();
  const cat = CAT_COLORS[project.category] ?? CAT_COLORS.ai;

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-surface-50">
        {/* Hero banner */}
        <div className="bg-white border-b border-surface-200">
          <div className="container-section py-12">
            <Link href="/#projects" className="inline-flex items-center gap-1.5 font-mono text-sm text-slate-500 hover:text-brand-600 mb-6 transition-colors">
              <ArrowLeft size={14} /> Back to projects
            </Link>

            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex-1 min-w-[280px]">
                <span className={cn("chip border mb-3 inline-block", cat.bg, cat.text, cat.border)}>
                  {CAT_LABELS[project.category]}
                </span>
                <h1 className="font-display font-extrabold text-4xl md:text-5xl text-slate-900 tracking-tight mb-3">
                  {project.name}
                </h1>
                <p className="text-lg text-slate-600 max-w-xl">{project.description}</p>

                {/* Stack */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.stack.map(s => <span key={s} className="chip">{s}</span>)}
                </div>
              </div>

              {/* Metrics + links */}
              <div className="flex flex-col gap-4">
                {project.metrics?.length > 0 && (
                  <div className="flex gap-6">
                    {project.metrics.map((m, i) => (
                      <div key={i} className="text-center">
                        <div className="font-mono font-bold text-2xl text-slate-900">{m.val}</div>
                        <div className="font-mono text-xs text-slate-400 uppercase tracking-wide">{m.label}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                      <Github size={15} /> GitHub
                    </a>
                  )}
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                      <ExternalLink size={15} /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo / Media */}
        {(project.demoVideo || project.images?.length) && (
          <div className="container-section py-10">
            <ProjectDemo project={project} />
          </div>
        )}

        {/* Body content */}
        <div className="container-section py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              {project.longDescription && (
                <div
                  className="prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: project.longDescription }}
                />
              )}

              {project.challenges && (
                <div className="mt-10">
                  <h2 className="font-display font-bold text-2xl text-slate-900 mb-3">Challenges</h2>
                  <div className="prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: project.challenges }} />
                </div>
              )}

              {project.outcomes && (
                <div className="mt-10">
                  <h2 className="font-display font-bold text-2xl text-slate-900 mb-3">Outcomes</h2>
                  <div className="prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: project.outcomes }} />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="card p-5">
                <h3 className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.stack.map(s => <span key={s} className="chip">{s}</span>)}
                </div>
              </div>

              {project.architectureDiagram && (
                <div className="card p-5">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-3">Architecture</h3>
                  <img src={project.architectureDiagram} alt="Architecture diagram" className="w-full rounded-lg" />
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
