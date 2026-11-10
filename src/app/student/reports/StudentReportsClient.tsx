"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Target,
  BookOpen,
} from "lucide-react";
import type { StudentPerformanceAnalytics } from "@/lib/types";

interface StudentReportsClientProps {
  dailyAnalytics: StudentPerformanceAnalytics;
  weeklyAnalytics: StudentPerformanceAnalytics;
  monthlyAnalytics: StudentPerformanceAnalytics;
  overallAnalytics: StudentPerformanceAnalytics;
  studentName: string;
}

export default function StudentReportsClient({
  dailyAnalytics,
  weeklyAnalytics,
  monthlyAnalytics,
  overallAnalytics,
  studentName,
}: StudentReportsClientProps) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");

  const currentData =
    period === "daily" ? dailyAnalytics : period === "weekly" ? weeklyAnalytics : monthlyAnalytics;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const rows = [
      ["PrepTrack Student Progress Report"],
      ["Student", studentName],
      ["Period", period.toUpperCase()],
      ["Generated At", new Date().toLocaleString()],
      [],
      ["Metric", "Value"],
      ["Total Study Hours", `${currentData.totalStudyHours} hrs`],
      ["Tasks Completed", currentData.tasksCompleted],
      ["Tasks Incomplete", currentData.incompleteTasks],
      ["Syllabus Coverage", `${currentData.syllabusCompletionPercentage}%`],
      ["Completed Topics", currentData.completedTopics],
      ["Pending Topics", currentData.pendingTopics],
      ["MCQs Attempted", currentData.mcqsAttempted],
      ["Correct Answers", currentData.correctAnswers],
      ["Incorrect Answers", currentData.incorrectAnswers],
      ["Overall Accuracy", `${currentData.overallAccuracy}%`],
      ["Mock Exams Attempted", currentData.totalMockExaminationsAttempted],
      ["Best Mock Score", currentData.bestMockScore],
      ["Average Mock Score", currentData.averageMockScore],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `preptrack_${period}_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="h-7 w-7 text-indigo-600" />
            Preparation Reports & Summaries
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Official periodic audit of your daily consistency, syllabus progress, and test accuracy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex items-center gap-2 print:hidden">
        <span className="text-xs font-bold text-slate-500 mr-2">Report Interval:</span>
        <button
          onClick={() => setPeriod("daily")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            period === "daily"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Daily Summary
        </button>
        <button
          onClick={() => setPeriod("weekly")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            period === "weekly"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Weekly Progress (Last 7 Days)
        </button>
        <button
          onClick={() => setPeriod("monthly")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            period === "monthly"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Monthly Audit (Last 30 Days)
        </button>
      </div>

      {/* Printable Report Canvas */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Report Banner */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Official PrepTrack Report
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              {period === "daily"
                ? "Daily Performance Summary"
                : period === "weekly"
                ? "Weekly Preparation Audit"
                : "Monthly Comprehensive Progress Report"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Candidate: <strong className="text-slate-800">{studentName}</strong> &bull; Generated:{" "}
              {new Date().toLocaleDateString("en-US", { dateStyle: "long" })}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500">
            <span className="block font-bold text-slate-800">
              {currentData.totalExaminationsSelected} Examination(s) Active
            </span>
            <span>Target Syllabus: {currentData.totalSyllabusTopics} Topics</span>
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Total Study Time</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {currentData.totalStudyHours} hrs
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">
              {currentData.tasksCompleted} study tasks completed
            </span>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Syllabus Progress</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {currentData.syllabusCompletionPercentage}%
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">
              {currentData.completedTopics} of {currentData.totalSyllabusTopics} topics
            </span>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Practice Accuracy</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {currentData.overallAccuracy}%
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">
              {currentData.correctAnswers} / {currentData.mcqsAttempted} correct
            </span>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Mock Exam Score</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {currentData.bestMockScore}
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Average: {currentData.averageMockScore} marks
            </span>
          </div>
        </div>

        {/* Detailed Breakdown Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Performance Breakdown
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                <tr>
                  <th className="py-3 px-4">Evaluation Dimension</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Assessment / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Syllabus Coverage</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {currentData.syllabusCompletionPercentage}% ({currentData.completedTopics} topics)
                  </td>
                  <td className="py-3 px-4">
                    {currentData.syllabusCompletionPercentage >= 75 ? (
                      <span className="text-emerald-700 font-semibold">On Track</span>
                    ) : (
                      <span className="text-amber-700 font-semibold">Progress In Progress</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Task Completion Rate</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {currentData.tasksCompleted} / {currentData.tasksCompleted + currentData.incompleteTasks}
                  </td>
                  <td className="py-3 px-4">
                    {currentData.incompleteTasks === 0 ? (
                      <span className="text-emerald-700 font-semibold">100% Tasks Done</span>
                    ) : (
                      <span className="text-slate-600">{currentData.incompleteTasks} Pending</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">MCQ Practice Accuracy</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {currentData.overallAccuracy}% ({currentData.mcqsAttempted} attempted)
                  </td>
                  <td className="py-3 px-4">
                    {currentData.overallAccuracy >= 65 ? (
                      <span className="text-emerald-700 font-semibold">Good Accuracy</span>
                    ) : (
                      <span className="text-rose-700 font-semibold">Needs Improvement</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Mock Examination Readiness</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {currentData.totalMockExaminationsAttempted} Attempts Logged
                  </td>
                  <td className="py-3 px-4">
                    {currentData.totalMockExaminationsAttempted > 0 ? (
                      <span className="text-indigo-700 font-semibold">Benchmarked</span>
                    ) : (
                      <span className="text-amber-700 font-semibold">No Mock Exam Taken Yet</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Audit Signature */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
          <span>PrepTrack Automated Performance Ledger &bull; Strict Supabase Data Integrity</span>
          <span className="mt-1 sm:mt-0">Document Verification ID: {new Date().getTime().toString(36).toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
