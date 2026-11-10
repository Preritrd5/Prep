import { requireRole } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  UserCheck,
  ListTodo,
} from "lucide-react";

export default async function StudentDashboardPage() {
  const { profile } = await requireRole("student");

  const displayName = profile.full_name || profile.email.split("@")[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Welcome Banner */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 p-6 sm:p-8 text-white shadow-sm mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/30 px-3 py-1 text-xs font-medium text-indigo-200 border border-indigo-400/30 mb-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Student Preparation Workspace</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, {displayName}!
                </h1>
                <p className="mt-1 text-sm text-indigo-200 max-w-2xl leading-relaxed">
                  Your personalized competitive exam prep portal is ready. Track your study
                  goals, syllabus completion, and scheduled mock tests in real time.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur border border-white/20 hover:bg-white/20 transition"
                >
                  <UserCheck className="h-4 w-4" />
                  Manage Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Real Metrics & Realistic Empty States Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Metric 1: Selected Exam */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Target Examination
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <BookOpen className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-lg font-bold text-slate-900">Not Selected</p>
              <p className="mt-1 text-xs text-slate-500">
                Examination syllabus enrollment arrives in Phase 2
              </p>
            </div>

            {/* Metric 2: Completed Topics */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Topics Completed
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">0</p>
              <p className="mt-1 text-xs text-slate-500">
                Progress tracking starts once syllabus is active
              </p>
            </div>

            {/* Metric 3: Pending Tasks */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pending Tasks
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <ListTodo className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">0</p>
              <p className="mt-1 text-xs text-slate-500">
                No pending tasks scheduled for today
              </p>
            </div>

            {/* Metric 4: Study Progress */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Overall Readiness
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">0%</p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: "0%" }} />
              </div>
            </div>
          </div>

          {/* Main Dashboard Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Daily Prep Overview & Recent Activity */}
            <div className="lg:col-span-2 space-y-6">
              {/* Daily Preparation Overview */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-slate-900">
                    Daily Preparation Overview
                  </h2>
                  <span className="text-xs text-slate-500">Today</span>
                </div>

                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mb-3">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Daily Study Session Not Initiated
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                    Your daily study schedule and revision planner will populate here as exam
                    curricula are configured in Phase 2.
                  </p>
                </div>
              </div>

              {/* Recent Activity Placeholder */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
                  <span className="text-xs text-slate-400">Activity Log</span>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-6 text-center">
                  <p className="text-sm text-slate-600 font-medium">
                    Account initialized successfully
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Logged in via Supabase Auth. No practice exams or quizzes taken yet.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Upcoming Examination & Profile Info */}
            <div className="space-y-6">
              {/* Upcoming Examination Placeholder */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-slate-900">
                    Upcoming Examinations
                  </h2>
                  <Calendar className="h-4 w-4 text-slate-400" />
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        Exam Calendar Pending
                      </p>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        Upcoming national and state competitive exam schedules will appear here
                        once published by administrators.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Profile Quick Info */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900 mb-3">
                  Student Verification
                </h2>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Student ID:</span>
                    <span className="font-mono text-slate-700 truncate max-w-[150px]">
                      {profile.id}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-slate-700 truncate max-w-[150px]">
                      {profile.email}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Auth Status:</span>
                    <span className="font-semibold text-emerald-600">Active (Verified)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
