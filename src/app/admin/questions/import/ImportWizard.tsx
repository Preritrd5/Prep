"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  FileText,
  Clock,
  ArrowLeft,
  Layers,
  Copy,
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
    // Generate clean CSV template string
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
        <Link
          href="/admin/questions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Question Bank
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Form (Left Column) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Upload Spreadsheet (.xlsx / .csv)</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Import hundreds of questions at once into draft queue with duplicate protection.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition"
              >
                <Download className="w-3.5 h-3.5" /> Download Template
              </button>
            </div>

            <form onSubmit={handleImport} className="space-y-4">
              {/* File Dropzone */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-400 bg-slate-50/50 transition">
                <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">
                  {file ? file.name : "Select an Excel or CSV file to upload"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports .xlsx, .xls and .csv formatted spreadsheets
                </p>
                <label className="mt-4 inline-block">
                  <span className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm">
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
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Default Subject (Optional)
                  </label>
                  <select
                    value={defaultSubjectId}
                    onChange={(e) => setDefaultSubjectId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Auto-detect / None</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Default Exam (Optional)
                  </label>
                  <select
                    value={defaultExamId}
                    onChange={(e) => setDefaultExamId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Auto-detect / None</option>
                    {exams.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={!file || isPending}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {isPending ? "Validating & Importing..." : "Start Batch Import"}
                </button>
              </div>
            </form>

            {/* Import Feedback */}
            {importResult && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                {importResult.error ? (
                  <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{importResult.error}</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>
                        Import batch finished: <strong>{importResult.importedCount}</strong> questions imported to Draft queue.
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 block">Total Rows</span>
                        <strong className="text-sm text-slate-800">{importResult.totalRows}</strong>
                      </div>
                      <div className="p-2 rounded bg-amber-50 border border-amber-200">
                        <span className="text-amber-700 block">Duplicates Skipped</span>
                        <strong className="text-sm text-amber-800">{importResult.duplicateCount}</strong>
                      </div>
                      <div className="p-2 rounded bg-rose-50 border border-rose-200">
                        <span className="text-rose-700 block">Invalid Rows</span>
                        <strong className="text-sm text-rose-800">{importResult.invalidCount}</strong>
                      </div>
                    </div>

                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                        <span className="font-semibold text-slate-800 block">Import Warnings:</span>
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
                        className="text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        Review Imported Drafts in Queue →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Specifications & Recent Batches (Right Column) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Format Reference Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> Expected Column Headers
            </h3>
            <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
              <li><code className="text-indigo-600 font-semibold font-mono">Question</code>: The question statement</li>
              <li><code className="text-indigo-600 font-semibold font-mono">Option A</code> to <code className="text-indigo-600 font-semibold font-mono">Option D</code>: The 4 answers</li>
              <li><code className="text-indigo-600 font-semibold font-mono">Correct Option</code>: A, B, C, or D</li>
              <li><code className="text-indigo-600 font-semibold font-mono">Explanation</code>: Explanation for students</li>
              <li><code className="text-indigo-600 font-semibold font-mono">Difficulty</code>: Easy, Medium, or Hard</li>
              <li><code className="text-indigo-600 font-semibold font-mono">PYQ Exam</code> & <code className="text-indigo-600 font-semibold font-mono">PYQ Year</code>: Optional PYQ metadata</li>
            </ul>
          </div>

          {/* Recent Batches Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" /> Recent Import Batches
            </h3>

            {recentBatches.length === 0 ? (
              <p className="text-xs text-slate-400">No previous import batches logged yet.</p>
            ) : (
              <div className="space-y-2">
                {recentBatches.map((b) => (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                        {b.file_name}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        {b.file_type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>{b.valid_rows} imported / {b.total_rows} total</span>
                      <span>{new Date(b.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
