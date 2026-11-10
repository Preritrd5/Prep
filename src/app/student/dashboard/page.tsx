import { requireRole } from "@/lib/auth";
import {
  getStudentExams,
  getStudentTasks,
  getExamScheduleEvents,
  getExamSyllabus,
} from "@/lib/data/syllabus";
import {
  getStudentPerformanceAnalytics,
  getStudentStudyRecommendations,
} from "@/lib/data/analytics";
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
  Layers,
  CalendarDays,
  Plus,
  BarChart3,
  Bot,
} from "lucide-react";

export default async function StudentDashboardPage() {
  const { profile, user } = await requireRole("student");

  const [enrolledExams, tasks, recommendations, analytics] = await Promise.all([
    getStudentExams(user.id),
    getStudentTasks(user.id),
    getStudentStudyRecommendations(user.id),
    getStudentPerformanceAnalytics(user.id),
  ]);

  const examIds = enrolledExams.map((se) => se.exam_id);
  const events = await getExamScheduleEvents(examIds);

  // Calculate real metrics
  const completedTasksCount = tasks.filter((t) => t.status === "Completed").length;
  const pendingTasksCount = tasks.filter(
    (t) => t.status === "Upcoming" || t.status === "In Progress"
  ).length;

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
                  <span>PrepTrack v1.0 — Production Analytics & CBT Engine</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, {displayName}!
                </h1>
                <p className="mt-1 text-sm text-indigo-200 max-w-2xl leading-relaxed">
                  Your personalized competitive exam workspace is active. You have{" "}
                  <strong>{enrolledExams.length} examination(s)</strong> enrolled with{" "}
                  <strong>{analytics.completedTopics} of {analytics.totalSyllabusTopics} syllabus topics completed ({analytics.syllabusCompletionPercentage}%)</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/student/analytics"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-indigo-900 shadow-sm hover:bg-indigo-50 transition"
                >
                  <BarChart3 className="h-4 w-4 text-indigo-600" />
                  Analytics
                </Link>
                <Link
                  href="/student/assistant"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-700/60 px-3.5 py-2 text-xs font-semibold text-white border border-indigo-500/40 hover:bg-indigo-700 transition"
                >
                  <Bot className="h-4 w-4" />
                  AI Assistant
                </Link>
                <Link
                  href="/student/exams/online"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur border border-white/20 hover:bg-white/20 transition"
                >
                  Mock Tests
                </Link>
              </div>
            </div>
          </div>

          {/* Real Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Metric 1: Selected Exam Count */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Target Examinations
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <BookOpen className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {enrolledExams.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {enrolledExams.length > 0
                  ? "Active preparation targets"
                  : "No examinations selected yet"}
              </p>
            </div>

            {/* Metric 2: Completed Tasks */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tasks Completed
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{completedTasksCount}</p>
              <p className="mt-1 text-xs text-slate-500">
                Finished study sessions and assignments
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
              <p className="mt-3 text-2xl font-bold text-slate-900">{pendingTasksCount}</p>
              <p className="mt-1 text-xs text-slate-500">
                Eligible for automatic carry-forward
              </p>
            </div>

            {/* Metric 4: Study Progress */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Preparation Pace
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {tasks.length > 0
                  ? `${Math.round((completedTasksCount / tasks.length) * 100)}%`
                  : "0%"}
              </p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{
                    width: `${
                      tasks.length > 0
                        ? Math.round((completedTasksCount / tasks.length) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Module 6: Automatic Study Recommendations */}
          {recommendations.length > 0 && (
            <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm mb-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Personalized Study Recommendations
                    </h2>
                    <p className="text-xs text-slate-500">
                      Deterministic suggestions formulated from your syllabus targets, weak areas, and mock test scores.
                    </p>
                  </div>
                </div>
                <Link
                  href="/student/analytics"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hidden sm:inline-block"
                >
                  View Weak Areas →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {recommendations.slice(0, 3).map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                        {rec.recommendation_type}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-2">{rec.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{rec.reason}</p>
                    </div>

                    {rec.action_url && (
                      <Link
                        href={rec.action_url}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                      >
                        Take Action <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Enrolled Exams & Tasks preview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Enrolled Examinations Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900">
                    Selected Examination Portfolios
                  </h2>
                  <Link
                    href="/student/exams"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Manage Exams →
                  </Link>
                </div>

                {enrolledExams.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {enrolledExams.map((se) => (
                      <div
                        key={se.id}
                        className="rounded-xl border border-slate-200 p-4 hover:border-indigo-300 transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                              Priority {se.priority}
                            </span>
                            {se.target_date && (
                              <span className="text-[10px] text-slate-500 font-medium">
                                Target: {se.target_date}
                              </span>
                            )}
                          </div>
                          <h4 className="mt-2 text-sm font-bold text-slate-900">
                            {se.exam?.name || "Examination"}
                          </h4>
                        </div>

                        <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <Link
                            href={`/student/syllabus?examId=${se.exam_id}`}
                            className="text-indigo-600 font-semibold hover:underline"
                          >
                            Browse Syllabus
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-slate-500">
                    <p className="text-sm font-semibold">No examinations selected</p>
                    <Link
                      href="/student/exams"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Enroll in an examination
                    </Link>
                  </div>
                )}
              </div>

              {/* Tasks Preview */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900">Upcoming Study Tasks</h2>
                  <Link
                    href="/student/tasks"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    View All Tasks →
                  </Link>
                </div>

                {tasks.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {tasks.slice(0, 4).map((t) => (
                      <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2
                            className={`h-4 w-4 ${
                              t.status === "Completed" ? "text-emerald-600" : "text-slate-300"
                            }`}
                          />
                          <div>
                            <span
                              className={`font-bold ${
                                t.status === "Completed"
                                  ? "text-slate-400 line-through"
                                  : "text-slate-800"
                              }`}
                            >
                              {t.title}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              {t.scheduled_date} • {t.duration_minutes}m
                            </span>
                          </div>
                        </div>

                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No active tasks. Use the Study Planner to generate your schedule.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Official Exam Events & Quick Actions */}
            <div className="space-y-6">
              {/* Official Schedule Milestones */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900">Official Exam Calendar</h2>
                  <Link
                    href="/student/schedule"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Full Calendar →
                  </Link>
                </div>

                {events.length > 0 ? (
                  <div className="space-y-3">
                    {events.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        className="rounded-xl border border-purple-100 bg-purple-50/50 p-3 text-xs"
                      >
                        <span className="rounded-full bg-purple-100 px-2 py-0.2 text-[10px] font-bold text-purple-700">
                          {ev.event_type}
                        </span>
                        <h4 className="mt-1 font-bold text-slate-900">{ev.title}</h4>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          {new Date(ev.start_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500 text-center">
                    No upcoming examination deadlines for your enrolled exams.
                  </div>
                )}
              </div>

              {/* Quick Navigation Links */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Study Management Tools</h3>
                <div className="space-y-2 text-xs font-medium">
                  <Link
                    href="/student/routine"
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition"
                  >
                    <span className="flex items-center gap-2 text-slate-700">
                      <Clock className="h-4 w-4 text-indigo-600" />
                      Daily Routine & Preferences
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </Link>

                  <Link
                    href="/student/calendar"
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition"
                  >
                    <span className="flex items-center gap-2 text-slate-700">
                      <Calendar className="h-4 w-4 text-indigo-600" />
                      Interactive Calendar
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </Link>

                  <Link
                    href="/student/revisions"
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition"
                  >
                    <span className="flex items-center gap-2 text-slate-700">
                      <Layers className="h-4 w-4 text-indigo-600" />
                      Revision & Notes Manager
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
