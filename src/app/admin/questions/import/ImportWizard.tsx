"use client";

import { Card, Badge, Button, Alert, Select } from "@/components/ui";
import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  FileText,
  Clock,
  ArrowLeft,
} from "lucide-react";
import type { Exam, Subject, QuestionImportBatch } from "@/lib/types";
import { importQuestionsBatchAction } from "@/app/actions/questions";

interface ImportWizardProps {
  exams: Exam[];
  subjects: Subject[];
  recentBatches: QuestionImportBatch[];
}

export default function ImportWizard({
  exams,
  subjects,
  recentBatches,
}: ImportWizardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [defaultSubjectId, setDefaultSubjectId] = useState("");
  const [defaultExamId, setDefaultExamId] = useState("");
  const [isPending, startTransition] = useTransition();

  const [importResult, setImportResult] = useState<{
    success?: boolean;
    totalRows?: number;
    importedCount?: number;
    duplicateCount?: number;
    invalidCount?: number;
    errors?: string[];
    error?: string;
  } | null>(null);

  const handleDownloadTemplate = () => {
    const csvContent =
      "Question,Option A,Option B,Option C,Option D,Correct Option,Explanation,Difficulty,PYQ Exam,PYQ Year\n" +
      '"Who authored the fundamental legal text Arthashastra?","Megasthenes","Kautilya (Chanakya)","Banabhatta","Harisena","B","Kautilya, also identified as Chanakya or Vishnugupta, composed the Arthashastra.","Easy","UPSC CSE",2015\n' +
      '"Under Hooke\'s law, within elastic limit, stress is proportional to:","Area","Strain","Young\'s modulus","Poisson\'s ratio","B","Hooke\'s law states that for small deformations, stress is directly proportional to strain.","Easy","GATE Civil Engineering",2019\n';

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "PrepTrack_Question_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setImportResult(null);
    const formData = new FormData();
    formData.append("file", file);
    if (defaultSubjectId) formData.append("default_subject_id", defaultSubjectId);
    if (defaultExamId) formData.append("default_exam_id", defaultExamId);

    startTransition(async () => {
      const res = await importQuestionsBatchAction(formData);
      setImportResult(res);
      if (res.success) {
        setFile(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link href="/admin/questions">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-text-muted hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" /> Back to Question Bank
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Form (Left Column) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
              <div>
                <h2 className="text-lg font-bold text-text-primary">Upload Spreadsheet (.xlsx / .csv)</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Import hundreds of questions at once into draft queue with duplicate protection.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="gap-1.5 text-xs text-primary border-primary/20 hover:bg-primary/10"
              >
                <Download className="w-3.5 h-3.5" /> Download Template
              </Button>
            </div>

            <form onSubmit={handleImport} className="space-y-4">
              {/* File Dropzone */}
              <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary/50 bg-secondary-bg/40 transition-colors">
                <FileSpreadsheet className="w-12 h-12 text-text-muted mx-auto mb-2" />
                <p className="text-sm font-semibold text-text-primary">
                  {file ? file.name : "Select an Excel or CSV file to upload"}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Supports .xlsx, .xls and .csv formatted spreadsheets
                </p>
                <label className="mt-4 inline-block">
                  <span className="px-4 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-text-primary hover:bg-secondary-bg cursor-pointer shadow-sm transition-colors">
                    Browse File
                  </span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Default Categorization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Select
                  label="Default Subject (Optional)"
                  value={defaultSubjectId}
                  onChange={(e) => setDefaultSubjectId(e.target.value)}
                  options={[
                    { value: "", label: "Auto-detect / None" },
                    ...subjects.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                />

                <Select
                  label="Default Exam (Optional)"
                  value={defaultExamId}
                  onChange={(e) => setDefaultExamId(e.target.value)}
                  options={[
                    { value: "", label: "Auto-detect / None" },
                    ...exams.map((exam) => ({ value: exam.id, label: exam.name })),
                  ]}
                />
              </div>

              {/* Submit button */}
              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!file || isPending}
                  className="w-full gap-2 text-xs bg-success hover:bg-success/90"
                >
                  <Upload className="w-4 h-4" />
                  {isPending ? "Validating & Importing..." : "Start Batch Import"}
                </Button>
              </div>
            </form>

            {/* Import Feedback */}
            {importResult && (
              <div className="mt-4 pt-4 border-t border-border">
                {importResult.error ? (
                  <Alert variant="error" title={importResult.error} />
                ) : (
                  <div className="space-y-3">
                    <Alert
                      variant="success"
                      title={`Import batch finished: ${importResult.importedCount} questions imported to Draft queue.`}
                    />

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-3 rounded-xl bg-secondary-bg border border-border">
                        <span className="text-text-muted block">Total Rows</span>
                        <strong className="text-sm text-text-primary">{importResult.totalRows}</strong>
                      </div>
                      <div className="p-3 rounded-xl bg-warning-light border border-warning/30">
                        <span className="text-warning block">Duplicates Skipped</span>
                        <strong className="text-sm text-warning">{importResult.duplicateCount}</strong>
                      </div>
                      <div className="p-3 rounded-xl bg-error-light border border-error/30">
                        <span className="text-error block">Invalid Rows</span>
                        <strong className="text-sm text-error">{importResult.invalidCount}</strong>
                      </div>
                    </div>

                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="p-3 rounded-xl bg-secondary-bg border border-border text-xs text-text-secondary space-y-1">
                        <span className="font-semibold text-text-primary block">Import Warnings:</span>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {importResult.errors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-2 text-right">
                      <Link
                        href="/admin/questions/review"
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Review Imported Drafts in Queue →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Specifications & Recent Batches (Right Column) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Format Reference Card */}
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Expected Column Headers
            </h3>
            <ul className="text-xs text-text-secondary space-y-1.5 pl-4 list-disc">
              <li><code className="text-primary font-semibold font-mono">Question</code>: The question statement</li>
              <li><code className="text-primary font-semibold font-mono">Option A</code> to <code className="text-primary font-semibold font-mono">Option D</code>: The 4 answers</li>
              <li><code className="text-primary font-semibold font-mono">Correct Option</code>: A, B, C, or D</li>
              <li><code className="text-primary font-semibold font-mono">Explanation</code>: Explanation for students</li>
              <li><code className="text-primary font-semibold font-mono">Difficulty</code>: Easy, Medium, or Hard</li>
              <li><code className="text-primary font-semibold font-mono">PYQ Exam</code> & <code className="text-primary font-semibold font-mono">PYQ Year</code>: Optional PYQ metadata</li>
            </ul>
          </Card>

          {/* Recent Batches Card */}
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-muted" /> Recent Import Batches
            </h3>

            {recentBatches.length === 0 ? (
              <p className="text-xs text-text-muted">No previous import batches logged yet.</p>
            ) : (
              <div className="space-y-2">
                {recentBatches.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl border border-border bg-secondary-bg/50 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text-primary truncate max-w-[180px]">
                        {b.file_name}
                      </span>
                      <Badge variant="primary" className="text-[10px]">
                        {b.file_type}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-text-muted text-[11px]">
                      <span>{b.valid_rows} imported / {b.total_rows} total</span>
                      <span>{new Date(b.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
