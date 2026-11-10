"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, BookOpen, CheckCircle } from "lucide-react";
import type { Question } from "@/lib/types";
import PracticeRunner from "@/components/practice/PracticeRunner";

interface IncorrectQuestionsClientProps {
  incorrectQuestions: Question[];
  bookmarkedIds: string[];
}

export default function IncorrectQuestionsClient({
  incorrectQuestions,
  bookmarkedIds,
}: IncorrectQuestionsClientProps) {
  const [isPracticing, setIsPracticing] = useState(false);

  if (incorrectQuestions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
        <h3 className="font-semibold text-lg text-slate-800">Clean Slate — No Incorrect Questions!</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          You currently have zero uncorrected mistakes logged in your practice sessions. Excellent accuracy!
        </p>
        <div className="mt-5">
          <Link
            href="/student/practice/topic"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 transition"
          >
            Practice New Topics →
          </Link>
        </div>
      </div>
    );
  }

  if (isPracticing) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setIsPracticing(false)}
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          ← Exit Mistakes Practice
        </button>
        <PracticeRunner
          questions={incorrectQuestions}
          title="Mistake Notebook Drill Session"
          subtitle="Re-attempt past incorrect questions in Learn Mode to achieve 100% conceptual mastery."
          initialMode="Learn"
          bookmarkedQuestionIds={bookmarkedIds}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Mistake Notebook ({incorrectQuestions.length} Items)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Questions answered incorrectly in previous practice attempts.
          </p>
        </div>
        <button
          onClick={() => setIsPracticing(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white font-medium text-xs hover:bg-rose-700 transition shadow-sm"
        >
          <RotateCcw className="w-4 h-4" /> Re-Attempt Past Mistakes ({incorrectQuestions.length})
        </button>
      </div>

      {/* Questions list */}
      <div className="space-y-3">
        {incorrectQuestions.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400">Mistake #{idx + 1}</span>
              <span
                className={`px-2 py-0.5 rounded font-semibold ${
                  q.difficulty === "Easy"
                    ? "bg-emerald-50 text-emerald-700"
                    : q.difficulty === "Medium"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {q.difficulty}
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-900 leading-snug">{q.question_text}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {(q.options || []).map((opt) => (
                <div
                  key={opt.id}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded bg-white border flex items-center justify-center font-bold text-slate-800">
                    {opt.option_label}
                  </span>
                  <span>{opt.option_text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
