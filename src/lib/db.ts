import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, setDoc, Timestamp,
} from "firebase/firestore";
import { db, COLLECTIONS } from "./firebase";
import type { BlogPost, Project, Experiment, TimelineEvent, ResumeFile, SiteConfig } from "@/types";

function makeSlug(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
// ─── BLOGS ────────────────────────────────────────────────────
export async function getPublishedBlogs(): Promise<BlogPost[]> {
  // Fetch all then filter client-side — avoids composite index requirement
  const q = query(collection(db, COLLECTIONS.blogs), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as BlogPost))
    .filter(p => p.status === "published");
}

export async function getAllBlogs(): Promise<BlogPost[]> {
  // No orderBy — avoids index issues on fresh collections
  const snap = await getDocs(collection(db, COLLECTIONS.blogs));
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
  // Sort client-side by createdAt descending
  return docs.sort((a, b) => {
    const aTime = a.createdAt instanceof Date ? a.createdAt.getTime()
      : (a.createdAt as any)?.toDate?.()?.getTime?.() ?? 0;
    const bTime = b.createdAt instanceof Date ? b.createdAt.getTime()
      : (b.createdAt as any)?.toDate?.()?.getTime?.() ?? 0;
    return bTime - aTime;
  });
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const q = query(collection(db, COLLECTIONS.blogs), where("slug", "==", slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as BlogPost;
}

export async function upsertBlog(data: Partial<BlogPost> & { title: string; content: string }, id?: string): Promise<string> {
  const slug = data.slug ||   makeSlug(data.title);
  const words = data.content.replace(/<[^>]+>/g, "").split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(words / 200));

  const payload = {
    ...data,
    slug,
    readingTime,
    updatedAt: serverTimestamp(),
    ...(data.status === "published" && !data.publishedAt ? { publishedAt: serverTimestamp() } : {}),
  };

  if (id) {
    await updateDoc(doc(db, COLLECTIONS.blogs, id), payload);
    return id;
  }
  const ref = await addDoc(collection(db, COLLECTIONS.blogs), {
    ...payload,
    status: data.status ?? "draft",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteBlog(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.blogs, id));
}

// ─── PROJECTS ─────────────────────────────────────────────────
export async function getProjects(featuredOnly = false): Promise<Project[]> {
  const constraints = featuredOnly
    ? [where("featured", "==", true), orderBy("order", "asc")]
    : [orderBy("order", "asc")];
  const q = query(collection(db, COLLECTIONS.projects), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Project));
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const q = query(collection(db, COLLECTIONS.projects), where("slug", "==", slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Project;
}

export async function upsertProject(data: Partial<Project> & { name: string }, id?: string): Promise<string> {
  const slug = data.slug || makeSlug(data.name);
  const payload = { ...data, slug, updatedAt: serverTimestamp() };
  if (id) {
    await updateDoc(doc(db, COLLECTIONS.projects, id), payload);
    return id;
  }
  const ref = await addDoc(collection(db, COLLECTIONS.projects), {
    ...payload,
    createdAt: serverTimestamp(),
    featured: data.featured ?? false,
    order: data.order ?? 99,
  });
  return ref.id;
}

export async function deleteProject(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.projects, id));
}

// ─── EXPERIMENTS ──────────────────────────────────────────────
export async function getExperiments(): Promise<Experiment[]> {
  const q = query(collection(db, COLLECTIONS.experiments), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Experiment));
}

export async function upsertExperiment(data: Partial<Experiment>, id?: string): Promise<string> {
  const payload = { ...data, updatedAt: serverTimestamp() };
  if (id) {
    await updateDoc(doc(db, COLLECTIONS.experiments, id), payload);
    return id;
  }
  const ref = await addDoc(collection(db, COLLECTIONS.experiments), {
    ...payload,
    createdAt: serverTimestamp(),
    order: data.order ?? 99,
  });
  return ref.id;
}

export async function deleteExperiment(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.experiments, id));
}

// ─── TIMELINE ─────────────────────────────────────────────────
export async function getTimeline(): Promise<TimelineEvent[]> {
  const q = query(collection(db, COLLECTIONS.timeline), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as TimelineEvent));
}

// ─── RESUME ───────────────────────────────────────────────────
export async function getActiveResume(): Promise<ResumeFile | null> {
  const q = query(collection(db, COLLECTIONS.resume), where("active", "==", true), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as ResumeFile;
}

export async function getAllResumes(): Promise<ResumeFile[]> {
  const q = query(collection(db, COLLECTIONS.resume), orderBy("uploadedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ResumeFile));
}

export async function setActiveResume(id: string, allIds: string[]) {
  const batch = allIds.map(rid =>
    updateDoc(doc(db, COLLECTIONS.resume, rid), { active: rid === id })
  );
  await Promise.all(batch);
}

// ─── SITE CONFIG ──────────────────────────────────────────────
export async function getSiteConfig(): Promise<SiteConfig | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.config, "main"));
  if (!snap.exists()) return null;
  return snap.data() as SiteConfig;
}

export async function updateSiteConfig(data: Partial<SiteConfig>) {
  await setDoc(doc(db, COLLECTIONS.config, "main"), data, { merge: true });
}

import type { SkillNode } from "@/types";

export async function getSkills(): Promise<SkillNode[]> {
  const q = query(collection(db, "skills"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SkillNode));
}

export async function upsertSkill(data: Partial<SkillNode>, id?: string): Promise<string> {
  if (id) {
    await updateDoc(doc(db, "skills", id), data);
    return id;
  }
  const ref = await addDoc(collection(db, "skills"), { ...data, order: data.order ?? 99 });
  return ref.id;
}

export async function deleteSkill(id: string) {
  await deleteDoc(doc(db, "skills", id));
}

export async function upsertTimelineEvent(data: Partial<TimelineEvent>, id?: string): Promise<string> {
  if (id) {
    await updateDoc(doc(db, COLLECTIONS.timeline, id), data);
    return id;
  }
  const ref = await addDoc(collection(db, COLLECTIONS.timeline), { ...data, order: data.order ?? 99 });
  return ref.id;
}

export async function deleteTimelineEvent(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.timeline, id));
}