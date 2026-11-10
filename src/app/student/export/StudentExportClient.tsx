"use client";

import { useState } from "react";
import { Download, FileText, CheckCircle2, ShieldCheck, Database, Layers } from "lucide-react";

interface StudentExportClientProps {
  exportData: {
    studentId: string;
    exportedAt: string;
    enrolledExams: any[];
    topicProgress: any[];
    studyTasks: any[];
    revisionSchedules: any[];
    practiceAttempts: any[];
    mockExamResults: any[];
  };
}

export default function StudentExportClient({ exportData }: StudentExportClientProps) {
  const [downloadingSection, setDownloadingSection] = useState<string | null>(null);

  const downloadCSV = (filename: string, rows: (string | number)[][]) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSyllabus = () => {
    setDownloadingSection("syllabus");
    const header = ["Topic Title", "Subject", "Chapter", "Status", "Confidence", "Last Studied"];
    const rows = exportData.topicProgress.map((tp) => [
      tp.topics?.title || "Topic",
      tp.topics?.chapters?.subjects?.name || "Subject",
      tp.topics?.chapters?.title || "Chapter",
      tp.status,
      tp.confidence_level || "Normal",
      tp.updated_at ? tp.updated_at.split("T")[0] : "-",
    ]);
    downloadCSV("preptrack_syllabus_progress.csv", [header, ...rows]);
    setDownloadingSection(null);
  };

  const handleExportTasks = () => {
    setDownloadingSection("tasks");
    const header = ["Task Title", "Scheduled Date", "Duration (Mins)", "Status", "Priority"];
    const rows = exportData.studyTasks.map((t) => [
      t.title,
      t.scheduled_date,
      t.duration_minutes || 0,
      t.status,
      t.priority || 1,
    ]);
    downloadCSV("preptrack_study_tasks.csv", [header, ...rows]);
    setDownloadingSection(null);
  };

  const handleExportRevisions = () => {
    setDownloadingSection("revisions");
    const header = ["Topic", "Revision Cycle #", "Scheduled Date", "Status", "Rating", "Notes"];
    const rows = exportData.revisionSchedules.map((r) => [
      r.topics?.title || "Topic",
      r.revision_number,
      r.scheduled_date,
      r.is_completed ? "Completed" : "Pending",
      r.confidence_rating || "-",
      r.notes || "",
    ]);
    downloadCSV("preptrack_revision_history.csv", [header, ...rows]);
    setDownloadingSection(null);
  };

  const handleExportPracticeMCQ = () => {
    setDownloadingSection("mcq");
    const header = ["Question Text", "Result", "Time Spent (s)", "Attempted At"];
    const rows = exportData.practiceAttempts.map((a) => [
      a.questions?.question_text?.slice(0, 80) || "MCQ Question",
      a.is_correct ? "Correct" : "Incorrect",
      a.time_spent_seconds || 0,
      a.created_at ? a.created_at.split("T")[0] : "-",
    ]);
    downloadCSV("preptrack_practice_mcq_history.csv", [header, ...rows]);
    setDownloadingSection(null);
  };

  const handleExportMockResults = () => {
    setDownloadingSection("mocks");
    const header = ["Mock Exam", "Category", "Score", "Max Marks", "Percentage", "Accuracy %", "Date"];
    const rows = exportData.mockExamResults.map((r) => [
      r.exam_templates?.title || "Mock Exam",
      r.exam_templates?.exam_category || "General",
      r.total_score,
      r.max_marks,
      `${r.percentage}%`,
      `${r.accuracy_percent}%`,
      r.evaluated_at ? r.evaluated_at.split("T")[0] : "-",
    ]);
    downloadCSV("preptrack_mock_exam_results.csv", [header, ...rows]);
    setDownloadingSection(null);
  };

  const handleExportAllJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `preptrack_full_backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Download className="h-7 w-7 text-indigo-600" />
            Personal Data Export & Portability
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Export your preparation records, task schedules, and test history in standard CSV and JSON formats.
          </p>
        </div>

        <button
          onClick={handleExportAllJSON}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
        >
          <Database className="h-4 w-4" />
          Export Complete JSON Archive
        </button>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
        <p className="text-xs text-emerald-800">
          <strong>Privacy Guaranteed:</strong> Exports strictly filter and include only your authenticated student records. Private administrative configurations and other students&apos; data are completely excluded.
        </p>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Syllabus Progress */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Syllabus</span>
            <Layers className="h-4 w-4 text-indigo-600" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Syllabus Progress Ledger</h3>
          <p className="text-xs text-slate-500">
            Records for {exportData.topicProgress.length} topics across your enrolled examinations.
          </p>
          <button
            onClick={handleExportSyllabus}
            disabled={downloadingSection === "syllabus"}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            <Download className="h-3.5 w-3.5" />
            Download Syllabus CSV
          </button>
        </div>

        {/* Study Tasks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Study Routine</span>
            <FileText className="h-4 w-4 text-purple-600" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Study Tasks & Routine Log</h3>
          <p className="text-xs text-slate-500">
            {exportData.studyTasks.length} daily tasks, hours studied, and completion statuses.
          </p>
          <button
            onClick={handleExportTasks}
            disabled={downloadingSection === "tasks"}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            <Download className="h-3.5 w-3.5" />
            Download Tasks CSV
          </button>
        </div>

        {/* Revision History */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Spaced Review</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Spaced Revision History</h3>
          <p className="text-xs text-slate-500">
            {exportData.revisionSchedules.length} spaced repetition cycles and self-reported ratings.
          </p>
          <button
            onClick={handleExportRevisions}
            disabled={downloadingSection === "revisions"}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            <Download className="h-3.5 w-3.5" />
            Download Revisions CSV
          </button>
        </div>

        {/* MCQ Practice */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">MCQ Bank</span>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Question Practice Log</h3>
          <p className="text-xs text-slate-500">
            Recent {exportData.practiceAttempts.length} question attempts with speed and correctness.
          </p>
          <button
            onClick={handleExportPracticeMCQ}
            disabled={downloadingSection === "mcq"}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            <Download className="h-3.5 w-3.5" />
            Download MCQs CSV
          </button>
        </div>

        {/* Mock Exam Results */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">CBT Tests</span>
            <CheckCircle2 className="h-4 w-4 text-amber-600" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Online Mock Examination Results</h3>
          <p className="text-xs text-slate-500">
            {exportData.mockExamResults.length} finalized test attempts with negative marking breakdowns.
          </p>
          <button
            onClick={handleExportMockResults}
            disabled={downloadingSection === "mocks"}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            <Download className="h-3.5 w-3.5" />
            Download Mock Results CSV
          </button>
        </div>
      </div>
    </div>
  );
}
