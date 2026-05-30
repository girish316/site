"use client";
import { useState } from "react";
import type { Project } from "@/types";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProjectDemo({ project }: { project: Project }) {
  const [imgIdx, setImgIdx] = useState(0);
  const images = project.images ?? [];

  if (project.demoVideo) {
    // YouTube embed
    if (project.demoType === "youtube") {
      const videoId = project.demoVideo.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
      return (
        <div className="rounded-2xl overflow-hidden border border-surface-200 shadow-sm bg-black aspect-video">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?rel=0`}
            title={`${project.name} demo`}
            allowFullScreen
          />
        </div>
      );
    }

    // Firebase Storage video
    if (project.demoType === "video") {
      return (
        <div className="rounded-2xl overflow-hidden border border-surface-200 shadow-sm bg-slate-900 aspect-video">
          <video
            src={project.demoVideo}
            controls
            className="w-full h-full object-contain"
            poster={project.coverImage}
          />
        </div>
      );
    }

    // iFrame embed
    if (project.demoType === "iframe") {
      return (
        <div className="rounded-2xl overflow-hidden border border-surface-200 shadow-sm aspect-video">
          <iframe src={project.demoVideo} className="w-full h-full" title={`${project.name} demo`} />
        </div>
      );
    }
  }

  // Image gallery
  if (images.length > 0) {
    return (
      <div className="space-y-3">
        <div className="relative rounded-2xl overflow-hidden border border-surface-200 shadow-sm bg-surface-100 aspect-video">
          <img src={images[imgIdx]} alt={`${project.name} screenshot ${imgIdx+1}`} className="w-full h-full object-cover" />
          {images.length > 1 && (
            <>
              <button onClick={() => setImgIdx(i => (i-1+images.length)%images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setImgIdx(i => (i+1)%images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors">
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button key={i} onClick={() => setImgIdx(i)}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${imgIdx===i ? "border-brand-500" : "border-transparent"}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
