"use client";

import Link from "next/link";
import {
  BarChart2,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import type { PracticeSession } from "@/lib/types";

interface PracticeHistoryClientProps {
  sessions: PracticeSession[];
  stats: {
    totalAttempts: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracyPercent: number;
  };
}

export default function PracticeHistoryClient({
  sessions,
  stats,
}: PracticeHistoryClientProps) {
  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Questions Attempted</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalAttempts}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <span className="text-xs font-semibold text-emerald-700 uppercase">Correct Answers</span>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{stats.correctAnswers}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <span className="text-xs font-semibold text-rose-700 uppercase">Incorrect Answers</span>
          <p className="text-2xl font-bold text-rose-600 mt-2">{stats.incorrectAnswers}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <span className="text-xs font-semibold text-indigo-700 uppercase">Overall Accuracy</span>
          <p className="text-2xl font-bold text-indigo-600 mt-2">{stats.accuracyPercent}%</p>
        </div>
      </div>

      {/* Sessions History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Practice Sessions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Log of your evaluated test and learn mode sessions.
            </p>
          </div>
          <Link
            href="/student/practice/topic"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 transition"
          >
            <BookOpen className="w-3.5 h-3.5" /> Start New Practice
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <BarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-base text-slate-800">No Practice Sessions Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Start practicing topics or exams in Learn or Test mode to build your performance log.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        sess.mode === "Test"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {sess.mode} Mode
                    </span>

                    <span className="text-xs text-slate-400">
                      {new Date(sess.started_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-800">
                    {sess.exam?.name || sess.subject?.name || "General Question Practice"}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Score</span>
                    <span className="text-sm font-bold text-slate-900">
                      {sess.correct_answers} / {sess.total_questions} ({sess.score_percent}%)
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      sess.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {sess.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
