"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  ExternalLink,
  Tag,
  Star,
} from "lucide-react";
import { enrollStudentExamAction, removeStudentExamAction } from "@/app/actions/exams";
import type { Exam, StudentExam } from "@/lib/types";

interface ExamsClientProps {
  allExams: Exam[];
  enrolledExams: StudentExam[];
}

export default function ExamsClient({ allExams, enrolledExams }: ExamsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedExamToEnroll, setSelectedExamToEnroll] = useState<Exam | null>(null);
  const [targetDate, setTargetDate] = useState<string>("");
  const [priority, setPriority] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories = ["All", ...Array.from(new Set(allExams.map((e) => e.category)))];

  const enrolledExamIds = new Set(enrolledExams.map((se) => se.exam_id));

  const filteredExams = allExams.filter((e) => {
    if (selectedCategory === "All") return true;
    return e.category === selectedCategory;
  });

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamToEnroll) return;

    setIsPending(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("examId", selectedExamToEnroll.id);
    formData.append("targetDate", targetDate);
    formData.append("priority", priority.toString());
    formData.append("notes", notes);

    const res = await enrollStudentExamAction(formData);
    setIsPending(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setSelectedExamToEnroll(null);
      setTargetDate("");
      setNotes("");
    }
  };

  const handleRemove = async (examId: string) => {
    if (!confirm("Remove this examination from your active preparation list?")) return;
    setIsPending(true);
    const formData = new FormData();
    formData.append("examId", examId);
    await removeStudentExamAction(formData);
    setIsPending(false);
  };

  return (
    <div className="space-y-8">
      {/* Enrolled Examinations Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              My Selected Examinations ({enrolledExams.length})
            </h2>
            <p className="text-xs text-slate-500">
              Your active preparation targets. Set target dates and priorities to drive your study schedules.
            </p>
          </div>
        </div>

        {enrolledExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledExams.map((se) => {
              const exam = se.exam || allExams.find((e) => e.id === se.exam_id);
              if (!exam) return null;

              return (
                <div
                  key={se.id}
                  className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm hover:border-indigo-200 transition relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {exam.category}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          se.priority === 1
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : se.priority === 2
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Star className="h-2.5 w-2.5" />
                        Priority {se.priority}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-slate-900 leading-snug">
                      {exam.name}
                    </h3>
                    {exam.sub_category && (
                      <p className="text-xs text-slate-500 mt-0.5">{exam.sub_category}</p>
                    )}

                    <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          Target:{" "}
                          <strong className="text-slate-800">
                            {se.target_date
                              ? new Date(se.target_date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Not Set"}
                          </strong>
                        </span>
                      </div>
                      {se.notes && (
                        <p className="text-[11px] text-slate-500 italic truncate">
                          &quot;{se.notes}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/student/syllabus?examId=${exam.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Browse Syllabus
                      <ExternalLink className="h-3 w-3" />
                    </Link>

                    <button
                      onClick={() => handleRemove(exam.id)}
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-600 transition"
                      title="Remove exam"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">
              No Examinations Selected Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Select one or multiple competitive examinations below to activate your syllabus,
              routine planner, and preparation progress tracking.
            </p>
          </div>
        )}
      </section>

      {/* Available Examinations Directory */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200 pt-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Available Examination Catalog
            </h2>
            <p className="text-xs text-slate-500">
              Explore competitive examinations and enroll to unlock their full syllabus hierarchy.
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((exam) => {
            const isEnrolled = enrolledExamIds.has(exam.id);

            return (
              <div
                key={exam.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700">
                      <Tag className="h-3 w-3" />
                      {exam.category}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 font-bold">
                      {exam.code}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-slate-900 leading-snug">
                    {exam.name}
                  </h3>
                  {exam.sub_category && (
                    <p className="text-xs text-indigo-600 font-medium mt-0.5">
                      {exam.sub_category}
                    </p>
                  )}
                  {exam.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {exam.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {isEnrolled ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <Check className="h-4 w-4" />
                      Enrolled
                    </span>
                  ) : (
                    <button
                      onClick={() => setSelectedExamToEnroll(exam)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Enroll Exam
                    </button>
                  )}

                  <Link
                    href={`/student/syllabus?examId=${exam.id}`}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800"
                  >
                    View Syllabus
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Enrollment Modal */}
      {selectedExamToEnroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">
              Enroll in {selectedExamToEnroll.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure your personal target timeline and priority for this examination.
            </p>

            {errorMsg && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleEnrollSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Target Examination Date (Optional)
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Preparation Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value, 10))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                >
                  <option value={1}>Priority 1 (Highest Focus)</option>
                  <option value={2}>Priority 2 (Secondary Target)</option>
                  <option value={3}>Priority 3 (General Revision)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Personal Study Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Aiming for 65+ marks in Paper 1..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedExamToEnroll(null)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isPending ? "Enrolling..." : "Confirm Enrollment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
