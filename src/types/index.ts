import { Timestamp } from "firebase/firestore";

export type BlogStatus = "draft" | "published";
export type ProjectCategory = "ai" | "robotics" | "systems" | "fullstack" | "hackathon" | "experimental";
export type ExperimentStatus = "active" | "paused" | "shipped" | "abandoned";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;          // HTML from Tiptap or raw markdown
  contentType: "html" | "markdown";
  coverImage?: string;
  tags: string[];
  status: BlogStatus;
  readingTime: number;      // minutes
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  publishedAt?: Timestamp | Date;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  category: ProjectCategory;
  description: string;
  longDescription?: string;  // rich HTML for detail page
  coverImage?: string;
  demoVideo?: string;        // Firebase Storage URL or YouTube embed
  demoType?: "video" | "youtube" | "iframe" | "images";
  images?: string[];
  stack: string[];
  metrics: { val: string; label: string }[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  order: number;
  challenges?: string;
  outcomes?: string;
  architectureDiagram?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface Experiment {
  id: string;
  name: string;
  thought: string;
  status: ExperimentStatus;
  statusLabel: string;
  tags: string[];
  progress: number;
  order: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface TimelineEvent {
  id: string;
  date: string;
  event: string;
  place: string;
  description: string;
  tag: string;
  color: "cyan" | "purple" | "neon" | "pink" | "amber";
  order: number;
}

export interface ResumeFile {
  id: string;
  url?: string;
  filename: string;
  uploadedAt: Timestamp | Date;
  active: boolean;
  size?: number;
}

export interface SiteConfig {
  name: string;
  title: string;
  subtitle: string;
  bio: string;
  location: string;
  email: string;
  github: string;
  linkedin: string;
  status: string;
  roles: string[];
  stats: { val: string; label: string }[];
}

export interface SkillNode {
  id: string;
  label: string;
  cat: "core" | "ai" | "robotics" | "web" | "learning";
  level: number;
  desc: string;
  order: number;
}