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
  Upload,
  Bookmark,
  AlertCircle,
  FolderPlus,
  History,
  Award,
  Play,
  Activity,
  BarChart3,
  Bell,
  Download,
  ShieldAlert,
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
    // PHASE 5: ADVANCED ANALYTICS, REVISIONS & ASSISTANT
    {
      name: "Performance Analytics",
      href: "/student/analytics",
      icon: BarChart3,
      active: pathname === "/student/analytics",
    },
    {
      name: "AI Study Assistant",
      href: "/student/assistant",
      icon: Sparkles,
      active: pathname === "/student/assistant",
    },
    {
      name: "Spaced Revisions",
      href: "/student/revisions",
      icon: RotateCcw,
      active: pathname === "/student/revisions",
    },
    {
      name: "Preparation Reports",
      href: "/student/reports",
      icon: FileText,
      active: pathname === "/student/reports",
    },
    {
      name: "Notification Center",
      href: "/student/notifications",
      icon: Bell,
      active: pathname.startsWith("/student/notifications"),
    },
    // PHASE 4: ONLINE EXAMINATION & MOCK TEST SYSTEM
    {
      name: "Online Mock Tests",
      href: "/student/exams/online",
      icon: Play,
      active: pathname.startsWith("/student/exams/online") && !pathname.includes("/history"),
    },
    {
      name: "Test Attempts History",
      href: "/student/exams/online/history",
      icon: Award,
      active: pathname === "/student/exams/online/history",
    },
    // PHASE 3: MCQ QUESTION BANK & PRACTICE SYSTEM
    {
      name: "Topic Practice",
      href: "/student/practice/topic",
      icon: CheckSquare,
      active: pathname === "/student/practice/topic",
    },
    {
      name: "Subject Practice",
      href: "/student/practice/subject",
      icon: Layers,
      active: pathname === "/student/practice/subject",
    },
    {
      name: "Exam Practice",
      href: "/student/practice/exam",
      icon: Award,
      active: pathname === "/student/practice/exam",
    },
    {
      name: "PYQ Archive",
      href: "/student/practice/pyq",
      icon: FileQuestion,
      active: pathname === "/student/practice/pyq",
    },
    {
      name: "Saved Bookmarks",
      href: "/student/practice/bookmarks",
      icon: Bookmark,
      active: pathname === "/student/practice/bookmarks",
    },
    {
      name: "Mistake Notebook",
      href: "/student/practice/incorrect",
      icon: AlertCircle,
      active: pathname === "/student/practice/incorrect",
    },
    {
      name: "Private Banks",
      href: "/student/practice/banks",
      icon: FolderPlus,
      active: pathname === "/student/practice/banks",
    },
    {
      name: "Practice History",
      href: "/student/practice/history",
      icon: History,
      active: pathname === "/student/practice/history",
    },
    // PHASE 2 & 1 FOUNDATION
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
      name: "Data Export",
      href: "/student/export",
      icon: Download,
      active: pathname === "/student/export",
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
    // PHASE 5: ADMIN ADVANCED ANALYTICS & AUDIT
    {
      name: "Platform Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      active: pathname === "/admin/analytics",
    },
    {
      name: "Content Quality",
      href: "/admin/questions/quality",
      icon: ShieldAlert,
      active: pathname === "/admin/questions/quality",
    },
    {
      name: "System Audit Logs",
      href: "/admin/audit-logs",
      icon: History,
      active: pathname === "/admin/audit-logs",
    },
    // PHASE 4: ONLINE EXAMINATIONS & CBT TESTS
    {
      name: "Online Mock Tests",
      href: "/admin/exams/manage",
      icon: Play,
      active: pathname.startsWith("/admin/exams/manage") || pathname.startsWith("/admin/exams/create"),
    },
    {
      name: "Monitor Live Attempts",
      href: "/admin/exams/monitor",
      icon: Activity,
      active: pathname === "/admin/exams/monitor",
    },
    // PHASE 3: QUESTION BANK MANAGEMENT
    {
      name: "Question Bank",
      href: "/admin/questions",
      icon: FileQuestion,
      active: pathname === "/admin/questions",
    },
    {
      name: "Bulk Import",
      href: "/admin/questions/import",
      icon: Upload,
      active: pathname === "/admin/questions/import",
    },
    {
      name: "AI MCQ Generator",
      href: "/admin/questions/ai",
      icon: Sparkles,
      active: pathname === "/admin/questions/ai",
    },
    {
      name: "Review Queue",
      href: "/admin/questions/review",
      icon: Clock,
      active: pathname === "/admin/questions/review",
    },
    // PHASE 2 & 1 FOUNDATION
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

      {/* Mobile drawer backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col py-6 px-4">
          <div className="flex items-center justify-between mb-6 px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {role === "admin" ? "Admin Controls" : "Student Portal"}
            </span>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    link.active
                      ? "bg-indigo-50 text-indigo-600 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${link.active ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-100">
          {!isCollapsed && (
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
              {role === "admin" ? "Admin Controls" : "Student Portal"}
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 mx-auto transition"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition group ${
                  link.active
                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title={isCollapsed ? link.name : undefined}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition ${
                    link.active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                {!isCollapsed && <span className="truncate">{link.name}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
