"use client";

import { Card, Badge, Button, PageHeader } from "@/components/ui";
import { useState } from "react";
import { Download, FileText, CheckCircle2, ShieldCheck, Database, Layers, CheckSquare, RotateCcw, Award } from "lucide-react";

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
      <PageHeader
        title="Personal Data Export & Portability"
        description="Export your syllabus progress, study routine logs, and test performance in open CSV and JSON formats."
        breadcrumbs={[
          { label: "Student", href: "/student/dashboard" },
          { label: "Data Export" },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<Database className="h-4 w-4" />}
            onClick={handleExportAllJSON}
          >
            Export Complete JSON Archive
          </Button>
        }
      />

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
        <p className="text-xs text-text-primary">
          <strong className="font-semibold text-primary">Privacy Guaranteed:</strong> Exports strictly filter and include only your authenticated student records. Private administrative configurations and other students&apos; data are completely excluded.
        </p>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Syllabus Progress */}
        <Card variant="default" className="flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="primary" size="sm">Syllabus</Badge>
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-base font-bold text-text-primary">Syllabus Progress Ledger</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Detailed tracking records for {exportData.topicProgress.length} topics across all enrolled examinations.
            </p>
          </div>
          <div className="pt-4 mt-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              isLoading={downloadingSection === "syllabus"}
              icon={<Download className="h-3.5 w-3.5" />}
              onClick={handleExportSyllabus}
            >
              Download Syllabus CSV
            </Button>
          </div>
        </Card>

        {/* Study Tasks */}
        <Card variant="default" className="flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" size="sm">Study Routine</Badge>
              <CheckSquare className="h-4 w-4 text-secondary" />
            </div>
            <h3 className="text-base font-bold text-text-primary">Study Tasks & Routine Log</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {exportData.studyTasks.length} daily task items, logged study durations, and completion milestones.
            </p>
          </div>
          <div className="pt-4 mt-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              isLoading={downloadingSection === "tasks"}
              icon={<Download className="h-3.5 w-3.5" />}
              onClick={handleExportTasks}
            >
              Download Tasks CSV
            </Button>
          </div>
        </Card>

        {/* Revision History */}
        <Card variant="default" className="flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="success" size="sm">Spaced Review</Badge>
              <RotateCcw className="h-4 w-4 text-success" />
            </div>
            <h3 className="text-base font-bold text-text-primary">Spaced Revision History</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {exportData.revisionSchedules.length} spaced repetition cycles and self-reported confidence ratings.
            </p>
          </div>
          <div className="pt-4 mt-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              isLoading={downloadingSection === "revisions"}
              icon={<Download className="h-3.5 w-3.5" />}
              onClick={handleExportRevisions}
            >
              Download Revisions CSV
            </Button>
          </div>
        </Card>

        {/* MCQ Practice */}
        <Card variant="default" className="flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="neutral" size="sm">MCQ Bank</Badge>
              <CheckCircle2 className="h-4 w-4 text-accent" />
            </div>
            <h3 className="text-base font-bold text-text-primary">Question Practice Log</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Recent {exportData.practiceAttempts.length} question attempts with speed metrics and correctness.
            </p>
          </div>
          <div className="pt-4 mt-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              isLoading={downloadingSection === "mcq"}
              icon={<Download className="h-3.5 w-3.5" />}
              onClick={handleExportPracticeMCQ}
            >
              Download MCQs CSV
            </Button>
          </div>
        </Card>

        {/* Mock Exam Results */}
        <Card variant="default" className="flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="warning" size="sm">CBT Tests</Badge>
              <Award className="h-4 w-4 text-warning" />
            </div>
            <h3 className="text-base font-bold text-text-primary">Online Mock Exam Results</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {exportData.mockExamResults.length} finalized test attempts with negative marking and accuracy breakdowns.
            </p>
          </div>
          <div className="pt-4 mt-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              isLoading={downloadingSection === "mocks"}
              icon={<Download className="h-3.5 w-3.5" />}
              onClick={handleExportMockResults}
            >
              Download Mock Results CSV
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
