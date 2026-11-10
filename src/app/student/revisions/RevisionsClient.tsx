"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  HelpCircle,
  Plus,
  BookOpen,
  Filter,
} from "lucide-react";
import type { RevisionScheduleItem, RevisionConfidenceRating } from "@/lib/types";
import {
  studentUpdateRevisionAction,
  studentScheduleRevisionAction,
} from "@/app/actions/analytics";

interface RevisionsClientProps {
  revisions: RevisionScheduleItem[];
  availableTopics: { id: string; title: string; subjectName: string }[];
}

export default function RevisionsClient({
  revisions: initialRevisions,
  availableTopics,
}: RevisionsClientProps) {
  const [revisions, setRevisions] = useState<RevisionScheduleItem[]>(initialRevisions);
  const [filter, setFilter] = useState<"all" | "pending" | "overdue" | "completed">("pending");
  const [selectedRevForReview, setSelectedRevForReview] = useState<RevisionScheduleItem | null>(null);
  const [confidence, setConfidence] = useState<RevisionConfidenceRating>("Understood");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  // Manual form states
  const [manualTopicId, setManualTopicId] = useState(availableTopics[0]?.id || "");
  const [manualDate, setManualDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [manualNotes, setManualNotes] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const pendingRevs = revisions.filter((r) => !r.is_completed);
  const overdueRevs = pendingRevs.filter((r) => r.scheduled_date < todayStr);
  const completedRevs = revisions.filter((r) => r.is_completed);

  const displayedRevisions = revisions.filter((r) => {
    if (filter === "pending") return !r.is_completed;
    if (filter === "overdue") return !r.is_completed && r.scheduled_date < todayStr;
    if (filter === "completed") return r.is_completed;
    return true;
  });

  const handleCompleteRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRevForReview) return;
    setIsSubmitting(true);

    const fd = new FormData();
    fd.append("revisionId", selectedRevForReview.id);
    fd.append("confidenceRating", confidence);
    fd.append("notes", notes);

    const res = await studentUpdateRevisionAction(fd);
    setIsSubmitting(false);

    if (res.success) {
      setRevisions((prev) =>
        prev.map((r) =>
          r.id === selectedRevForReview.id
            ? { ...r, is_completed: true, completed_date: todayStr, confidence_rating: confidence }
            : r
        )
      );
      setSelectedRevForReview(null);
      setNotes("");
    }
  };

  const handleManualSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTopicId || !manualDate) return;
    setIsSubmitting(true);

    const fd = new FormData();
    fd.append("topicId", manualTopicId);
    fd.append("scheduledDate", manualDate);
    fd.append("notes", manualNotes);

    const res = await studentScheduleRevisionAction(fd);
    setIsSubmitting(false);

    if (res.success) {
      setShowManualModal(false);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <RotateCcw className="h-7 w-7 text-indigo-600" />
            Spaced Repetition & Revision Manager
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Adaptive memory consolidation using spaced intervals (1d, 3d, 7d, 14d, 30d) based on self-reported retention.
          </p>
        </div>

        <button
          onClick={() => setShowManualModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
        >
          <Plus className="h-4 w-4" />
          Schedule Revision
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-500">Upcoming Due</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{pendingRevs.length}</p>
          <span className="text-[10px] text-slate-400">Scheduled spaced reviews</span>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm">
          <span className="text-xs font-bold uppercase text-rose-700">Overdue</span>
          <p className="text-2xl font-black text-rose-900 mt-1">{overdueRevs.length}</p>
          <span className="text-[10px] text-rose-600">Missed scheduled review date</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <span className="text-xs font-bold uppercase text-emerald-700">Completed Cycles</span>
          <p className="text-2xl font-black text-emerald-900 mt-1">{completedRevs.length}</p>
          <span className="text-[10px] text-emerald-600">Reviewed & retained</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-500">Active Intervals</span>
          <p className="text-sm font-bold text-slate-900 mt-1">1d &rarr; 3d &rarr; 7d &rarr; 14d &rarr; 30d</p>
          <span className="text-[10px] text-slate-400">Adaptive spaced curve</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setFilter("pending")}
            className={`rounded-lg px-3 py-1.5 transition ${
              filter === "pending"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Due & Pending ({pendingRevs.length})
          </button>
          <button
            onClick={() => setFilter("overdue")}
            className={`rounded-lg px-3 py-1.5 transition ${
              filter === "overdue"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-rose-700 hover:text-rose-900"
            }`}
          >
            Overdue ({overdueRevs.length})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`rounded-lg px-3 py-1.5 transition ${
              filter === "completed"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Completed ({completedRevs.length})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 transition ${
              filter === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Revisions ({revisions.length})
          </button>
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline-block">
          Showing {displayedRevisions.length} records
        </span>
      </div>

      {/* Revision Items Table / List */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {displayedRevisions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {displayedRevisions.map((rev) => {
              const isOverdue = !rev.is_completed && rev.scheduled_date < todayStr;
              return (
                <div
                  key={rev.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                        Cycle #{rev.revision_number}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {rev.topic?.title || "Topic Revision"}
                      </h4>
                      {isOverdue && (
                        <span className="rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                          Overdue
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500">
                      {rev.topic?.chapter?.subject?.name || "Subject"} &rarr;{" "}
                      {rev.topic?.chapter?.title || "Chapter"}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        Due: <strong className="text-slate-700">{rev.scheduled_date}</strong>
                      </span>
                      {rev.completed_date && (
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Done: {rev.completed_date}
                        </span>
                      )}
                      {rev.confidence_rating && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700">
                          Rating: {rev.confidence_rating}
                        </span>
                      )}
                    </div>

                    {rev.notes && (
                      <p className="text-xs italic text-slate-600 bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100">
                        &ldquo;{rev.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Link
                      href={`/student/practice/topic?topicId=${rev.topic_id}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      Practice MCQs
                    </Link>

                    {!rev.is_completed ? (
                      <button
                        onClick={() => setSelectedRevForReview(rev)}
                        className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                      >
                        Record Review
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Reviewed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <RotateCcw className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No revisions found in this view.</p>
            <p className="text-xs text-slate-500 mt-1">
              Click &quot;Schedule Revision&quot; to queue a topic for spaced consolidation.
            </p>
          </div>
        )}
      </div>

      {/* RECORD REVIEW MODAL (MODULE 5) */}
      {selectedRevForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Record Revision Feedback
              </h3>
              <button
                onClick={() => setSelectedRevForReview(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                &times;
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-500">Topic:</p>
              <h4 className="text-sm font-bold text-slate-900">
                {selectedRevForReview.topic?.title || "Topic"}
              </h4>
            </div>

            <form onSubmit={handleCompleteRevision} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  How well do you remember the key concepts?
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setConfidence("Understood")}
                    className={`p-3 rounded-xl border text-left transition ${
                      confidence === "Understood"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="block font-bold">Understood</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Increase interval (+7d / +14d)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfidence("Needs more practice")}
                    className={`p-3 rounded-xl border text-left transition ${
                      confidence === "Needs more practice"
                        ? "border-amber-500 bg-amber-50 text-amber-900 font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="block font-bold">Needs Practice</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Review again in 2 days
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfidence("Not understood")}
                    className={`p-3 rounded-xl border text-left transition ${
                      confidence === "Not understood"
                        ? "border-rose-500 bg-rose-50 text-rose-900 font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="block font-bold">Not Understood</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Immediate review tomorrow (1d)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfidence("Completed")}
                    className={`p-3 rounded-xl border text-left transition ${
                      confidence === "Completed"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-900 font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="block font-bold">Completed</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Standard review finished
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Revision Notes (Formulas, tricky exceptions, mistakes):
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Remember to double-check shear force sign convention..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedRevForReview(null)}
                  className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  {isSubmitting ? "Saving..." : "Save & Update Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL SCHEDULE MODAL */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Schedule Topic Revision
              </h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleManualSchedule} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Select Syllabus Topic:
                </label>
                <select
                  value={manualTopicId}
                  onChange={(e) => setManualTopicId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {availableTopics.map((top) => (
                    <option key={top.id} value={top.id}>
                      {top.subjectName} &rarr; {top.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Target Revision Date:
                </label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Preparation Goal or Note:
                </label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="e.g. First spaced review after finishing chapter"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  {isSubmitting ? "Scheduling..." : "Confirm Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
