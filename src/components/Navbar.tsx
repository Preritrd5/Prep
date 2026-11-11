"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LogOut,
  ShieldCheck,
  Bell,
  Menu,
  ChevronRight,
  User,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import type { Profile } from "@/lib/types";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSidebar } from "@/components/layout/sidebar-context";
import { cn } from "@/lib/utils";

interface NavbarProps {
  profile?: Profile | null;
}

// Route title mapping for breadcrumbs
const routeTitleMap: Record<string, { portal: string; title: string }> = {
  "/student/dashboard": { portal: "Student", title: "Dashboard" },
  "/student/analytics": { portal: "Student", title: "Performance Analytics" },
  "/student/assistant": { portal: "Student", title: "AI Study Assistant" },
  "/student/revisions": { portal: "Student", title: "Spaced Revisions" },
  "/student/reports": { portal: "Student", title: "Preparation Reports" },
  "/student/notifications": { portal: "Student", title: "Notification Center" },
  "/student/notifications/settings": { portal: "Student", title: "Notification Settings" },
  "/student/exams": { portal: "Student", title: "My Examinations" },
  "/student/exams/online": { portal: "Student", title: "Online Mock Tests" },
  "/student/exams/online/history": { portal: "Student", title: "Attempts History" },
  "/student/practice/topic": { portal: "Student", title: "Topic Practice" },
  "/student/practice/subject": { portal: "Student", title: "Subject Practice" },
  "/student/practice/exam": { portal: "Student", title: "Exam Practice" },
  "/student/practice/pyq": { portal: "Student", title: "PYQ Archive" },
  "/student/practice/bookmarks": { portal: "Student", title: "Saved Bookmarks" },
  "/student/practice/incorrect": { portal: "Student", title: "Mistake Notebook" },
  "/student/practice/banks": { portal: "Student", title: "Private Banks" },
  "/student/practice/history": { portal: "Student", title: "Practice History" },
  "/student/syllabus": { portal: "Student", title: "Syllabus Tracker" },
  "/student/routine": { portal: "Student", title: "Daily Routine" },
  "/student/tasks": { portal: "Student", title: "Study Tasks" },
  "/student/planner": { portal: "Student", title: "Study Planner" },
  "/student/calendar": { portal: "Student", title: "Calendar" },
  "/student/export": { portal: "Student", title: "Data Export" },
  "/admin/dashboard": { portal: "Admin", title: "Platform Overview" },
  "/admin/analytics": { portal: "Admin", title: "Platform Analytics" },
  "/admin/audit-logs": { portal: "Admin", title: "System Audit Logs" },
  "/admin/questions/quality": { portal: "Admin", title: "Content Quality" },
  "/admin/exams": { portal: "Admin", title: "Exam Management" },
  "/admin/exams/manage": { portal: "Admin", title: "Mock Tests Management" },
  "/admin/exams/create": { portal: "Admin", title: "Create Mock Test" },
  "/admin/exams/monitor": { portal: "Admin", title: "Live Attempts Monitor" },
  "/admin/questions": { portal: "Admin", title: "Question Bank" },
  "/admin/questions/import": { portal: "Admin", title: "Bulk Import" },
  "/admin/questions/ai": { portal: "Admin", title: "AI MCQ Generator" },
  "/admin/questions/review": { portal: "Admin", title: "Review Queue" },
  "/admin/questions/create": { portal: "Admin", title: "Create Question" },
  "/admin/subjects": { portal: "Admin", title: "Subject Directory" },
  "/admin/syllabus": { portal: "Admin", title: "Syllabus & Topics" },
  "/admin/events": { portal: "Admin", title: "Official Exam Events" },
  "/profile": { portal: "Account", title: "Profile Settings" },
};

