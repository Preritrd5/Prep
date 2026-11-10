"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, BookOpen, Trash2 } from "lucide-react";
import type { Question } from "@/lib/types";
import PracticeRunner from "@/components/practice/PracticeRunner";

interface BookmarksClientProps {
  bookmarkedQuestions: Question[];
  bookmarkedIds: string[];
}

export default function BookmarksClient({
  bookmarkedQuestions,
  bookmarkedIds,
}: BookmarksClientProps) {
  const [isPracticing, setIsPracticing] = useState(false);

  if (bookmarkedQuestions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
        <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-semibold text-lg text-slate-800">No Bookmarked Questions</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          While practicing topics or exams, click the bookmark icon on any challenging question to save it here for targeted revision.
        </p>
        <div className="mt-5">
          <Link
            href="/student/practice/topic"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 transition"
          >
            Start Topic Practice →
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
          ← Exit Practice Runner
        </button>
        <PracticeRunner
          questions={bookmarkedQuestions}
          title="Bookmarked Questions Practice Session"
          subtitle="Focused revision session covering all saved questions."
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
            Saved Bookmarks ({bookmarkedQuestions.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Questions flagged for personal review and revision.
          </p>
        </div>
        <button
          onClick={() => setIsPracticing(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 transition shadow-sm"
        >
          <BookOpen className="w-4 h-4" /> Practice All Bookmarks ({bookmarkedQuestions.length})
        </button>
      </div>

      {/* Bookmarked Questions Cards */}
      <div className="space-y-3">
        {bookmarkedQuestions.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400">#{idx + 1}</span>
              <div className="flex items-center gap-2">
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
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                  {q.source_type}
                </span>
              </div>
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
