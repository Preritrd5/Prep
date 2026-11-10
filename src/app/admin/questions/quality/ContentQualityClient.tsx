"use client";

import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileQuestion,
  HelpCircle,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { AdminContentQualityReport } from "@/lib/types";

interface ContentQualityClientProps {
  report: AdminContentQualityReport;
}

export default function ContentQualityClient({ report }: ContentQualityClientProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-indigo-600" />
            Question Bank Quality & Coverage Monitor
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Automated pedagogical audit tracking explanation completeness, syllabus topic gaps, and duplicate questions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/questions/ai"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <Sparkles className="h-4 w-4" />
            Generate Topic MCQs
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Missing Explanations */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">No Explanations</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <span className="text-3xl font-black text-amber-950 block">
            {report.questionsWithoutExplanation}
          </span>
          <span className="text-xs text-amber-700 mt-2 block">
            Questions lack pedagogical solutions
          </span>
        </div>

        {/* Topics Without Questions */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Topics Without Questions</span>
            <Layers className="h-4 w-4" />
          </div>
          <span className="text-3xl font-black text-rose-950 block">
            {report.syllabusTopicsWithoutQuestions.length}
          </span>
          <span className="text-xs text-rose-700 mt-2 block">
            Syllabus topics need MCQs authored
          </span>
        </div>

        {/* Duplicate Questions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Potential Duplicates</span>
            <FileQuestion className="h-4 w-4 text-indigo-600" />
          </div>
          <span className="text-3xl font-black text-slate-900 block">
            {report.duplicateQuestionsCount}
          </span>
          <span className="text-xs text-slate-500 mt-2 block">
            Repeated question stems detected
          </span>
        </div>

        {/* Published Ratio */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Published Ratio</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="text-3xl font-black text-slate-900 block">
            {report.totalQuestions > 0
              ? Math.round((report.publishedQuestions / report.totalQuestions) * 100)
              : 0}
            %
          </span>
          <span className="text-xs text-slate-500 mt-2 block">
            {report.publishedQuestions} of {report.totalQuestions} live
          </span>
        </div>
      </div>

      {/* Topics Without Questions List (Coverage Gaps) */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Syllabus Coverage Gaps (Topics Without Practice Questions)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These topics are part of registered curricula but currently lack verified MCQs.
            </p>
          </div>
          <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
            {report.syllabusTopicsWithoutQuestions.length} Gaps
          </span>
        </div>

        {report.syllabusTopicsWithoutQuestions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {report.syllabusTopicsWithoutQuestions.map((gap) => (
              <div
                key={gap.topicId}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{gap.topicTitle}</h4>
                  <span className="text-xs text-slate-500">Subject: {gap.subjectName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/questions/create?topicId=${gap.topicId}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Author MCQ
                  </Link>
                  <Link
                    href={`/admin/questions/ai?topicId=${gap.topicId}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                  >
                    <Sparkles className="h-3 w-3" />
                    AI Generate
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-slate-400">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">Full Syllabus Coverage Achieved!</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Every syllabus topic has at least one active MCQ.</p>
          </div>
        )}
      </div>
    </div>
  );
}
