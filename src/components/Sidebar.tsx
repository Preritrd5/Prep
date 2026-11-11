"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Calendar as CalendarIcon,
  FileQuestion,
  Layers,
  User,
  ChevronLeft,
  ChevronRight,
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
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import type { UserRole } from "@/lib/types";
import { useSidebar } from "@/components/layout/sidebar-context";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: UserRole;
  className?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Sidebar({ role, className }: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleSidebar, closeMobileSidebar } =
    useSidebar();

  // Close mobile drawer on route change or Escape key
  useEffect(() => {
    closeMobileSidebar();
  }, [pathname, closeMobileSidebar]);

  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileSidebar();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, closeMobileSidebar]);

  // STUDENT NAVIGATION GROUPS
  const studentSections: NavSection[] = [
    {
      title: "Overview",
      items: [
        {
          name: "Dashboard",
          href: "/student/dashboard",
          icon: LayoutDashboard,
          active: pathname === "/student/dashboard",
        },
        {
          name: "Performance Analytics",
          href: "/student/analytics",
          icon: BarChart3,
          active: pathname === "/student/analytics",
        },
        {
          name: "Preparation Reports",
          href: "/student/reports",
          icon: FileText,
          active: pathname === "/student/reports",
        },
      ],
    },
    {
      title: "AI & Revisions",
      items: [
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
      ],
    },
    {
      title: "Practice & CBT",
      items: [
        {
          name: "Online Mock Tests",
          href: "/student/exams/online",
          icon: Play,
          active:
            pathname.startsWith("/student/exams/online") &&
            !pathname.includes("/history"),
        },
        {
          name: "Test Attempts History",
          href: "/student/exams/online/history",
          icon: Award,
          active: pathname === "/student/exams/online/history",
        },
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
      ],
    },
    {
      title: "Academics & Schedule",
      items: [
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
          icon: CalendarDays,
          active: pathname === "/student/planner",
        },
        {
          name: "Calendar",
          href: "/student/calendar",
          icon: CalendarIcon,
          active: pathname === "/student/calendar",
        },
      ],
    },
    {
      title: "System & Account",
      items: [
        {
          name: "Notification Center",
          href: "/student/notifications",
          icon: Bell,
          active: pathname.startsWith("/student/notifications"),
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
      ],
    },
  ];

  // ADMIN NAVIGATION GROUPS
  const adminSections: NavSection[] = [
    {
      title: "Overview & Intelligence",
      items: [
        {
          name: "Platform Overview",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
          active: pathname === "/admin/dashboard",
        },
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
      ],
    },
    {
      title: "Examinations & CBT Engine",
      items: [
        {
          name: "Online Mock Tests",
          href: "/admin/exams/manage",
          icon: Play,
          active:
            pathname.startsWith("/admin/exams/manage") ||
            pathname.startsWith("/admin/exams/create"),
        },
        {
          name: "Monitor Live Attempts",
          href: "/admin/exams/monitor",
          icon: Activity,
          active: pathname === "/admin/exams/monitor",
        },
        {
          name: "Exam Management",
          href: "/admin/exams",
          icon: BookOpen,
          active: pathname === "/admin/exams",
        },
        {
          name: "Official Exam Events",
          href: "/admin/events",
          icon: CalendarDays,
          active: pathname === "/admin/events",
        },
      ],
    },
    {
      title: "Question Bank Management",
      items: [
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
      ],
    },
    {
      title: "Curriculum & Syllabus",
      items: [
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
      ],
    },
    {
      title: "Account",
      items: [
        {
          name: "Account Profile",
          href: "/profile",
          icon: User,
          active: pathname === "/profile",
        },
      ],
    },
  ];

  const sections = role === "admin" ? adminSections : studentSections;

  return (
    <>
      {/* ---------------------------------------------------- */}
      {/* Mobile Drawer Backdrop */}
      {/* ---------------------------------------------------- */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-200 lg:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* Mobile Slide-in Drawer */}
      {/* ---------------------------------------------------- */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-card border-r border-border shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        {/* Drawer Header with Brand */}
        <div className="flex h-16 items-center justify-between border-b border-border/80 px-4">
          <Link
            href={role === "admin" ? "/admin/dashboard" : "/student/dashboard"}
            onClick={closeMobileSidebar}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/25">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-text-primary">
                Prep<span className="text-primary">Track</span>
              </span>
              <span className="ml-1.5 text-[10px] font-semibold text-text-muted px-1.5 py-0.5 rounded bg-background-secondary border border-border">
                {role === "admin" ? "Admin" : "Student"}
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl p-2 text-text-muted hover:bg-background-secondary hover:text-text-primary transition focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-2 pb-1 pt-1">
                <span className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary font-mono">
                  {section.title}
                </span>
              </div>
              <div className="space-y-0.5 pt-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileSidebar}
                      className={cn(
                        "min-h-[40px] flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                        item.active
                          ? "bg-[var(--color-primary-subtle)] text-primary font-semibold"
                          : "text-text-secondary hover:bg-hover-surface hover:text-text-primary"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            item.active ? "text-primary" : "text-text-muted"
                          )}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--color-primary-subtle)] text-primary border border-primary/20">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Drawer Footer */}
        <div className="border-t border-border bg-card p-3 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-text-secondary px-1">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span className="leading-tight font-medium truncate">
              {role === "admin" ? "Admin Oversight Active" : "Student Preparation Space"}
            </span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Desktop Persistent Sidebar */}
      {/* ---------------------------------------------------- */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-border bg-card shrink-0 transition-all duration-200 ease-in-out sticky top-16 h-[calc(100vh-4rem)] select-none",
          isCollapsed ? "w-20" : "w-64",
          className
        )}
        aria-label="Sidebar navigation"
      >
        {/* Sidebar Header / Brand Sub-header */}
        <div className="flex h-12 items-center justify-between border-b border-border px-3.5 shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-text-muted truncate">
                {role === "admin" ? "Admin Portal" : "Student Portal"}
              </span>
            </div>
          ) : (
            <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-primary-subtle)] text-primary">
              {role === "admin" ? (
                <ShieldCheck className="h-4 w-4" />
              ) : (
                <GraduationCap className="h-4 w-4" />
              )}
            </div>
          )}

          {/* Desktop Collapse / Expand Toggle */}
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              "rounded-lg p-1.5 text-text-muted hover:bg-hover-surface hover:text-text-primary transition focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer",
              isCollapsed && "mx-auto"
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Desktop Navigation Scroll Container */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3.5">
          {sections.map((section, idx) => (
            <div key={section.title} className="space-y-1">
              {/* Section Header or Divider */}
              {!isCollapsed ? (
                <div className="px-2 pb-0.5 pt-1">
                  <span className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary font-mono">
                    {section.title}
                  </span>
                </div>
              ) : (
                idx > 0 && <div className="border-t border-border my-2 mx-1" />
              )}

              {/* Items in Section */}
              <div className="space-y-0.5 pt-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  if (isCollapsed) {
                    return (
                      <Tooltip
                        key={item.href}
                        content={item.name}
                        side="right"
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg transition duration-150 mx-auto",
                            item.active
                              ? "bg-primary text-white shadow-xs"
                              : "text-text-muted hover:bg-hover-surface hover:text-text-primary"
                          )}
                          aria-label={item.name}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                        </Link>
                      </Tooltip>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors select-none",
                        item.active
                          ? "bg-[var(--color-primary-subtle)] text-primary font-semibold"
                          : "text-text-secondary hover:bg-hover-surface hover:text-text-primary"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            item.active
                              ? "text-primary"
                              : "text-text-muted group-hover:text-text-primary"
                          )}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-[var(--color-primary-subtle)] text-primary border border-primary/20">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Sidebar Footer */}
        {!isCollapsed && (
          <div className="border-t border-border bg-card p-3 shrink-0">
            <div className="flex items-center gap-2 text-[11px] text-text-secondary px-1">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              <span className="leading-tight font-medium truncate">
                {role === "admin" ? "Admin Oversight Active" : "Student Preparation Space"}
              </span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
