"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  Play,
  ArrowLeft,
  ShieldAlert,
  HelpCircle,
  FileText,
} from "lucide-react";
import type { ExamTemplate, ExamAttempt } from "@/lib/types";
import { studentStartExamAttemptAction } from "@/app/actions/exams-online";

interface InstructionsClientProps {
  template: ExamTemplate;
  pastAttempts: ExamAttempt[];
}

export default function InstructionsClient({
  template,
  pastAttempts,
}: InstructionsClientProps) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const completedAttempts = pastAttempts.filter((a) =>
    ["Submitted", "Auto Submitted", "Evaluated", "Results Released"].includes(a.status)
  ).length;

  const attemptsRemaining =
    template.max_attempts > 0 ? Math.max(0, template.max_attempts - completedAttempts) : "Unlimited";

  const handleStartExam = () => {
    if (!agreed) {
      setErrorMsg("Please acknowledge and accept the examination instructions before proceeding.");
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      const res = await studentStartExamAttemptAction(template.id);
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.attemptId) {
        router.push(`/student/exams/online/attempt/${res.attemptId}`);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/student/exams/online"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Examination Portal
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Instructions Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
        <div>
          <span className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
            {template.exam_category} • {template.exam_type}
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">{template.title}</h1>
          <p className="text-sm text-slate-500 mt-1">{template.description}</p>
        </div>

        {/* Vital Exam Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Duration</span>
            <span className="text-lg font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
              <Clock className="w-4 h-4 text-slate-400" /> {template.duration_minutes} Mins
            </span>
          </div>

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Questions</span>
            <span className="text-lg font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
              <BookOpen className="w-4 h-4 text-slate-400" /> {template.total_questions} Questions
            </span>
          </div>

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Marks</span>
            <span className="text-lg font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
              <Award className="w-4 h-4 text-slate-400" /> {template.total_marks} Marks
            </span>
          </div>

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Attempts Left</span>
            <span className="text-lg font-bold text-indigo-600 mt-0.5">{attemptsRemaining}</span>
          </div>
        </div>

        {/* Marking Scheme Box */}
        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-2">
          <h3 className="font-bold uppercase tracking-wider text-[11px] text-indigo-900">
            Official Marking Scheme:
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Correct Answer: <strong>+{template.correct_marks} Marks</strong></span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>
                Incorrect Answer:{" "}
                <strong>
                  {template.has_negative_marking ? `-${template.negative_marks} Marks` : "0 (No penalty)"}
                </strong>
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
              <span>Unattempted Question: <strong>0 Marks</strong></span>
            </li>
          </ul>
        </div>

        {/* Detailed Instructions */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" /> General Candidate Instructions:
          </h3>

          <div className="text-xs text-slate-600 space-y-2 leading-relaxed bg-white border border-slate-200 rounded-xl p-4">
            <p>1. The countdown timer displayed on top is strictly synchronized with the server clock. When the timer reaches zero, the examination will automatically submit.</p>
            <p>2. You can navigate freely between questions using the Question Palette on the right.</p>
            <p>3. Question Palette Color Indicators:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 pb-1">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-slate-200 border border-slate-300" />
                <span className="text-[11px]">Not Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                <span className="text-[11px]">Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                <span className="text-[11px]">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                <span className="text-[11px]">Marked Review</span>
              </div>
            </div>
            <p>4. All selected answers autosave immediately to the server upon selection. You can change your chosen answer at any time prior to final submission.</p>
            <p>5. Closing or refreshing your browser window will NOT lose your progress or extend your examination timer.</p>
            {template.instructions && (
              <div className="mt-3 pt-3 border-t border-slate-100 whitespace-pre-line">
                <strong className="text-slate-800">Special Instructions from Examiner:</strong>
                <p className="mt-1">{template.instructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Declaration & Confirmation */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/60 transition">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <span className="text-xs text-slate-800 font-medium leading-snug">
              I have read, understood, and agree to abide by all the examination instructions stated above. I understand that the timer is server-enforced and my responses will be submitted automatically upon expiry.
            </span>
          </label>

          <div className="flex items-center justify-between">
            <Link
              href="/student/exams/online"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </Link>

            <button
              onClick={handleStartExam}
              disabled={!agreed || isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              {isPending ? "Starting Examination..." : "I am Ready — Begin Examination"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
