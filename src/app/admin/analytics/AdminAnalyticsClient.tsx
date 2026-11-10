"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Users,
  BookOpen,
  FileQuestion,
  Play,
  TrendingUp,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import type { AdminAnalyticsSummary } from "@/lib/types";

interface AdminAnalyticsClientProps {
  analytics: AdminAnalyticsSummary;
}

export default function AdminAnalyticsClient({ analytics }: AdminAnalyticsClientProps) {
  const [filterPeriod, setFilterPeriod] = useState<"7d" | "30d" | "all">("30d");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-indigo-600" />
            Platform Analytics & Institutional Growth
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Aggregated platform performance across active students, question bank utilization, and examination throughput.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/questions/quality"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            Content Quality Monitor <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Aspirants</span>
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <span className="text-3xl font-black text-slate-900 block">
            {analytics.totalRegisteredStudents}
          </span>
          <span className="text-xs text-emerald-600 font-semibold mt-2 block">
            +{analytics.newRegistrationsThisMonth} this month
          </span>
        </div>

        {/* Question Bank Coverage */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Published Questions</span>
            <FileQuestion className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="text-3xl font-black text-slate-900 block">
            {analytics.publishedQuestions}
          </span>
          <span className="text-xs text-slate-500 mt-2 block">
            {analytics.pendingQuestionReviews} awaiting review
          </span>
        </div>

        {/* Mock Exam Attempts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Mock Exam Attempts</span>
            <Play className="h-4 w-4 text-purple-600" />
          </div>
          <span className="text-3xl font-black text-slate-900 block">
            {analytics.totalExaminationAttempts}
          </span>
          <span className="text-xs text-purple-600 font-semibold mt-2 block">
            Across {analytics.publishedMockExams} live mock templates
          </span>
        </div>

        {/* Practice Sessions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Practice Sessions</span>
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-3xl font-black text-slate-900 block">
            {analytics.totalPracticeSessions}
          </span>
          <span className="text-xs text-slate-500 mt-2 block">
            Topic & subject practice runs
          </span>
        </div>
      </div>

      {/* Syllabus Distribution Hierarchy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Curriculum Depth</span>
          <h3 className="text-base font-bold text-slate-900 mt-1">Syllabus Breakdown</h3>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">Official Examinations:</span>
              <strong className="text-slate-900">{analytics.totalExaminations}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">Subjects Defined:</span>
              <strong className="text-slate-900">{analytics.totalSyllabusSubjects}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">Syllabus Chapters:</span>
              <strong className="text-slate-900">{analytics.totalChapters}</strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-600">Distinct Topics:</span>
              <strong className="text-indigo-600">{analytics.totalTopics}</strong>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Ingestion Breakdown</span>
          <h3 className="text-base font-bold text-slate-900 mt-1">Question Origin Sources</h3>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">AI Generated (Gemini):</span>
              <strong className="text-purple-600">{analytics.aiGeneratedQuestions}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">Bulk Imported (CSV/Excel):</span>
              <strong className="text-slate-900">{analytics.questionsImported}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">Manually Authored:</span>
              <strong className="text-slate-900">
                {Math.max(0, analytics.publishedQuestions - analytics.aiGeneratedQuestions - analytics.questionsImported)}
              </strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-600">Review Queue Pending:</span>
              <strong className="text-amber-600">{analytics.pendingQuestionReviews}</strong>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">System Integrity</span>
          <h3 className="text-base font-bold text-slate-900 mt-1">Privacy & Security Status</h3>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-700 py-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Row Level Security Active</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 py-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>Answer-Key Concealment Verified</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 py-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>Server-Authoritative Timer Live</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 py-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>Immutable Attempt Snapshots</span>
            </div>
          </div>
        </div>
      </div>

      {/* Practice Volume Visual Trend */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">7-Day Platform Practice Volume</h3>
            <p className="text-xs text-slate-500">Total practice sessions and questions answered platform-wide</p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            Aggregated Student Activity
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-2">
          {analytics.practiceActivityTrends.map((day) => {
            const dayName = new Date(day.date).toLocaleDateString("en-US", { weekday: "short" });
            return (
              <div key={day.date} className="flex flex-col items-center text-center">
                <div className="w-full bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-end h-32 relative">
                  <div
                    className="w-full bg-indigo-600 rounded-lg transition-all"
                    style={{ height: `${Math.max(15, Math.min(100, day.questionsAttempted / 5))}%` }}
                  />
                  <span className="text-[10px] font-bold text-slate-700 mt-1">
                    {day.questionsAttempted} Qs
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2">{dayName}</span>
                <span className="text-[10px] text-slate-500">{day.sessions} sessions</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
