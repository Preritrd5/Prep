"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  FileQuestion,
  Plus,
  Upload,
  Sparkles,
  CheckCircle,
  Clock,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Trash2,
  CheckSquare,
  Square,
  AlertCircle,
} from "lucide-react";
import type { Question, Subject, DifficultyLevel, QuestionStatus, QuestionSource } from "@/lib/types";
import {
  adminUpdateQuestionStatusAction,
  adminBulkUpdateQuestionStatusAction,
  adminDeleteQuestionAction,
} from "@/app/actions/questions";

interface AdminQuestionsClientProps {
  questions: Question[];
  subjects: Subject[];
}

export default function AdminQuestionsClient({
  questions: initialQuestions,
  subjects,
}: AdminQuestionsClientProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | "All">("All");
  const [selectedSource, setSelectedSource] = useState<QuestionSource | "All">("All");
  const [selectedStatus, setSelectedStatus] = useState<QuestionStatus | "All">("All");

  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [revealedKeyId, setRevealedKeyId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter logic
  const filtered = questions.filter((q) => {
    if (searchQuery && !q.question_text.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedSubject !== "All" && q.subject_id !== selectedSubject) {
      return false;
    }
    if (selectedDifficulty !== "All" && q.difficulty !== selectedDifficulty) {
      return false;
    }
    if (selectedSource !== "All" && q.source_type !== selectedSource) {
      return false;
    }
    if (selectedStatus !== "All" && q.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((q) => q.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleStatusChange = (qId: string, newStatus: QuestionStatus) => {
    startTransition(async () => {
      const res = await adminUpdateQuestionStatusAction(qId, newStatus);
      if (res.error) {
        setMsg({ type: "error", text: res.error });
      } else {
        setQuestions((prev) =>
          prev.map((q) => (q.id === qId ? { ...q, status: newStatus } : q))
        );
        setMsg({ type: "success", text: `Question updated to ${newStatus}.` });
      }
    });
  };

  const handleBulkStatus = (status: QuestionStatus) => {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      const res = await adminBulkUpdateQuestionStatusAction(selectedIds, status);
      if (res.error) {
        setMsg({ type: "error", text: res.error });
      } else {
        setQuestions((prev) =>
          prev.map((q) => (selectedIds.includes(q.id) ? { ...q, status } : q))
        );
        setMsg({ type: "success", text: `${selectedIds.length} questions updated to ${status}.` });
        setSelectedIds([]);
      }
    });
  };

  const handleDelete = (qId: string) => {
    if (!confirm("Are you sure you want to permanently delete this question?")) return;
    startTransition(async () => {
      const res = await adminDeleteQuestionAction(qId);
      if (res.error) {
        setMsg({ type: "error", text: res.error });
      } else {
        setQuestions((prev) => prev.filter((q) => q.id !== qId));
        setSelectedIds((prev) => prev.filter((i) => i !== qId));
        setMsg({ type: "success", text: "Question deleted successfully." });
      }
    });
  };

  // Metrics
  const totalCount = questions.length;
  const publishedCount = questions.filter((q) => q.status === "Published").length;
  const pendingCount = questions.filter((q) => q.status === "Pending Review" || q.status === "Draft").length;
  const aiCount = questions.filter((q) => q.source_type === "AI Generated").length;
  const pyqCount = questions.filter((q) => q.source_type === "Previous Year Question").length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">MCQ Question Bank Repository</h1>
            <p className="text-sm text-slate-600 mt-1">
              Centralized repository for common competitive examination questions, PYQs, and AI-generated items.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/questions/create"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Create Question
            </Link>
            <Link
              href="/admin/questions/import"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 shadow-sm transition"
            >
              <Upload className="w-4 h-4" /> Bulk Import
            </Link>
            <Link
              href="/admin/questions/ai"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 shadow-sm transition"
            >
              <Sparkles className="w-4 h-4" /> AI Generator
            </Link>
            <Link
              href="/admin/questions/review"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 text-white font-medium text-sm hover:bg-amber-700 shadow-sm transition"
            >
              <Clock className="w-4 h-4" /> Review Queue ({pendingCount})
            </Link>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Questions</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totalCount}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-700 uppercase">Published</p>
            <p className="text-2xl font-bold text-emerald-800 mt-1">{publishedCount}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
            <p className="text-xs font-semibold text-amber-700 uppercase">Needs Review</p>
            <p className="text-2xl font-bold text-amber-800 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-violet-50 rounded-lg p-3 border border-violet-100">
            <p className="text-xs font-semibold text-violet-700 uppercase">AI Generated</p>
            <p className="text-2xl font-bold text-violet-800 mt-1">{aiCount}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 uppercase">Verified PYQs</p>
            <p className="text-2xl font-bold text-blue-800 mt-1">{pyqCount}</p>
          </div>
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm ${
            msg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search question text or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as any)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value as any)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Sources</option>
              <option value="Manual">Manual</option>
              <option value="Previous Year Question">Previous Year Question</option>
              <option value="AI Generated">AI Generated</option>
              <option value="CSV Import">CSV Import</option>
              <option value="Excel Import">Excel Import</option>
              <option value="Student Created">Student Created</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Archived">Archived</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Strip */}
        {selectedIds.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <span className="text-sm font-semibold text-indigo-900">
              {selectedIds.length} question(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatus("Published")}
                disabled={isPending}
                className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
              >
                Publish Selected
              </button>
              <button
                onClick={() => handleBulkStatus("Archived")}
                disabled={isPending}
                className="px-3 py-1.5 rounded-md bg-slate-600 text-white text-xs font-semibold hover:bg-slate-700 transition"
              >
                Archive Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-2 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-600 uppercase">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="text-slate-500 hover:text-slate-800"
              title="Select all"
            >
              {allSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
            </button>
            <span>Question Details ({filtered.length})</span>
          </div>
          <span>Status & Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileQuestion className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="font-medium text-base">No questions found</p>
            <p className="text-sm text-slate-400 mt-1">
              Try adjusting your search criteria or add new questions using the buttons above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((q) => {
              const isExpanded = expandedQuestionId === q.id;
              const isSelected = selectedIds.includes(q.id);
              const subjectName = q.subject?.name || subjects.find((s) => s.id === q.subject_id)?.name || "General";

              return (
                <div
                  key={q.id}
                  className={`p-4 transition hover:bg-slate-50/70 ${
                    isSelected ? "bg-indigo-50/40" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left details */}
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => toggleSelectOne(q.id)}
                        className="mt-1 text-slate-400 hover:text-slate-700"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                            {subjectName}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              q.difficulty === "Easy"
                                ? "bg-emerald-100 text-emerald-800"
                                : q.difficulty === "Medium"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {q.difficulty}
                          </span>

                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {q.source_type}
                          </span>

                          {q.pyq_exam_name && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                              {q.pyq_exam_name} {q.pyq_year ? `(${q.pyq_year})` : ""}
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-medium text-slate-900 leading-snug">
                          {q.question_text}
                        </p>

                        {q.source_reference && (
                          <p className="text-xs text-slate-500 italic">Ref: {q.source_reference}</p>
                        )}
                      </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-2">
                      <select
                        value={q.status}
                        onChange={(e) => handleStatusChange(q.id, e.target.value as QuestionStatus)}
                        disabled={isPending}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                          q.status === "Published"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : q.status === "Pending Review"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : q.status === "Draft"
                            ? "bg-slate-50 text-slate-700 border-slate-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                        <option value="Pending Review">Pending Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Archived">Archived</option>
                        <option value="Rejected">Rejected</option>
                      </select>

                      <button
                        onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title={isExpanded ? "Collapse preview" : "Expand options"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleDelete(q.id)}
                        disabled={isPending}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Options Preview */}
                  {isExpanded && (
                    <div className="mt-3 ml-7 pt-3 border-t border-slate-100 space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Answer Options:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(q.options || []).map((opt) => (
                          <div
                            key={opt.id}
                            className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2"
                          >
                            <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                              {opt.option_label}
                            </span>
                            <span>{opt.option_text}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          Answer key stored in protected <code className="text-indigo-600 font-mono">question_answer_keys</code> table.
                        </span>
                        <Link
                          href={`/admin/questions/create?edit=${q.id}`}
                          className="text-indigo-600 hover:underline font-medium"
                        >
                          Edit Question Details →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
