"use client";

import Link from "next/link";
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  AlertCircle,
  BarChart2,
  FileText,
  Lock,
} from "lucide-react";
import type { ExamResult, ExamAttempt, ExamTemplate } from "@/lib/types";

interface ExamResultClientProps {
  result: ExamResult | null;
  attempt: ExamAttempt;
  template: ExamTemplate;
  questionsReview: {
    questionText: string;
    options: { label: string; text: string }[];
    studentOption: string | null;
    correctOption: string;
    isCorrect: boolean;
    marksEarned: number;
    explanation: string | null;
    timeSpent: number;
    sectionName: string;
  }[];
}

export default function ExamResultClient({
  result,
  attempt,
  template,
  questionsReview,
}: ExamResultClientProps) {
  const isReleased =
    template.result_release_policy === "Immediate" ||
    template.results_published === true ||
    attempt.result_release_status === "Results Released";

  const totalScore = result?.total_score ?? attempt.score ?? 0;
  const maxMarks = result?.max_marks ?? attempt.max_marks ?? 100;
  const percentage = result?.percentage ?? attempt.percentage ?? 0;
  const accuracy = result?.accuracy_percent ?? 0;
  const correctCount = result?.correct_count ?? attempt.correct_count ?? 0;
  const incorrectCount = result?.incorrect_count ?? attempt.incorrect_count ?? 0;
  const unansweredCount = result?.unanswered_count ?? attempt.unanswered_count ?? 0;
  const totalQuestions = result?.total_questions ?? questionsReview.length;

  const isPassed = template.passing_marks !== null && template.passing_marks !== undefined
    ? totalScore >= template.passing_marks
    : percentage >= 40;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/exams/online"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Examination Portal
        </Link>
        <Link
          href="/student/exams/online/history"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <Clock className="w-3.5 h-3.5 text-slate-500" /> View All Attempts
        </Link>
      </div>

      {/* Main Scorecard Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
              {template.exam_category} • Attempt #{attempt.attempt_number}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">{template.title}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Submitted on {new Date(attempt.submitted_at || attempt.updated_at).toLocaleString()}
            </p>
          </div>

          <div className="text-right">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide inline-block ${
                isPassed
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-rose-100 text-rose-800 border border-rose-200"
              }`}
            >
              {isPassed ? "Qualified / Passed" : "Needs Improvement"}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Passing Mark: {template.passing_marks ?? "40%"}
            </p>
          </div>
        </div>

        {/* Vital Score Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Score</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              {totalScore} <span className="text-sm font-semibold text-slate-400">/ {maxMarks}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
            <span className="text-[10px] font-bold uppercase text-indigo-700 block">Percentage</span>
            <p className="text-3xl font-extrabold text-indigo-700 mt-1">{percentage}%</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <span className="text-[10px] font-bold uppercase text-emerald-700 block">Accuracy</span>
            <p className="text-3xl font-extrabold text-emerald-700 mt-1">{accuracy}%</p>
          </div>

          <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-center">
            <span className="text-[10px] font-bold uppercase text-purple-700 block">Correct Answers</span>
            <p className="text-3xl font-extrabold text-purple-700 mt-1">
              {correctCount} <span className="text-sm font-semibold text-purple-400">/ {totalQuestions}</span>
            </p>
          </div>
        </div>

        {/* Detailed Count Strips */}
        <div className="grid grid-cols-3 gap-3 text-center text-xs pt-2">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 font-semibold">
            {correctCount} Correct (+{result?.positive_marks || 0}m)
          </div>
          <div className="p-2.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-100 font-semibold">
            {incorrectCount} Incorrect (-{result?.negative_marks || 0}m)
          </div>
          <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
            {unansweredCount} Unattempted
          </div>
        </div>
      </div>

      {/* Section-wise Performance Breakdown */}
      {result?.section_scores_json && result.section_scores_json.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" /> Section-wise Performance Breakdown
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <th className="p-3">Section</th>
                  <th className="p-3">Questions</th>
                  <th className="p-3">Attempted</th>
                  <th className="p-3">Correct</th>
                  <th className="p-3">Incorrect</th>
                  <th className="p-3 font-bold">Marks Scored</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {result.section_scores_json.map((sec, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-semibold">{sec.section_name}</td>
                    <td className="p-3">{sec.total_questions}</td>
                    <td className="p-3">{sec.attempted}</td>
                    <td className="p-3 text-emerald-600 font-bold">{sec.correct}</td>
                    <td className="p-3 text-rose-600 font-bold">{sec.incorrect}</td>
                    <td className="p-3 font-bold">
                      {sec.score} / {sec.max_marks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Question-by-Question Review (MODULE 13) */}
      {!isReleased ? (
        <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 text-center">
          <Lock className="w-8 h-8 mx-auto text-amber-600 mb-1" />
          <h3 className="text-base font-bold">Question Review Pending Release</h3>
          <p className="text-xs text-amber-800 max-w-lg mx-auto">
            Your examination has been safely evaluated and scored. Individual answer keys and explanations will be unlocked once official results are declared by the administrator.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" /> Complete Question & Answer Review ({questionsReview.length})
            </h2>
          </div>

          <div className="space-y-4">
            {questionsReview.map((rev, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-xl shadow-sm border p-6 space-y-4 ${
                  rev.isCorrect
                    ? "border-emerald-300 bg-emerald-50/10"
                    : rev.studentOption === null
                    ? "border-slate-200"
                    : "border-rose-300 bg-rose-50/10"
                }`}
              >
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500 uppercase">
                      Question {idx + 1} of {questionsReview.length}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium">
                      {rev.sectionName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-semibold">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        rev.isCorrect
                          ? "bg-emerald-100 text-emerald-800"
                          : rev.studentOption === null
                          ? "bg-slate-100 text-slate-600"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {rev.isCorrect
                        ? `Correct (+${rev.marksEarned}m)`
                        : rev.studentOption === null
                        ? "Unattempted (0m)"
                        : `Incorrect (${rev.marksEarned}m)`}
                    </span>
                  </div>
                </div>

                {/* Question Statement */}
                <p className="text-sm font-semibold text-slate-900 leading-relaxed whitespace-pre-wrap">
                  {rev.questionText}
                </p>

                {/* Options Review */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {rev.options.map((opt) => {
                    const isKey = rev.correctOption === opt.label;
                    const isStudentPick = rev.studentOption === opt.label;

                    return (
                      <div
                        key={opt.label}
                        className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
                          isKey
                            ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-medium"
                            : isStudentPick && !rev.isCorrect
                            ? "bg-rose-50 border-rose-400 text-rose-950"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                            isKey
                              ? "bg-emerald-600 text-white"
                              : isStudentPick && !rev.isCorrect
                              ? "bg-rose-600 text-white"
                              : "bg-white border text-slate-700"
                          }`}
                        >
                          {opt.label}
                        </span>

                        <span className="flex-1 leading-snug">{opt.text}</span>

                        {isKey && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                            Key
                          </span>
                        )}
                        {isStudentPick && !rev.isCorrect && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-600 text-white">
                            Your Pick
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pedagogical Explanation */}
                {rev.explanation && (
                  <div className="p-3.5 rounded-lg bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-950 space-y-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-700 block">
                      Pedagogical Rationale:
                    </span>
                    <p className="leading-relaxed">{rev.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
