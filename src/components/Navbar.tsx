"use client";

import Link from "next/link";
import { GraduationCap, LogOut, User, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import type { Profile } from "@/lib/types";

interface NavbarProps {
  profile?: Profile | null;
}

export default function Navbar({ profile }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href={
            profile?.role === "admin"
              ? "/admin/dashboard"
              : profile
              ? "/student/dashboard"
              : "/"
          }
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Prep<span className="text-indigo-600">Track</span>
            </span>
            <span className="hidden text-xs font-medium text-slate-500 sm:inline-block ml-2 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
              v1.0
            </span>
          </div>
        </Link>

        {/* User Info / Auth Controls */}
        <div className="flex items-center gap-3">
          {profile ? (
            <div className="flex items-center gap-3">
              {/* Role badge */}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  profile.role === "admin"
                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                    : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                }`}
              >
                {profile.role === "admin" ? (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Admin
                  </>
                ) : (
                  "Student"
                )}
              </span>

              {/* Profile link */}
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                title="View Profile"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-semibold text-xs">
                  {profile.full_name
                    ? profile.full_name.charAt(0).toUpperCase()
                    : profile.email.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline-block text-xs font-semibold text-slate-700 max-w-[140px] truncate">
                  {profile.full_name || profile.email}
                </span>
              </Link>

              {/* Logout button */}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 hover:text-red-600"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition"
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
