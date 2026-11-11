"use client";

import { PageHeader, Card, Badge, Button, Alert, StatCard, EmptyState } from "@/components/ui";
import { useState, useTransition } from "react";
import Link from "next/link";
import {
  FileQuestion,
  Plus,
  Upload,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  Play,
  Layers,
  BookOpen,
} from "lucide-react";
import type { Question, Subject, DifficultyLevel, QuestionSource } from "@/lib/types";
import { adminDeleteQuestionAction } from "@/app/actions/questions";
import QuestionBankNavTabs from "@/components/questions/QuestionBankNavTabs";

interface PersonalQuestionBankClientProps {
  questions: Question[];
  subjects: Subject[];
}

export default function PersonalQuestionBankClient({
  questions: initialQuestions,
  subjects,
}: PersonalQuestionBankClientProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | "All">("All");
  const [selectedSource, setSelectedSource] = useState<QuestionSource | "All">("All");

  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
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
    return true;
  });

  const handleDelete = (qId: string) => {
    if (!confirm("Are you sure you want to remove this question from your personal question bank?")) return;
    startTransition(async () => {
      const res = await adminDeleteQuestionAction(qId);
      if (res.error) {
        setMsg({ type: "error", text: res.error });
      } else {
        setQuestions((prev) => prev.filter((q) => q.id !== qId));
        setMsg({ type: "success", text: "Question removed successfully." });
      }
    });
  };

  const totalCount = questions.length;
  const aiCount = questions.filter((q) => q.source_type === "AI Generated").length;
  const pyqCount = questions.filter((q) => q.source_type === "Previous Year Question").length;
  const importCount = questions.filter((q) => q.source_type === "Excel Import" || q.source_type === "CSV Import").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Question Bank"
        description="Your personal repository of competitive examination questions, PYQs, bulk-imported sets, and AI-generated items."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "My Question Bank" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/student/questions/import">
              <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                <Upload className="w-4 h-4" /> Bulk Import
              </Button>
            </Link>
            <Link href="/student/questions/create">
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                <Plus className="w-4 h-4" /> Add Question
              </Button>
            </Link>
            <Link href="/student/questions/ai">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-primary border-primary/30">
                <Sparkles className="w-4 h-4" /> AI Generator
              </Button>
            </Link>
            <Link href="/student/exams/create">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-accent border-accent/30">
                <Play className="w-4 h-4" /> Create Test
              </Button>
            </Link>
          </div>
        }
      />

      <QuestionBankNavTabs />

      {msg && (
        <Alert variant={msg.type === "success" ? "success" : "error"} className="py-2.5 rounded-xl text-xs">
          {msg.text}
        </Alert>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Questions"
          value={totalCount}
          icon={<FileQuestion className="w-4 h-4" />}
          accentColor="primary"
          description="In personal repository"
        />
        <StatCard
          title="Previous Year (PYQ)"
          value={pyqCount}
          icon={<BookOpen className="w-4 h-4" />}
          accentColor="success"
          description="Verified exam questions"
        />
        <StatCard
          title="Bulk Imported"
          value={importCount}
          icon={<Upload className="w-4 h-4" />}
          accentColor="accent"
          description="From papers & sheets"
        />
        <StatCard
          title="AI Generated"
          value={aiCount}
          icon={<Sparkles className="w-4 h-4" />}
          accentColor="warning"
          description="Gemini formulated"
        />
      </div>

      {/* Filters Bar */}
      <Card className="p-4 bg-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search question text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-input text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-input text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            >
              <option value="All">All Curriculum Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-input text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-input text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            >
              <option value="All">All Sources</option>
              <option value="Previous Year Question">Previous Year (PYQ)</option>
              <option value="Excel Import">Excel Import</option>
              <option value="CSV Import">CSV Import</option>
              <option value="AI Generated">AI Generated</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Questions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<FileQuestion className="w-8 h-8" />}
            title="No questions match your filter criteria"
            description="Try adjusting your search terms or upload questions via Bulk Import."
            action={
              <Link href="/student/questions/import">
                <Button variant="primary" size="sm">
                  Bulk Import Questions
                </Button>
              </Link>
            }
          />
        ) : (
          filtered.map((q, index) => {
            const isExpanded = expandedQuestionId === q.id;

            return (
              <Card
                key={q.id}
                className="p-4 transition-colors hover:border-primary/40 bg-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-text-muted">
                        #{index + 1}
                      </span>
                      {q.subject && (
                        <Badge variant="outline" size="sm" className="font-semibold text-primary">
                          {q.subject.name}
                        </Badge>
                      )}
                      <Badge
                        variant={
                          q.difficulty === "Easy"
                            ? "success"
                            : q.difficulty === "Medium"
                            ? "primary"
                            : "warning"
                        }
                        size="sm"
                      >
                        {q.difficulty}
                      </Badge>
                      <Badge variant="secondary" size="sm">
                        {q.source_type}
                      </Badge>
                      {q.pyq_exam_name && (
                        <span className="font-mono text-[10px] text-text-muted">
                          {q.pyq_exam_name} {q.pyq_year || ""}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-text-primary leading-relaxed pt-0.5">
                      {q.question_text}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                      className="p-1.5 text-text-muted hover:text-text-primary rounded-lg transition"
                      title={isExpanded ? "Collapse" : "View Options & Solution"}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(q.id)}
                      disabled={isPending}
                      className="p-1.5 text-text-muted hover:text-error rounded-lg transition"
                      title="Remove from bank"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Options Drawer */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options && q.options.length > 0 ? (
                        q.options.map((opt) => (
                          <div
                            key={opt.id}
                            className="p-2.5 rounded-lg bg-surface border border-border text-text-secondary"
                          >
                            <strong className="mr-1.5 font-mono text-text-primary">
                              {opt.option_label}.
                            </strong>
                            <span>{opt.option_text}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-text-muted italic col-span-2">
                          Standard 4-option structure configured.
                        </p>
                      )}
                    </div>

                    {q.source_reference && (
                      <p className="text-[11px] font-mono text-text-muted pt-1">
                        Source: {q.source_reference}
                      </p>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
