import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookMarked,
  BarChart3,
  Lock,
} from "lucide-react";

export default async function HomePage() {
  const authData = await getCurrentUser();

  // If user is already authenticated, redirect to their role dashboard
  if (authData) {
    if (authData.profile.role === "admin") {
      redirect("/admin/dashboard");
    } else {
      redirect("/student/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar profile={null} />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Phase 1 — Foundation & Authentication</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Master Your Exam Prep with{" "}
                <span className="text-indigo-600">Precision & Focus</span>
              </h1>

              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                PrepTrack is a structured student preparation and competitive examination
                management platform. Built with Supabase PostgreSQL and secure role-based access.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  Register as Student
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Existing User Sign In
                </Link>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 mb-4">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Student Preparation</h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Dedicated student workspace to track daily study milestones, syllabus
                  coverage, and examination readiness.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Admin Governance</h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Controlled administration and role-based route protection ensuring security
                  for student records and exam data.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-4">
                  <Lock className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Supabase Security</h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Row Level Security (RLS) policies and cookie-based authentication via
                  @supabase/ssr safeguard all user data.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PrepTrack Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
