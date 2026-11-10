"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Calendar as CalendarIcon,
  Users,
  FileQuestion,
  Layers,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Clock,
  Sparkles,
  RotateCcw,
  CalendarDays,
  FileText,
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
      name: "My Examinations",
      href: "/student/exams",
      icon: BookOpen,
      active: pathname === "/student/exams",
    },
    {
      name: "Syllabus Tracker",
      href: "/student/syllabus",
      icon: Layers,
      active: pathname.startsWith("/student/syllabus"),
    },
    {
      name: "Daily Routine",
      href: "/student/routine",
      icon: Clock,
      active: pathname === "/student/routine",
    },
    {
      name: "Study Tasks",
      href: "/student/tasks",
      icon: CheckSquare,
      active: pathname.startsWith("/student/tasks"),
    },
    {
      name: "Study Planner",
      href: "/student/planner",
      icon: Sparkles,
      active: pathname === "/student/planner",
    },
    {
      name: "Calendar",
      href: "/student/calendar",
      icon: CalendarIcon,
      active: pathname === "/student/calendar",
    },
    {
      name: "Exam Schedule",
      href: "/student/schedule",
      icon: CalendarDays,
      active: pathname === "/student/schedule",
    },
    {
      name: "Revisions",
      href: "/student/revisions",
      icon: RotateCcw,
      active: pathname === "/student/revisions",
    },
    {
      name: "Account Profile",
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
      name: "Exam Management",
      href: "/admin/exams",
      icon: BookOpen,
      active: pathname === "/admin/exams",
    },
    {
      name: "Subject Directory",
      href: "/admin/subjects",
      icon: Layers,
      active: pathname === "/admin/subjects",
    },
    {
      name: "Syllabus & Topics",
      href: "/admin/syllabus",
      icon: FileText,
      active: pathname === "/admin/syllabus",
    },
    {
      name: "Official Exam Events",
      href: "/admin/events",
      icon: CalendarDays,
      active: pathname === "/admin/events",
    },
    {
      name: "Account Profile",
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
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {links.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${
                    item.active
                      ? "text-indigo-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                {!isCollapsed && <span className="flex-1 truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer info in sidebar */}
        {!isCollapsed && (
          <div className="border-t border-slate-200 p-4">
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/70 text-xs">
              <p className="font-semibold text-slate-800">PrepTrack v2.0</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Syllabus & Study Management
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
