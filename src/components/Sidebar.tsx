"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Calendar,
  Users,
  FileQuestion,
  Layers,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Lock,
} from "lucide-react";
import type { UserRole } from "@/lib/types";

interface SidebarProps {
  role: UserRole;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const studentLinks = [
    {
      name: "Dashboard",
      href: "/student/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/student/dashboard",
    },
    {
      name: "Examinations",
      href: "#",
      icon: BookOpen,
      badge: "Phase 2",
      active: false,
    },
    {
      name: "Study Tasks",
      href: "#",
      icon: CheckSquare,
      badge: "Phase 2",
      active: false,
    },
    {
      name: "Exam Schedule",
      href: "#",
      icon: Calendar,
      badge: "Phase 2",
      active: false,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      active: pathname === "/profile",
    },
  ];

  const adminLinks = [
    {
      name: "Platform Overview",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/admin/dashboard",
    },
    {
      name: "Student Directory",
      href: "/admin/dashboard#students",
      icon: Users,
      active: false,
    },
    {
      name: "Content Management",
      href: "#",
      icon: Layers,
      badge: "Phase 2",
      active: false,
    },
    {
      name: "Question Bank",
      href: "#",
      icon: FileQuestion,
      badge: "Phase 2",
      active: false,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      active: pathname === "/profile",
    },
  ];

  const links = role === "admin" ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile toggle button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-300 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white pt-16 transition-all duration-300 lg:static lg:pt-0 ${
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:flex items-center justify-end px-3 py-3 border-b border-slate-100">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 px-3 py-4">
          {links.map((item) => {
            const Icon = item.icon;
            const isClickable = item.href !== "#";

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  if (!isClickable) {
                    e.preventDefault();
                  } else {
                    setIsMobileOpen(false);
                  }
                }}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-indigo-50 text-indigo-700"
                    : isClickable
                    ? "text-slate-700 hover:bg-slate-100"
                    : "text-slate-400 cursor-not-allowed hover:bg-slate-50"
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${
                    item.active
                      ? "text-indigo-600"
                      : isClickable
                      ? "text-slate-500 group-hover:text-slate-700"
                      : "text-slate-300"
                  }`}
                />
                {!isCollapsed && (
                  <span className="flex-1 truncate">{item.name}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 border border-slate-200">
                    <Lock className="h-2.5 w-2.5" />
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer info in sidebar */}
        {!isCollapsed && (
          <div className="border-t border-slate-200 p-4">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/70">
              <p className="text-xs font-semibold text-slate-700">PrepTrack Platform</p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Phase 1: Foundation & Authentication
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
