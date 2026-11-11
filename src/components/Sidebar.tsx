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
  Award,
  Play,
  BarChart3,
  Bell,
  GraduationCap,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { useSidebar } from "@/components/layout/sidebar-context";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarProps {
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

export default function Sidebar({ className }: SidebarProps) {
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

  // PREPTRACK PERSONAL WORKSPACE NAVIGATION
  const sections: NavSection[] = [
    {
      title: "Dashboard",
      items: [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          active: pathname === "/dashboard" || pathname === "/student/dashboard",
        },
      ],
    },
    {
      title: "My Preparation",
      items: [
        {
          name: "My Examinations",
          href: "/examinations",
          icon: BookOpen,
          active: pathname === "/examinations" || pathname === "/student/exams",
        },
        {
          name: "Syllabus Tracker",
          href: "/syllabus",
          icon: Layers,
          active: pathname.startsWith("/syllabus") || pathname.startsWith("/student/syllabus"),
        },
        {
          name: "Daily Routine & Tasks",
          href: "/routine",
          icon: Clock,
          active:
            pathname === "/routine" ||
            pathname.startsWith("/tasks") ||
            pathname === "/student/routine" ||
            pathname.startsWith("/student/tasks"),
        },
        {
          name: "Study Planner",
          href: "/study-planner",
          icon: CalendarDays,
          active: pathname.startsWith("/study-planner") || pathname.startsWith("/student/planner"),
        },
        {
          name: "Calendar & Exam Dates",
          href: "/calendar",
          icon: CalendarIcon,
          active:
            pathname.startsWith("/calendar") ||
            pathname.startsWith("/student/calendar"),
        },
      ],
    },
    {
      title: "Practice & Exams",
      items: [
        {
          name: "MCQ Practice",
          href: "/practice",
          icon: CheckSquare,
          active:
            pathname === "/practice" ||
            pathname.startsWith("/practice/topic") ||
            pathname.startsWith("/practice/subject") ||
            pathname.startsWith("/practice/exam") ||
            pathname.startsWith("/practice/pyq") ||
            pathname.startsWith("/practice/history") ||
            pathname.startsWith("/student/practice"),
        },
        {
          name: "My Question Bank",
          href: "/question-bank",
          icon: FileQuestion,
          active:
            pathname === "/question-bank" ||
            pathname === "/student/questions",
        },
        {
          name: "Bulk Question Import",
          href: "/question-import",
          icon: Upload,
          active:
            pathname.startsWith("/question-import") ||
            pathname.startsWith("/student/questions/import"),
        },
        {
          name: "Create MCQ Examination",
          href: "/online-exams/create",
          icon: FileText,
          active:
            pathname === "/online-exams/create" ||
            pathname === "/student/exams/create",
        },
        {
          name: "My Attempts & Results",
          href: "/attempts",
          icon: Award,
          active:
            pathname.startsWith("/attempts") ||
            pathname.startsWith("/results") ||
            pathname.startsWith("/student/exams/online/history"),
        },
      ],
    },
    {
      title: "AI & Revision",
      items: [
        {
          name: "AI Study Assistant",
          href: "/assistant",
          icon: Sparkles,
          active: pathname.startsWith("/assistant") || pathname.startsWith("/student/assistant"),
          badge: "AI",
        },
        {
          name: "AI Question Generator",
          href: "/question-bank/ai",
          icon: Plus,
          active:
            pathname === "/question-bank/ai" ||
            pathname === "/student/questions/ai",
        },
        {
          name: "Revision Manager",
          href: "/revisions",
          icon: RotateCcw,
          active: pathname.startsWith("/revisions") || pathname.startsWith("/student/revisions"),
        },
      ],
    },
    {
      title: "Progress",
      items: [
        {
          name: "Performance Analytics",
          href: "/analytics",
          icon: BarChart3,
          active: pathname.startsWith("/analytics") || pathname.startsWith("/student/analytics"),
        },
        {
          name: "Bookmarks & Incorrect Questions",
          href: "/practice/bookmarks",
          icon: Bookmark,
          active:
            pathname.startsWith("/practice/bookmarks") ||
            pathname.startsWith("/practice/incorrect") ||
            pathname.startsWith("/student/practice/bookmarks") ||
            pathname.startsWith("/student/practice/incorrect"),
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          name: "Profile & Settings",
          href: "/profile",
          icon: ShieldCheck,
          active: pathname.startsWith("/profile"),
        },
      ],
    },
  ];

  return (
    <>
      {/* ---------------------------------------------------- */}
      {/* Mobile Slide-Over Backdrop Overlay */}
      {/* ---------------------------------------------------- */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-none transition-opacity lg:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* Mobile Slide-Over Navigation Drawer */}
      {/* ---------------------------------------------------- */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-border bg-card transition-transform duration-200 ease-in-out lg:hidden shadow-xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation drawer"
      >
        {/* Mobile Drawer Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4 shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5"
            onClick={closeMobileSidebar}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-gradient text-white shadow-xs">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div className="flex items-baseline">
              <span className="font-heading text-base font-bold text-text-primary">
                Prep<span className="text-primary">Track</span>
              </span>
              <span className="ml-1.5 text-[9px] font-mono font-bold text-primary px-1.5 py-0.2 rounded-full bg-[var(--color-primary-subtle)] border border-primary/20">
                Personal
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-hover-surface hover:text-text-primary transition"
            aria-label="Close navigation drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile Drawer Nav Groups List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-2 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono">
                  {section.title}
                </span>
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileSidebar}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                        item.active
                          ? "bg-[var(--color-primary-subtle)] text-primary font-semibold border-l-2 border-primary"
                          : "text-text-secondary hover:bg-hover-surface hover:text-text-primary"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            item.active ? "text-primary" : "text-text-muted"
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

        {/* Mobile Drawer Footer */}
        <div className="border-t border-border bg-card p-3 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-text-secondary px-1">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span className="leading-tight font-medium truncate">
              Personal Preparation Workspace
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
          isCollapsed ? "w-16" : "w-60",
          className
        )}
        aria-label="Sidebar navigation"
      >
        {/* Sidebar Header / Brand Sub-header */}
        <div className="flex h-12 items-center justify-between border-b border-border px-3.5 shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between w-full overflow-hidden pr-1">
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-primary truncate">
                  Personal Workspace
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold text-primary px-1.5 py-0.5 rounded-full bg-[var(--color-primary-subtle)] border border-primary/20 shrink-0">
                Personal
              </span>
            </div>
          ) : (
            <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-primary-subtle)] text-primary">
              <GraduationCap className="h-4 w-4" />
            </div>
          )}

          {/* Desktop Collapse / Expand Toggle */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-border text-text-muted hover:bg-hover-surface hover:text-text-primary transition shrink-0 cursor-pointer"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Desktop Navigation Groups List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3.5">
          {sections.map((section) => (
            <div key={section.title} className="space-y-0.5">
              {!isCollapsed ? (
                <div className="px-2 pb-1 pt-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono">
                    {section.title}
                  </span>
                </div>
              ) : (
                <div className="my-1.5 border-t border-border/60 mx-1" />
              )}

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.href} content={item.name} side="right">
                        <Link
                          href={item.href}
                          className={cn(
                            "flex h-9 w-9 mx-auto items-center justify-center rounded-lg transition-colors",
                            item.active
                              ? "bg-[var(--color-primary-subtle)] text-primary font-semibold border-l-2 border-primary"
                              : "text-text-secondary hover:bg-hover-surface hover:text-text-primary"
                          )}
                          aria-label={item.name}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4",
                              item.active ? "text-primary" : "text-text-muted"
                            )}
                          />
                        </Link>
                      </Tooltip>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                        item.active
                          ? "bg-[var(--color-primary-subtle)] text-primary font-semibold border-l-2 border-primary"
                          : "text-text-secondary hover:bg-hover-surface hover:text-text-primary"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            item.active ? "text-primary" : "text-text-muted"
                          )}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-[var(--color-primary-subtle)] text-primary border border-primary/20 shrink-0">
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
        <div className="border-t border-border bg-card p-2 shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between text-[10px] text-text-muted px-1.5 py-1">
              <span className="truncate font-mono">Personal Workspace</span>
              <span className="text-[9px] font-mono text-primary font-bold">OWNER</span>
            </div>
          ) : (
            <div className="mx-auto flex h-6 w-6 items-center justify-center text-text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
