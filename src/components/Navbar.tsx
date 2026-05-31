"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/#projects",    label: "./projects"    },
  { href: "/#skills",      label: "./skills"       },
  { href: "/#timeline",    label: "./timeline"     },
  { href: "/#experiments", label: "./lab"          },
  { href: "/blog",        label: "./blog"         },
  { href: "/#contact",     label: "./contact"      },
];

export default function Navbar({ resumeUrl }: { resumeUrl?: string | null }) {
  const resolvedResumeUrl = resumeUrl ?? "/api/resume";
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-surface-200 shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="container-section flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="font-mono text-sm font-bold text-slate-900 tracking-tight">
          girish<span className="text-brand-500">.</span>m
          <span className="text-slate-400">_</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(l => (
            <li key={l.href}>
              <Link href={l.href} className="nav-link">{l.label}</Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <div className="status-online">
            <span className="status-dot" />
            <span>Available</span>
          </div>
          <a href="/resume" rel="noopener noreferrer" className="btn-primary">
              <Download size={14} /> Resume
            </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-surface-100 transition-colors"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-surface-200 px-6 pb-4">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="block font-mono text-sm py-2.5 text-slate-600 hover:text-brand-600 border-b border-surface-100 last:border-0"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <a href="/resume" rel="noopener noreferrer" className="btn-primary mt-3 w-full justify-center">
              <Download size={14} /> Resume
            </a>
        </div>
      )}
    </header>
  );
}
