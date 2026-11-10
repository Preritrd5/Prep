"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  CheckSquare,
  Square,
  ArrowLeft,
  Sparkles,
  Upload,
  FileQuestion,
  AlertCircle,
  Eye,
  Layers,
} from "lucide-react";
import type { Question, QuestionStatus } from "@/lib/types";
import {
  adminUpdateQuestionStatusAction,
  adminBulkUpdateQuestionStatusAction,
  adminDeleteQuestionAction,
} from "@/app/actions/questions";

interface ReviewQueueClientProps {
  initialQuestions: Question[];
}

type TabType =
  | "All"
  | "Pending Review"
  | "Draft"
  | "AI Generated"
  | "Imported"
  | "Approved"
  | "Published"
  | "Rejected";

export default function ReviewQueueClient({ initialQuestions }: ReviewQueueClientProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [activeTab, setActiveTab] = useState<TabType>("Pending Review");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [bannerMsg, setBannerMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter based on activeTab
  const filteredQuestions = questions.filter((q) => {
    if (activeTab === "All") return true;
    if (activeTab === "Pending Review") return q.status === "Pending Review";
    if (activeTab === "Draft") return q.status === "Draft";
    if (activeTab === "AI Generated") return q.source_type === "AI Generated";
    if (activeTab === "Imported") return q.source_type === "CSV Import" || q.source_type === "Excel Import";
    if (activeTab === "Approved") return q.status === "Approved";
    if (activeTab === "Published") return q.status === "Published";
    if (activeTab === "Rejected") return q.status === "Rejected";
    return true;
  });

  const allSelected = filteredQuestions.length > 0 && selectedIds.length === filteredQuestions.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQuestions.map((q) => q.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleUpdateStatus = (qId: string, status: QuestionStatus) => {
    startTransition(async () => {
      const res = await adminUpdateQuestionStatusAction(qId, status);
      if (res.error) {
        setBannerMsg({ type: "error", text: res.error });
      } else {
        setQuestions((prev) =>
          prev.map((q) => (q.id === qId ? { ...q, status } : q))
        );
        setBannerMsg({ type: "success", text: `Question updated to ${status}.` });
      }
    });
  };

  const handleBulkStatus = (status: QuestionStatus) => {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      const res = await adminBulkUpdateQuestionStatusAction(selectedIds, status);
      if (res.error) {
        setBannerMsg({ type: "error", text: res.error });
      } else {
        setQuestions((prev) =>
          prev.map((q) => (selectedIds.includes(q.id) ? { ...q, status } : q))
        );
        setBannerMsg({
          type: "success",
          text: `${selectedIds.length} questions updated to ${status}.`,
        });
        setSelectedIds([]);
      }
    });
  };

  const handleDelete = (qId: string) => {
    if (!confirm("Are you sure you want to permanently delete this question?")) return;
    startTransition(async () => {
      const res = await adminDeleteQuestionAction(qId);
      if (res.error) {
        setBannerMsg({ type: "error", text: res.error });
      } else {
        setQuestions((prev) => prev.filter((q) => q.id !== qId));
        setSelectedIds((prev) => prev.filter((i) => i !== qId));
        setBannerMsg({ type: "success", text: "Question deleted successfully." });
      }
    });
  };

  // Counts for tabs
  const pendingCount = questions.filter((q) => q.status === "Pending Review").length;
  const draftCount = questions.filter((q) => q.status === "Draft").length;
  const aiCount = questions.filter((q) => q.source_type === "AI Generated").length;
  const importCount = questions.filter((q) => q.source_type === "CSV Import" || q.source_type === "Excel Import").length;

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/questions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Question Bank
        </Link>
      </div>

      {bannerMsg && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm ${
            bannerMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{bannerMsg.text}</span>
          <button onClick={() => setBannerMsg(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {(
            [
              { id: "Pending Review", label: `Pending Review (${pendingCount})`, icon: Clock },
              { id: "Draft", label: `Drafts (${draftCount})`, icon: FileQuestion },
              { id: "AI Generated", label: `AI Generated (${aiCount})`, icon: Sparkles },
              { id: "Imported", label: `Imported (${importCount})`, icon: Upload },
              { id: "Published", label: "Published", icon: CheckCircle },
              { id: "Approved", label: "Approved", icon: CheckCircle },
              { id: "Rejected", label: "Rejected", icon: XCircle },
              { id: "All", label: "All Items", icon: Layers },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setSelectedIds([]);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk Action Strip */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <span className="text-xs font-semibold text-indigo-900">
            {selectedIds.length} question(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatus("Published")}
              disabled={isPending}
              className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
            >
              Approve & Publish Selected
            </button>
            <button
              onClick={() => handleBulkStatus("Rejected")}
              disabled={isPending}
              className="px-3 py-1.5 rounded-md bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition"
            >
              Reject Selected
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

      {/* Review Cards Grid */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="font-medium text-base text-slate-800">Queue is Clear</p>
          <p className="text-xs text-slate-400 mt-1">
            No questions currently matching the &quot;{activeTab}&quot; filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <button onClick={toggleSelectAll} className="flex items-center gap-2 hover:text-slate-800">
              {allSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
              <span>Select all in this view</span>
            </button>
            <span>Showing {filteredQuestions.length} questions</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredQuestions.map((q) => {
              const isSelected = selectedIds.includes(q.id);
              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-xl shadow-sm border p-5 transition space-y-4 ${
                    isSelected ? "border-indigo-400 bg-indigo-50/20" : "border-slate-200"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSelectOne(q.id)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          q.status === "Published"
                            ? "bg-emerald-100 text-emerald-800"
                            : q.status === "Pending Review"
                            ? "bg-amber-100 text-amber-800"
                            : q.status === "Rejected"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {q.status}
                      </span>

                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                        {q.source_type}
                      </span>

                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
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

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2">
                      {q.status !== "Published" && (
                        <button
                          onClick={() => handleUpdateStatus(q.id, "Published")}
                          disabled={isPending}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve & Publish
                        </button>
                      )}

                      {q.status !== "Rejected" && (
                        <button
                          onClick={() => handleUpdateStatus(q.id, "Rejected")}
                          disabled={isPending}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-rose-300 text-rose-700 text-xs font-semibold hover:bg-rose-50 transition"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(q.id)}
                        disabled={isPending}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Stem */}
                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {q.question_text}
                  </p>

                  {/* 4 Options Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(q.options || []).map((opt) => (
                      <div
                        key={opt.id}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center gap-2"
                      >
                        <span className="w-5 h-5 rounded bg-white border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700">
                          {opt.option_label}
                        </span>
                        <span>{opt.option_text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Source Reference Footer */}
                  {q.source_reference && (
                    <p className="text-xs text-slate-500 italic">
                      Source: {q.source_reference}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