export default function Navbar({ profile }: NavbarProps) {
  const pathname = usePathname();
  const { toggleMobileSidebar } = useSidebar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close user dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isDropdownOpen) {
        setIsDropdownOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  // Determine current page title
  const currentRouteInfo =
    routeTitleMap[pathname] ||
    (pathname.startsWith("/student/exams/online/[id]")
      ? { portal: "Student", title: "Exam Instructions" }
      : pathname.startsWith("/student/exams/online/result")
      ? { portal: "Student", title: "Exam Results & Analysis" }
      : pathname.startsWith("/student")
      ? { portal: "Student", title: "Student Portal" }
      : pathname.startsWith("/admin")
      ? { portal: "Admin", title: "Admin Portal" }
      : null);

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : profile?.email
    ? profile.email.charAt(0).toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card transition-colors select-none">
      <div className="flex h-16 w-full items-center justify-between px-3 sm:px-6">
        {/* Left Section: Mobile Toggle & Brand / Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile Sidebar Hamburger Toggle (Shown when authenticated) */}
          {profile && (
            <button
              type="button"
              onClick={toggleMobileSidebar}
              className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg text-text-muted hover:bg-hover-surface hover:text-text-primary transition focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Brand */}
          <Link
            href={
              profile?.role === "admin"
                ? "/admin/dashboard"
                : profile
                ? "/student/dashboard"
                : "/"
            }
            className="flex items-center gap-2.5 transition-opacity hover:opacity-95 shrink-0"
            aria-label="PrepTrack Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-gradient text-white shadow-xs">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex items-baseline">
              <span className="font-heading text-lg font-bold tracking-tight text-text-primary">
                Prep<span className="text-primary">Track</span>
              </span>
              <span className="hidden md:inline-block ml-1.5 text-[10px] font-mono font-semibold text-text-muted px-1.5 py-0.2 rounded-full bg-surface border border-border">
                v1.0
              </span>
            </div>
          </Link>

          {/* Location Breadcrumb (When logged in) */}
          {profile && currentRouteInfo && (
            <div className="hidden md:flex items-center gap-2 pl-3 ml-3 border-l border-border">
              <span className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary font-mono">
                {currentRouteInfo.portal}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-text-muted/60" />
              <span className="text-xs font-semibold text-text-primary truncate max-w-[200px] lg:max-w-xs font-heading">
                {currentRouteInfo.title}
              </span>
            </div>
          )}
        </div>

        {/* Right Section: Controls, Theme Switcher & Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {profile ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notification Center Link for Students */}
              {profile.role === "student" && (
                <Link
                  href="/student/notifications"
                  className={cn(
                    "relative h-9 w-9 flex items-center justify-center rounded-lg text-text-secondary hover:bg-hover-surface hover:text-primary transition focus:outline-none focus:ring-2 focus:ring-primary/20",
                    pathname.startsWith("/student/notifications") &&
                      "bg-[var(--color-primary-subtle)] text-primary font-semibold"
                  )}
                  title="Notification Center"
                  aria-label="Notification Center"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
                </Link>
              )}

              {/* User Account Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  ref={triggerRef}
                  id="user-menu-button"
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="h-10 flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 transition hover:bg-hover-surface focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-xs"
                  aria-label="User account menu"
                  aria-haspopup="menu"
                  aria-expanded={isDropdownOpen}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-primary-subtle)] text-primary font-mono font-bold text-xs border border-primary/20 shrink-0">
                    {initials}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold text-text-primary leading-tight max-w-[120px] truncate">
                      {profile.full_name || profile.email.split("@")[0]}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted capitalize">
                      {profile.role}
                    </span>
                  </div>
                  <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-text-muted" />
                </button>

                {/* Dropdown Menu Content */}
                {isDropdownOpen && (
                  <div
                    role="menu"
                    aria-labelledby="user-menu-button"
                    aria-orientation="vertical"
                    className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border border-border bg-card p-1.5 shadow-lg focus:outline-none animate-in fade-in zoom-in-95 duration-100"
                  >
                    {/* Header info in dropdown */}
                    <div className="px-3 py-2.5 border-b border-border mb-1">
                      <p className="text-xs font-bold text-text-primary truncate font-heading">
                        {profile.full_name || "PrepTrack User"}
                      </p>
                      <p className="text-[11px] text-text-muted truncate mt-0.5">
                        {profile.email}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold ${
                            profile.role === "admin"
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                              : "bg-[var(--color-primary-subtle)] text-primary border border-primary/20"
                          }`}
                        >
                          {profile.role === "admin" ? (
                            <>
                              <ShieldCheck className="h-3 w-3" />
                              Administrator
                            </>
                          ) : (
                            "Student Workspace"
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Navigation shortcuts */}
                    <Link
                      href={
                        profile.role === "admin"
                          ? "/admin/dashboard"
                          : "/student/dashboard"
                      }
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-text-primary hover:bg-hover-surface transition"
                      role="menuitem"
                    >
                      <LayoutDashboard className="h-4 w-4 text-text-muted" />
                      <span>Dashboard Overview</span>
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-text-primary hover:bg-hover-surface transition"
                      role="menuitem"
                    >
                      <User className="h-4 w-4 text-text-muted" />
                      <span>Account Profile</span>
                    </Link>

                    <div className="my-1 border-t border-border" />

                    {/* Logout Option */}
                    <form action={logoutAction} className="w-full">
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-error hover:bg-error-soft transition cursor-pointer"
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4 text-error" />
                        <span>Sign Out</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-text-primary hover:bg-hover-surface transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[var(--color-primary-hover)] transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
