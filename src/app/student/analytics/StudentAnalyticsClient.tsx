"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Target,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ArrowRight,
  Filter,
  CheckSquare,
  Sparkles,
  HelpCircle,
  RotateCcw,
  ListOrdered,
  Calendar,
} from "lucide-react";
import type {
  StudentPerformanceAnalytics,
  SubjectAnalyticsSummary,
  TopicAnalyticsSummary,
  WeakAreaTopic,
} from "@/lib/types";
import { studentDismissWeakAreaAction } from "@/app/actions/analytics";

interface StudentAnalyticsClientProps {
  initialAnalytics: StudentPerformanceAnalytics;
  subjects: SubjectAnalyticsSummary[];
  topics: TopicAnalyticsSummary[];
  weakTopics: WeakAreaTopic[];
}

export default function StudentAnalyticsClient({
  initialAnalytics,
  subjects,
  topics,
  weakTopics: initialWeakTopics,
}: StudentAnalyticsClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "subjects" | "topics" | "weak">("overview");
  const [timeFilter, setTimeFilter] = useState<"daily" | "weekly" | "monthly" | "overall">("overall");
  const [weakTopics, setWeakTopics] = useState(initialWeakTopics);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  const filteredTopics = topics.filter((t) => {
    if (subjectFilter === "all") return true;
    return t.subjectName === subjectFilter;
  });

  const uniqueSubjectNames = Array.from(new Set(topics.map((t) => t.subjectName)));

  const handleDismissWeakTopic = async (topicId: string) => {
    setDismissingId(topicId);
    const fd = new FormData();
    fd.append("topicId", topicId);
    await studentDismissWeakAreaAction(fd);
    setWeakTopics((prev) => prev.filter((w) => w.topicId !== topicId));
    setDismissingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-indigo-600" />
            Performance & Subject Analytics
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time syllabus completion, MCQ accuracy breakdowns, and AI-driven weak area diagnostics.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === "overview"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("subjects")}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === "subjects"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Subjects ({subjects.length})
          </button>
          <button
            onClick={() => setActiveTab("topics")}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === "topics"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Topic Drilldown ({topics.length})
          </button>
          <button
            onClick={() => setActiveTab("weak")}
            className={`rounded-lg px-3 py-1.5 transition flex items-center gap-1.5 ${
              activeTab === "weak"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-rose-700 hover:text-rose-900"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Weak Areas ({weakTopics.length})
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Top KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Syllabus Coverage */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Syllabus Progress</span>
                <BookOpen className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {initialAnalytics.syllabusCompletionPercentage}%
                </span>
                <span className="text-xs text-slate-500">
                  ({initialAnalytics.completedTopics}/{initialAnalytics.totalSyllabusTopics} topics)
                </span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all rounded-full"
                  style={{ width: `${Math.min(100, initialAnalytics.syllabusCompletionPercentage)}%` }}
                />
              </div>
            </div>

            {/* MCQ Practice Accuracy */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">MCQ Accuracy</span>
                <Target className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {initialAnalytics.overallAccuracy}%
                </span>
                <span className="text-xs text-slate-500">
                  ({initialAnalytics.correctAnswers}/{initialAnalytics.mcqsAttempted})
                </span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all rounded-full"
                  style={{ width: `${Math.min(100, initialAnalytics.overallAccuracy)}%` }}
                />
              </div>
            </div>

            {/* Total Study Hours */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Study Time</span>
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {initialAnalytics.totalStudyHours} hrs
                </span>
                <span className="text-xs text-slate-500">
                  ({initialAnalytics.tasksCompleted} tasks done)
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {initialAnalytics.incompleteTasks} pending tasks in schedule
              </p>
            </div>

            {/* Mock Test Score */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Mock Tests</span>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {initialAnalytics.bestMockScore}
                </span>
                <span className="text-xs text-slate-500">
                  Best / Avg {initialAnalytics.averageMockScore}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {initialAnalytics.totalMockExaminationsAttempted} attempts completed
              </p>
            </div>
          </div>

          {/* 7-Day Performance Trend */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent 7-Day Performance Trend</h3>
                <p className="text-xs text-slate-500">Daily question practice count and accuracy rate</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-indigo-600 font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                Actual Activity
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-2">
              {initialAnalytics.recentPerformanceTrend.map((day) => {
                const dayName = new Date(day.date).toLocaleDateString("en-US", { weekday: "short" });
                return (
                  <div key={day.date} className="flex flex-col items-center text-center">
                    <div className="w-full bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-end h-32 relative">
                      <div
                        className="w-full bg-indigo-500 rounded-lg transition-all"
                        style={{ height: `${Math.max(12, Math.min(100, day.questionsAttempted * 8))}%` }}
                      />
                      <span className="text-[10px] font-bold text-slate-700 mt-1">
                        {day.questionsAttempted} Qs
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-800 mt-2">{dayName}</span>
                    <span className="text-[10px] text-slate-500">
                      {day.accuracy > 0 ? `${day.accuracy}%` : "-"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subject Snapshot Cards */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Subject Coverage & Accuracy</h3>
                <p className="text-xs text-slate-500">Breakdown of syllabus progress across key subjects</p>
              </div>
              <button
                onClick={() => setActiveTab("subjects")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View all subjects <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.slice(0, 6).map((sub) => (
                <div
                  key={sub.subjectId}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 hover:border-indigo-200 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{sub.subjectName}</h4>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {sub.completionPercentage}%
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Topics:</span>
                      <span className="font-semibold text-slate-900">
                        {sub.completedTopics} / {sub.totalTopics}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Practice Accuracy:</span>
                      <span className="font-semibold text-slate-900">
                        {sub.accuracyPercentage}% ({sub.questionsAttempted} Qs)
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/student/practice/subject`}
                      className="flex-1 text-center rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                    >
                      Practice
                    </Link>
                    <Link
                      href={`/student/syllabus`}
                      className="flex-1 text-center rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition"
                    >
                      Syllabus
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUBJECTS DETAIL */}
      {activeTab === "subjects" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">All Syllabus Subjects ({subjects.length})</h3>
              <span className="text-xs text-slate-500">Filtered by your enrolled examinations</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Subject Name</th>
                    <th className="py-3 px-4">Topics Covered</th>
                    <th className="py-3 px-4">Completion %</th>
                    <th className="py-3 px-4">Questions Attempted</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4">Avg Speed</th>
                    <th className="py-3 px-4">Revisions</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {subjects.map((sub) => (
                    <tr key={sub.subjectId} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {sub.subjectName}
                        {sub.examCategory && (
                          <span className="block text-[10px] font-normal text-slate-400">
                            {sub.examCategory}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {sub.completedTopics} / {sub.totalTopics}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{sub.completionPercentage}%</span>
                          <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full"
                              style={{ width: `${sub.completionPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{sub.questionsAttempted}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold ${
                            sub.accuracyPercentage >= 70
                              ? "text-emerald-700"
                              : sub.accuracyPercentage >= 50
                              ? "text-amber-700"
                              : "text-rose-700"
                          }`}
                        >
                          {sub.accuracyPercentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4">{sub.averageTimePerQuestionSeconds}s / Q</td>
                      <td className="py-3 px-4">{sub.revisionCount}</td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/student/practice/subject`}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                        >
                          Practice MCQs
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TOPIC DRILLDOWN */}
      {activeTab === "topics" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="font-bold text-slate-700">Filter by Subject:</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Subjects ({uniqueSubjectNames.length})</option>
              {uniqueSubjectNames.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="ml-auto text-slate-500 font-medium">
              Showing {filteredTopics.length} topics
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Topic Hierarchy</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">MCQs Attempted</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4">Last Studied</th>
                    <th className="py-3 px-4">Next Revision</th>
                    <th className="py-3 px-4 text-right">Practice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredTopics.map((top) => (
                    <tr key={top.topicId} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{top.topicTitle}</span>
                        <span className="text-[10px] text-slate-400">
                          {top.subjectName} &rarr; {top.chapterTitle}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            top.completionStatus === "Completed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : top.completionStatus === "In Progress"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {top.completionStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {top.questionsAttempted} ({top.correctAnswers} correct)
                      </td>
                      <td className="py-3 px-4">
                        {top.questionsAttempted > 0 ? (
                          <span
                            className={`font-semibold ${
                              top.accuracyPercentage >= 70
                                ? "text-emerald-700"
                                : top.accuracyPercentage >= 50
                                ? "text-amber-700"
                                : "text-rose-700"
                            }`}
                          >
                            {top.accuracyPercentage}%
                          </span>
                        ) : (
                          <span className="text-slate-400">No attempts</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{top.lastStudiedDate || "Not studied"}</td>
                      <td className="py-3 px-4 text-slate-500">{top.upcomingRevisionDate || "-"}</td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/student/practice/topic?topicId=${top.topicId}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                        >
                          Solve MCQs
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WEAK AREAS IDENTIFICATION (MODULE 4) */}
      {activeTab === "weak" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-rose-950">
                  Targeted Weak Areas & Intervention Strategy
                </h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  Topics are flagged strictly based on real question attempts (minimum sample size threshold applied),
                  repeated mistakes, or retention lapses.
                </p>
              </div>
            </div>
          </div>

          {weakTopics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weakTopics.map((item) => (
                <div
                  key={item.topicId}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {item.examName} &bull; {item.subjectName}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">{item.topicTitle}</h4>
                      <p className="text-xs text-slate-500">{item.chapterTitle}</p>
                    </div>

                    <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-1 text-xs font-bold text-rose-700 shrink-0">
                      {item.accuracyPercentage}% Acc
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs text-slate-700">
                    <span className="font-semibold text-slate-900 block mb-0.5">Diagnostic Reason:</span>
                    {item.reason}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleDismissWeakTopic(item.topicId)}
                      disabled={dismissingId === item.topicId}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                    >
                      {dismissingId === item.topicId ? "Dismissing..." : "Dismiss / Addressed"}
                    </button>

                    <Link
                      href={`/student/practice/topic?topicId=${item.topicId}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {item.recommendedAction}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No Weak Topics Flagged!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Excellent consistency! All topics with sufficient question practice maintain healthy accuracy
                and regular spaced repetition intervals.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
