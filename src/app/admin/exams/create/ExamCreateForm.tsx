"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  BookOpen,
  Layers,
  Clock,
  Award,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import type {
  Exam,
  Subject,
  ExamCategory,
  OnlineExamType,
  ResultReleasePolicy,
  ExamTemplateStatus,
  Question,
} from "@/lib/types";
import { adminCreateExamTemplateAction } from "@/app/actions/exams-online";

interface ExamCreateFormProps {
  exams: Exam[];
  subjects: Subject[];
  availableQuestions: Question[];
}

export default function ExamCreateForm({
  exams,
  subjects,
  availableQuestions,
}: ExamCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [examCategory, setExamCategory] = useState<ExamCategory>("UPSC");
  const [examId, setExamId] = useState("");
  const [examType, setExamType] = useState<OnlineExamType>("Full-Length Mock Test");
  const [instructions, setInstructions] = useState(
    "1. Test duration is timed according to standard official guidelines.\n2. Mark questions for review and navigate using the question palette.\n3. Negative marking applies for incorrect options as specified.\n4. Click Submit Examination when completed."
  );
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [totalMarks, setTotalMarks] = useState(20);
  const [passingMarks, setPassingMarks] = useState<number | "">("");
  const [maxAttempts, setMaxAttempts] = useState(2);
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);
  const [randomizeOptions, setRandomizeOptions] = useState(false);
  const [hasNegativeMarking, setHasNegativeMarking] = useState(true);
  const [correctMarks, setCorrectMarks] = useState(2.0);
  const [negativeMarks, setNegativeMarks] = useState(0.66);
  const [resultReleasePolicy, setResultReleasePolicy] = useState<ResultReleasePolicy>("Immediate");
  const [status, setStatus] = useState<ExamTemplateStatus>("Published");

  // Sections State
  const [sections, setSections] = useState<{ name: string; questionCount: number; marks: number }[]>([
    { name: "General Section", questionCount: 10, marks: 20 },
  ]);

  const addSection = () => {
    setSections([...sections, { name: `Section ${sections.length + 1}`, questionCount: 5, marks: 10 }]);
  };

  const removeSection = (index: number) => {
    if (sections.length <= 1) return;
    setSections(sections.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("exam_category", examCategory);
    if (examId) fd.append("exam_id", examId);
    fd.append("exam_type", examType);
    fd.append("instructions", instructions);
    fd.append("duration_minutes", durationMinutes.toString());
    fd.append("total_questions", totalQuestions.toString());
    fd.append("total_marks", totalMarks.toString());
    if (passingMarks !== "") fd.append("passing_marks", passingMarks.toString());
    fd.append("max_attempts", maxAttempts.toString());
    fd.append("randomize_questions", randomizeQuestions ? "true" : "false");
    fd.append("randomize_options", randomizeOptions ? "true" : "false");
    fd.append("has_negative_marking", hasNegativeMarking ? "true" : "false");
    fd.append("correct_marks", correctMarks.toString());
    fd.append("negative_marks", negativeMarks.toString());
    fd.append("result_release_policy", resultReleasePolicy);
    fd.append("status", status);

    startTransition(async () => {
      const res = await adminCreateExamTemplateAction(fd);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        router.push("/admin/exams/manage");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/exams/manage"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Examinations List
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Core Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" /> Basic Information
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Examination Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. UPSC CSE Prelims 2026 — All India Mock Test #1"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Description / Examination Scope
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of coverage, syllabus topics, and target aspirants..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Examination Category
              </label>
              <select
                value={examCategory}
                onChange={(e) => setExamCategory(e.target.value as ExamCategory)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none"
              >
                <option value="UPSC">UPSC</option>
                <option value="KAS">KAS</option>
                <option value="GATE">GATE</option>
                <option value="Railway Examinations">Railway Examinations</option>
                <option value="KEA Examinations">KEA Examinations</option>
                <option value="AE Civil Engineering">AE Civil Engineering</option>
                <option value="General Knowledge">General Knowledge</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Examination Type
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as OnlineExamType)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none"
              >
                <option value="Full-Length Mock Test">Full-Length Mock Test</option>
                <option value="Sectional Test">Sectional Test</option>
                <option value="Subject Test">Subject Test</option>
                <option value="Chapter Test">Chapter Test</option>
                <option value="Previous Year Question Test">Previous Year Question Test</option>
                <option value="Custom Test">Custom Test</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Linked Syllabus Exam
              </label>
              <select
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none"
              >
                <option value="">Select official exam</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Timing, Marks & Negative Rules (Module 2) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" /> Timing, Marks & Evaluation Rules
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                required
                min={5}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Total Questions
              </label>
              <input
                type="number"
                required
                min={1}
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Total Marks
              </label>
              <input
                type="number"
                required
                min={1}
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Max Attempts Allowed
              </label>
              <input
                type="number"
                min={1}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Marks per Correct Answer
              </label>
              <input
                type="number"
                step="0.1"
                value={correctMarks}
                onChange={(e) => setCorrectMarks(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Negative Marks per Incorrect
              </label>
              <input
                type="number"
                step="0.01"
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Result Release Policy
              </label>
              <select
                value={resultReleasePolicy}
                onChange={(e) => setResultReleasePolicy(e.target.value as ResultReleasePolicy)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm bg-white"
              >
                <option value="Immediate">Immediate (On Submit)</option>
                <option value="Delayed">Delayed Release</option>
                <option value="Admin Controlled">Admin Controlled Review</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={randomizeQuestions}
                onChange={(e) => setRandomizeQuestions(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span>Randomize Question Order per Student Attempt</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={randomizeOptions}
                onChange={(e) => setRandomizeOptions(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span>Randomize Answer Options (A/B/C/D) Order</span>
            </label>
          </div>
        </div>

        {/* Card 3: Instructions & Publication */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" /> Instructions & Publication
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Examination Instructions (Shown on pre-test screen)
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ExamTemplateStatus)}
                className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white text-slate-700"
              >
                <option value="Published">Published (Active for Students)</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isPending ? "Creating Examination..." : "Save & Publish Examination"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
