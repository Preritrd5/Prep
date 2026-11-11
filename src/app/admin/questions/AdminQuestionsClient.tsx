"use client";

import { PageHeader, Card, Badge, Button, Alert, StatCard, EmptyState } from "@/components/ui";
import { useState, useTransition } from "react";
import Link from "next/link";
import {
  FileQuestion,
  Plus,
  Upload,
  Sparkles,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckSquare,
  Square,
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
      <PageHeader
        title="MCQ Question Bank Repository"
        description="Centralized repository for common competitive examination questions, PYQs, and AI-generated items."
        breadcrumbs={[
          { label: "Admin Console", href: "/admin/dashboard" },
          { label: "Questions" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/questions/create">
              <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                <Plus className="w-4 h-4" /> Create Question
              </Button>
            </Link>
            <Link href="/admin/questions/import">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-success border-success/30 hover:bg-success-light">
                <Upload className="w-4 h-4" /> Bulk Import
              </Button>
            </Link>
            <Link href="/admin/questions/ai">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-accent border-accent/30 hover:bg-accent/10">
                <Sparkles className="w-4 h-4" /> AI Generator
              </Button>
            </Link>
            <Link href="/admin/questions/review">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-warning border-warning/30 hover:bg-warning-light">
                <Clock className="w-4 h-4" /> Review Queue ({pendingCount})
              </Button>
            </Link>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard title="Total Questions" value={totalCount} icon={FileQuestion} />
        <StatCard title="Published" value={publishedCount} icon={FileQuestion} />
        <StatCard title="Needs Review" value={pendingCount} icon={Clock} />
        <StatCard title="AI Generated" value={aiCount} icon={Sparkles} />
        <StatCard title="Verified PYQs" value={pyqCount} icon={FileQuestion} />
      </div>

      {msg && (
        <Alert
          variant={msg.type === "success" ? "success" : "error"}
          title={msg.text}
          onClose={() => setMsg(null)}
        />
      )}

      {/* Filter & Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search question text or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-xl text-xs bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="border border-border rounded-xl px-3 py-2 text-xs bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
              className="border border-border rounded-xl px-3 py-2 text-xs bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value as any)}
              className="border border-border rounded-xl px-3 py-2 text-xs bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
              className="border border-border rounded-xl px-3 py-2 text-xs bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                Publish Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatus("Archived")}
                disabled={isPending}
                className="text-xs"
              >
                Archive Selected
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
      </Card>

      {/* Questions List */}
      <Card className="overflow-hidden p-0">
        <div className="bg-secondary-bg/50 border-b border-border px-4 py-3 flex items-center justify-between text-xs font-semibold text-text-secondary uppercase">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="text-text-muted hover:text-text-primary"
              title="Select all"
            >
              {allSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
            </button>
            <span>Question Details ({filtered.length})</span>
          </div>
          <span>Status & Actions</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={FileQuestion}
            title="No questions found"
            description="Try adjusting your search criteria or add new questions using the buttons above."
          />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((q) => {
              const isExpanded = expandedQuestionId === q.id;
              const isSelected = selectedIds.includes(q.id);
              const subjectName = q.subject?.name || subjects.find((s) => s.id === q.subject_id)?.name || "General";

              return (
                <div
                  key={q.id}
                  className={`p-4 transition-colors hover:bg-secondary-bg/30 ${
                    isSelected ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left details */}
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => toggleSelectOne(q.id)}
                        className="mt-1 text-text-muted hover:text-text-primary"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">
                            {subjectName}
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

                          <Badge variant="info">
                            {q.source_type}
                          </Badge>

                          {q.pyq_exam_name && (
                            <Badge variant="primary">
                              {q.pyq_exam_name} {q.pyq_year ? `(${q.pyq_year})` : ""}
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm font-medium text-text-primary leading-snug">
                          {q.question_text}
                        </p>

                        {q.source_reference && (
                          <p className="text-xs text-text-muted italic">Ref: {q.source_reference}</p>
                        )}
                      </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-2">
                      <select
                        value={q.status}
                        onChange={(e) => handleStatusChange(q.id, e.target.value as QuestionStatus)}
                        disabled={isPending}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-border bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                        className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-secondary-bg transition-colors"
                        title={isExpanded ? "Collapse preview" : "Expand options"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

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

                  {/* Expanded Options Preview */}
                  {isExpanded && (
                    <div className="mt-3 ml-7 pt-3 border-t border-border space-y-2">
                      <p className="text-xs font-semibold text-text-muted uppercase">Answer Options:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(q.options || []).map((opt) => (
                          <div
                            key={opt.id}
                            className="p-2 rounded-xl bg-secondary-bg border border-border text-xs text-text-primary flex items-center gap-2"
                          >
                            <span className="font-bold text-text-primary bg-card px-2 py-0.5 rounded-lg border border-border text-[11px]">
                              {opt.option_label}
                            </span>
                            <span>{opt.option_text}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-text-muted">
                          Answer key stored in protected <code className="text-primary font-mono">question_answer_keys</code> table.
                        </span>
                        <Link
                          href={`/admin/questions/create?edit=${q.id}`}
                          className="text-primary hover:underline font-medium"
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
      </Card>
    </div>
  );
}
