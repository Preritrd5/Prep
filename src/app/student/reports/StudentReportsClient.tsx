"use client";

import { PageHeader, Card, Badge, Button } from "@/components/ui";
import { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Clock,
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
      <div className="print:hidden">
        <PageHeader
          title="Preparation Reports & Summaries"
          description="Official periodic audit of your daily consistency, syllabus progress, and test accuracy."
          breadcrumbs={[
            { label: "Dashboard", href: "/student/dashboard" },
            { label: "Reports" },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="gap-1.5"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePrint}
                className="gap-1.5"
              >
                <Printer className="h-4 w-4" />
                Print / Save PDF
              </Button>
            </div>
          }
        />
      </div>

      {/* Period Tabs */}
      <div className="flex items-center gap-2 print:hidden">
        <span className="text-xs font-bold text-text-muted mr-2">Report Interval:</span>
        <button
          onClick={() => setPeriod("daily")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            period === "daily"
              ? "bg-primary text-white shadow-sm"
              : "bg-card text-text-secondary border border-border hover:bg-secondary-bg"
          }`}
        >
          Daily Summary
        </button>
        <button
          onClick={() => setPeriod("weekly")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            period === "weekly"
              ? "bg-primary text-white shadow-sm"
              : "bg-card text-text-secondary border border-border hover:bg-secondary-bg"
          }`}
        >
          Weekly Progress (Last 7 Days)
        </button>
        <button
          onClick={() => setPeriod("monthly")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            period === "monthly"
              ? "bg-primary text-white shadow-sm"
              : "bg-card text-text-secondary border border-border hover:bg-secondary-bg"
          }`}
        >
          Monthly Audit (Last 30 Days)
        </button>
      </div>

      {/* Printable Report Canvas */}
      <Card className="p-6 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Report Banner */}
        <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Badge variant="primary">Official PrepTrack Report</Badge>
            <h2 className="text-xl sm:text-2xl font-black text-text-primary mt-2">
              {period === "daily"
                ? "Daily Performance Summary"
                : period === "weekly"
                ? "Weekly Preparation Audit"
                : "Monthly Comprehensive Progress Report"}
            </h2>
            <p className="text-xs text-text-muted mt-1">
              Candidate: <strong className="text-text-primary">{studentName}</strong> &bull; Generated:{" "}
              {new Date().toLocaleDateString("en-US", { dateStyle: "long" })}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-text-muted">
            <span className="block font-bold text-text-primary">
              {currentData.totalExaminationsSelected} Examination(s) Active
            </span>
            <span>Target Syllabus: {currentData.totalSyllabusTopics} Topics</span>
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border bg-secondary-bg/60 p-4">
            <span className="text-[11px] font-bold uppercase text-text-muted block">Total Study Time</span>
            <span className="text-2xl font-black text-text-primary mt-1 block">
              {currentData.totalStudyHours} hrs
            </span>
            <span className="text-[10px] text-text-muted mt-1 block">
              {currentData.tasksCompleted} study tasks completed
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-secondary-bg/60 p-4">
            <span className="text-[11px] font-bold uppercase text-text-muted block">Syllabus Progress</span>
            <span className="text-2xl font-black text-text-primary mt-1 block">
              {currentData.syllabusCompletionPercentage}%
            </span>
            <span className="text-[10px] text-text-muted mt-1 block">
              {currentData.completedTopics} of {currentData.totalSyllabusTopics} topics
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-secondary-bg/60 p-4">
            <span className="text-[11px] font-bold uppercase text-text-muted block">Practice Accuracy</span>
            <span className="text-2xl font-black text-text-primary mt-1 block">
              {currentData.overallAccuracy}%
            </span>
            <span className="text-[10px] text-text-muted mt-1 block">
              {currentData.correctAnswers} / {currentData.mcqsAttempted} correct
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-secondary-bg/60 p-4">
            <span className="text-[11px] font-bold uppercase text-text-muted block">Mock Exam Score</span>
            <span className="text-2xl font-black text-text-primary mt-1 block">
              {currentData.bestMockScore}
            </span>
            <span className="text-[10px] text-text-muted mt-1 block">
              Average: {currentData.averageMockScore} marks
            </span>
          </div>
        </div>

        {/* Detailed Breakdown Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
            Performance Breakdown
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary-bg/50 border-b border-border font-semibold text-text-secondary">
                <tr>
                  <th className="py-3 px-4">Evaluation Dimension</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Assessment / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-text-primary">
                <tr>
                  <td className="py-3 px-4 font-semibold text-text-primary">Syllabus Coverage</td>
                  <td className="py-3 px-4 font-bold text-text-primary">
                    {currentData.syllabusCompletionPercentage}% ({currentData.completedTopics} topics)
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={currentData.syllabusCompletionPercentage >= 75 ? "success" : "warning"}>
                      {currentData.syllabusCompletionPercentage >= 75 ? "On Track" : "Progress In Progress"}
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-text-primary">Task Completion Rate</td>
                  <td className="py-3 px-4 font-bold text-text-primary">
                    {currentData.tasksCompleted} / {currentData.tasksCompleted + currentData.incompleteTasks}
                  </td>
                  <td className="py-3 px-4">
                    {currentData.incompleteTasks === 0 ? (
                      <Badge variant="success">100% Tasks Done</Badge>
                    ) : (
                      <span className="text-text-muted font-medium">{currentData.incompleteTasks} Pending</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-text-primary">MCQ Practice Accuracy</td>
                  <td className="py-3 px-4 font-bold text-text-primary">
                    {currentData.overallAccuracy}% ({currentData.mcqsAttempted} attempted)
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={currentData.overallAccuracy >= 65 ? "success" : "error"}>
                      {currentData.overallAccuracy >= 65 ? "Good Accuracy" : "Needs Improvement"}
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-text-primary">Mock Examination Readiness</td>
                  <td className="py-3 px-4 font-bold text-text-primary">
                    {currentData.totalMockExaminationsAttempted} Attempts Logged
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={currentData.totalMockExaminationsAttempted > 0 ? "primary" : "warning"}>
                      {currentData.totalMockExaminationsAttempted > 0 ? "Benchmarked" : "No Mock Exam Taken Yet"}
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Audit Signature */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-text-muted">
          <span>PrepTrack Automated Performance Ledger &bull; Strict Supabase Data Integrity</span>
          <span className="mt-1 sm:mt-0">Document Verification ID: {new Date().getTime().toString(36).toUpperCase()}</span>
        </div>
      </Card>
    </div>
  );
}
