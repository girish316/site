"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FileText, FolderKanban, FlaskConical,
  FileUp, LogOut, Settings, Loader2, Brain, Clock, ExternalLink
} from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin",             label: "Dashboard",    icon: LayoutDashboard },
  { href: "/admin/config",      label: "Site Settings",   icon: Settings         },
  { href: "/admin/blogs",       label: "Blog Posts",   icon: FileText        },
  { href: "/admin/projects",    label: "Projects",     icon: FolderKanban    },
  { href: "/admin/skills",      label: "Skills Map",      icon: Brain            },
  { href: "/admin/timeline",    label: "Timeline",        icon: Clock            },
  { href: "/admin/experiments", label: "Experiments",  icon: FlaskConical    },
  { href: "/admin/resume",      label: "Resume",       icon: FileUp          },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, signInWithGoogle, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <Loader2 className="animate-spin text-brand-500" size={28} />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="card p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">🔐</div>
        <h1 className="font-display font-bold text-2xl text-slate-900 mb-2">Admin Access</h1>
        <p className="text-slate-500 text-sm mb-6">Sign in with your Google account to manage content.</p>
        <button onClick={signInWithGoogle} className="btn-primary w-full justify-center">
          Sign in with Google
        </button>
      </div>
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="card p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">🚫</div>
        <h1 className="font-display font-bold text-2xl text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-500 text-sm mb-4">{user.email} is not an admin.</p>
        <button onClick={logout} className="btn-secondary w-full justify-center">Sign out</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-surface-50">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-surface-200 flex flex-col">
        <div className="px-4 py-5 border-b border-surface-100">
          <div className="font-mono text-sm font-bold text-slate-900">
            girish<span className="text-brand-500">.</span>cms
          </div>
          <div className="text-xs text-slate-400 mt-0.5 truncate">{user.email}</div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {ADMIN_NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "admin-nav-link",
                (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)) && "active"
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-surface-100 space-y-0.5">
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-nav-link">
            <ExternalLink size={16} /> View Site
          </a>
          <button onClick={logout} className="admin-nav-link w-full text-left text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
