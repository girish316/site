import Navbar from "@/components/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import SkillsSection from "@/components/sections/SkillsSection";
import TimelineSection from "@/components/sections/TimelineSection";
import ExperimentsSection from "@/components/sections/ExperimentsSection";
import BlogPreviewSection from "@/components/sections/BlogPreviewSection";
import ContactSection from "@/components/sections/ContactSection";
import Footer from "@/components/Footer";
import { getProjects, getTimeline, getExperiments, getSiteConfig, getPublishedBlogs, getActiveResume } from "@/lib/db";
import { serialize } from "@/lib/utils";

export const revalidate = 60;

export default async function Home() {
  const [projects, timeline, experiments, config, blogs, resume] = await Promise.all([
    getProjects().catch(() => []),
    getTimeline().catch(() => []),
    getExperiments().catch(() => []),
    getSiteConfig().catch(() => null),
    getPublishedBlogs().catch(() => []),
    getActiveResume().catch(() => null),
  ]);

  return (
    <>
      <Navbar resumeUrl={resume?.url} />
      <main>
        <HeroSection config={serialize(config)} />
        <ProjectsSection projects={serialize(projects)} />
        <SkillsSection />
        <TimelineSection events={serialize(timeline)} />
        <ExperimentsSection experiments={serialize(experiments)} />
        <BlogPreviewSection posts={serialize(blogs.slice(0, 3))} />
        <ContactSection config={serialize(config)} resumeUrl={resume?.url} />
      </main>
      <Footer config={serialize(config)} />
    </>
  );
}