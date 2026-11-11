"use client";

import { Card, Badge, Button, Alert, EmptyState } from "@/components/ui";
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
      <div>
        <Link href="/admin/questions">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-text-muted hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" /> Back to Question Bank
          </Button>
        </Link>
      </div>

      {bannerMsg && (
        <Alert
          variant={bannerMsg.type === "success" ? "success" : "error"}
          title={bannerMsg.text}
          onClose={() => setBannerMsg(null)}
        />
      )}

      {/* Tabs */}
      <Card className="p-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
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
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary hover:bg-secondary-bg"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Bulk Action Strip */}
      {selectedIds.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold text-text-primary">
            {selectedIds.length} question(s) selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleBulkStatus("Published")}
              disabled={isPending}
              className="text-xs bg-success hover:bg-success/90"
            >
              Approve & Publish Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkStatus("Rejected")}
              disabled={isPending}
              className="text-xs text-error border-error/30 hover:bg-error-light"
            >
              Reject Selected
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="text-xs text-text-muted hover:text-text-primary"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Review Cards Grid */}
      {filteredQuestions.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="Queue is Clear"
          description={`No questions currently matching the "${activeTab}" filter.`}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1 text-xs text-text-muted">
            <button onClick={toggleSelectAll} className="flex items-center gap-2 hover:text-text-primary transition-colors">
              {allSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
              <span>Select all in this view</span>
            </button>
            <span>Showing {filteredQuestions.length} questions</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredQuestions.map((q) => {
              const isSelected = selectedIds.includes(q.id);
              return (
                <Card
                  key={q.id}
                  className={`p-5 transition-all space-y-4 ${
                    isSelected ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => toggleSelectOne(q.id)}
                        className="text-text-muted hover:text-text-primary"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <Badge
                        variant={
                          q.status === "Published"
                            ? "success"
                            : q.status === "Pending Review"
                            ? "warning"
                            : q.status === "Rejected"
                            ? "error"
                            : "secondary"
                        }
                      >
                        {q.status}
                      </Badge>

                      <Badge variant="info">
                        {q.source_type}
                      </Badge>

                      <Badge
                        variant={
                          q.difficulty === "Easy"
                            ? "success"
                            : q.difficulty === "Medium"
                            ? "warning"
                            : "error"
                        }
                      >
                        {q.difficulty}
                      </Badge>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2">
                      {q.status !== "Published" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleUpdateStatus(q.id, "Published")}
                          disabled={isPending}
                          className="gap-1 text-xs bg-success hover:bg-success/90"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve & Publish
                        </Button>
                      )}

                      {q.status !== "Rejected" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(q.id, "Rejected")}
                          disabled={isPending}
                          className="gap-1 text-xs text-error border-error/30 hover:bg-error-light"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </Button>
                      )}

                      <button
                        onClick={() => handleDelete(q.id)}
                        disabled={isPending}
                        className="p-1.5 rounded-xl text-text-muted hover:text-error hover:bg-error-light transition-colors"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Stem */}
                  <p className="text-sm font-semibold text-text-primary leading-snug">
                    {q.question_text}
                  </p>

                  {/* 4 Options Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(q.options || []).map((opt) => (
                      <div
                        key={opt.id}
                        className="p-2.5 rounded-xl bg-secondary-bg border border-border text-xs text-text-primary flex items-center gap-2"
                      >
                        <span className="w-5 h-5 rounded-md bg-card border border-border flex items-center justify-center font-bold text-xs text-text-primary">
                          {opt.option_label}
                        </span>
                        <span>{opt.option_text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Source Reference Footer */}
                  {q.source_reference && (
                    <p className="text-xs text-text-muted italic">
                      Source: {q.source_reference}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
