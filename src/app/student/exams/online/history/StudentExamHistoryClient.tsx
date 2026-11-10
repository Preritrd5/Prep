"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Award,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Search,
  Filter,
  BookOpen,
  Calendar,
} from "lucide-react";
import type { ExamAttempt } from "@/lib/types";

interface StudentExamHistoryClientProps {
  attempts: ExamAttempt[];
}

export default function StudentExamHistoryClient({
  attempts,
}: StudentExamHistoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = attempts.filter((att) => {
    if (searchQuery && !att.template?.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== "All" && att.status !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/exams/online"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Available Examinations
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by examination title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold bg-white text-slate-700 focus:outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="Submitted">Submitted</option>
          <option value="Auto Submitted">Auto Submitted</option>
          <option value="In Progress">In Progress</option>
          <option value="Evaluated">Evaluated</option>
          <option value="Results Released">Results Released</option>
        </select>
      </div>

      {/* Attempts List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-base text-slate-800">No Examination Attempts Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            You have not attempted any examinations matching your filters yet.
          </p>
          <div className="mt-4">
            <Link
              href="/student/exams/online"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 transition"
            >
              Browse Available Examinations →
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {filtered.map((att) => {
            const isCompleted = ["Submitted", "Auto Submitted", "Evaluated", "Results Released"].includes(att.status);

            return (
              <div
                key={att.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                      {att.template?.exam_category}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Attempt #{att.attempt_number}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        att.status === "In Progress"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {att.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {att.template?.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(att.started_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {att.time_taken_seconds > 0 ? `${Math.round(att.time_taken_seconds / 60)} mins` : "In Progress"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {isCompleted && (
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-bold uppercase">Score</span>
                      <span className="text-base font-extrabold text-slate-900">
                        {att.score} <span className="text-xs text-slate-400">/ {att.max_marks}</span>
                      </span>
                      <span className="text-xs text-indigo-600 block font-semibold">
                        {att.percentage}%
                      </span>
                    </div>
                  )}

                  <div>
                    {att.status === "In Progress" ? (
                      <Link
                        href={`/student/exams/online/attempt/${att.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition"
                      >
                        Resume Attempt
                      </Link>
                    ) : (
                      <Link
                        href={`/student/exams/online/result/${att.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition"
                      >
                        View Full Result →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
