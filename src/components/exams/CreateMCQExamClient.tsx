"use client";

import React, { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  Filter,
  Search,
  Shuffle,
  ShieldCheck,
  CheckSquare,
  Square,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import type { Exam, Subject, Question, ExamCategory, OnlineExamType } from "@/lib/types";
import { createPersonalMCQExamAction } from "@/app/actions/exams-online";
import QuestionBankNavTabs from "@/components/questions/QuestionBankNavTabs";

interface CreateMCQExamClientProps {
  exams: Exam[];
  subjects: Subject[];
  questions: Question[];
}

const EXAM_CATEGORIES: ExamCategory[] = [
  "UPSC",
  "KAS",
  "GATE",
  "Railway Examinations",
  "KEA Examinations",
  "AE Civil Engineering",
  "General Knowledge",
  "Custom",
];

const EXAM_TYPES: OnlineExamType[] = [
  "Full-Length Mock Test",
  "Sectional Test",
  "Subject Test",
  "Chapter Test",
  "Custom Test",
];

export default function CreateMCQExamClient({
  exams,
  subjects,
  questions,
}: CreateMCQExamClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Basic Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [examCategory, setExamCategory] = useState<ExamCategory>("General Knowledge");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [examType, setExamType] = useState<OnlineExamType>("Full-Length Mock Test");
  const [instructions, setInstructions] = useState(
    "1. Test duration is timed according to standard guidelines.\n2. Mark questions for review and navigate using the question palette.\n3. Negative marking applies for incorrect options as specified.\n4. Click Submit Examination when completed."
  );

  // Timing & Marks
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [totalQuestions, setTotalQuestions] = useState(15);
  const [correctMarks, setCorrectMarks] = useState(1.0);
  const [hasNegativeMarking, setHasNegativeMarking] = useState(true);
  const [negativeMarks, setNegativeMarks] = useState(0.25);
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);
  const [randomizeOptions, setRandomizeOptions] = useState(false);

  // Question Selection Mode
  const [selectionMode, setSelectionMode] = useState<"auto" | "manual">("auto");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  // Search & Filter for manual selection
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerSubject, setPickerSubject] = useState("");
  const [pickerDifficulty, setPickerDifficulty] = useState("");

  // Result state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdExamId, setCreatedExamId] = useState<string | null>(null);

  // Computed filtered questions for manual picker
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (pickerSearch) {
        const query = pickerSearch.toLowerCase();
        const matchesStem = q.question_text?.toLowerCase().includes(query);
        const matchesTopic = q.topic?.title?.toLowerCase().includes(query);
        if (!matchesStem && !matchesTopic) return false;
      }
      if (pickerSubject && q.subject_id !== pickerSubject) return false;
      if (pickerDifficulty && q.difficulty !== pickerDifficulty) return false;
      return true;
    });
  }, [questions, pickerSearch, pickerSubject, pickerDifficulty]);

  const toggleQuestionSelection = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const idsToAdd = filteredQuestions.map((q) => q.id);
    setSelectedQuestionIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
  };

  const clearSelection = () => {
    setSelectedQuestionIds([]);
  };

  const computedTotalQuestions =
    selectionMode === "manual" ? selectedQuestionIds.length : totalQuestions;
  const computedTotalMarks = computedTotalQuestions * correctMarks;
  const computedPassingMarks = Math.round(computedTotalMarks * 0.4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Please enter an examination title.");
      return;
    }

    if (selectionMode === "manual" && selectedQuestionIds.length === 0) {
      setErrorMsg("Please select at least one question from the Question Bank.");
      return;
    }

    startTransition(async () => {
      const res = await createPersonalMCQExamAction({
        title: title.trim(),
        description: description.trim() || undefined,
        examCategory,
        examId: selectedExamId || null,
        examType,
        instructions: instructions.trim() || undefined,
        durationMinutes,
        totalQuestions: computedTotalQuestions,
        totalMarks: computedTotalMarks,
        passingMarks: computedPassingMarks,
        randomizeQuestions,
        randomizeOptions,
        hasNegativeMarking,
        correctMarks,
        negativeMarks,
        selectedQuestionIds: selectionMode === "manual" ? selectedQuestionIds : undefined,
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.templateId) {
        setCreatedExamId(res.templateId);
      }
    });
  };

  if (createdExamId) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto py-8">
        <Card className="border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-text-primary">
              Examination Created Successfully!
            </h2>
            <p className="text-sm text-text-muted max-w-md mx-auto">
              &ldquo;{title}&rdquo; is now available in your personal mock examination suite with server-timed attempt tracking and instant score analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link href={`/student/exams/online/${createdExamId}/instructions`}>
              <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Play className="w-4 h-4 fill-white" /> Start Examination Now
              </Button>
            </Link>

            <Link href="/student/exams/online">
              <Button variant="outline" size="lg">
                View All Mock Tests
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                setCreatedExamId(null);
                setTitle("");
                setSelectedQuestionIds([]);
              }}
            >
              Create Another Test
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <QuestionBankNavTabs />

      {errorMsg && (
        <Alert variant="error" title={errorMsg} onClose={() => setErrorMsg(null)} />
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Basic Information */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Examination Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Examination Title <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., KAS Prelims Mock Test 1 — Indian Polity & History"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Target Competitive Examination
                  </label>
                  <Select
                    value={examCategory}
                    onChange={(e) => setExamCategory(e.target.value as ExamCategory)}
                  >
                    {EXAM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Examination Format
                  </label>
                  <Select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as OnlineExamType)}
                  >
                    {EXAM_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Description / Preparation Target (Optional)
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Target score: 75%+. Focus on revision of constitutional articles and modern freedom struggle."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Question Sourcing */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" /> Question Selection Strategy
                </CardTitle>
                <div className="flex items-center gap-1.5 p-1 bg-background-secondary rounded-lg border border-border text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectionMode("auto")}
                    className={`px-3 py-1 rounded-md font-medium transition ${
                      selectionMode === "auto"
                        ? "bg-card text-text-primary shadow-xs"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    Auto-Pick from Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectionMode("manual")}
                    className={`px-3 py-1 rounded-md font-medium transition ${
                      selectionMode === "manual"
                        ? "bg-card text-text-primary shadow-xs"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    Select Questions ({selectedQuestionIds.length})
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-4">
              {selectionMode === "auto" ? (
                <div className="p-4 rounded-xl border border-dashed border-border bg-background-secondary/40 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Automatic Question Bank Allocation
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    PrepTrack will automatically pull published questions from your personal question bank matching your chosen target examination and category.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1">
                      Number of Questions to Include
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={200}
                        value={totalQuestions}
                        onChange={(e) => setTotalQuestions(parseInt(e.target.value) || 10)}
                        className="w-32"
                      />
                      <div className="flex items-center gap-1">
                        {[10, 25, 50, 100].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setTotalQuestions(num)}
                            className={`text-xs px-2.5 py-1.5 rounded-lg border transition ${
                              totalQuestions === num
                                ? "border-primary bg-primary/10 text-primary font-bold"
                                : "border-border hover:bg-background-secondary text-text-muted"
                            }`}
                          >
                            {num} Qs
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" size="md">
                        {selectedQuestionIds.length} Selected
                      </Badge>
                      <span className="text-xs text-text-muted">
                        of {filteredQuestions.length} matching questions
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={selectAllFiltered}
                        className="text-xs"
                      >
                        Select All Filtered
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearSelection}
                        disabled={selectedQuestionIds.length === 0}
                        className="text-xs text-rose-500 hover:text-rose-600"
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>

                  {/* Filters Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text"
                        placeholder="Search questions..."
                        value={pickerSearch}
                        onChange={(e) => setPickerSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-card text-xs text-text-primary placeholder:text-text-muted"
                      />
                    </div>

                    <Select
                      value={pickerSubject}
                      onChange={(e) => setPickerSubject(e.target.value)}
                      className="text-xs py-1.5"
                    >
                      <option value="">All Subjects</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </Select>

                    <Select
                      value={pickerDifficulty}
                      onChange={(e) => setPickerDifficulty(e.target.value)}
                      className="text-xs py-1.5"
                    >
                      <option value="">All Difficulties</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </Select>
                  </div>

                  {/* Questions Scroll List */}
                  <div className="max-h-80 overflow-y-auto space-y-2 pr-1 border border-border rounded-xl p-2 bg-background-secondary/20">
                    {filteredQuestions.length === 0 ? (
                      <div className="py-8 text-center text-xs text-text-muted">
                        No questions match your current search or filters.
                      </div>
                    ) : (
                      filteredQuestions.map((q) => {
                        const isSelected = selectedQuestionIds.includes(q.id);
                        return (
                          <div
                            key={q.id}
                            onClick={() => toggleQuestionSelection(q.id)}
                            className={`p-3 rounded-lg border transition cursor-pointer flex items-start gap-3 ${
                              isSelected
                                ? "bg-primary/5 border-primary/40 text-text-primary"
                                : "bg-card border-border hover:border-primary/30 text-text-secondary"
                            }`}
                          >
                            <div className="mt-0.5 text-primary shrink-0">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 fill-primary text-white" />
                              ) : (
                                <Square className="w-4 h-4 text-text-muted" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <p className="text-xs font-medium text-text-primary line-clamp-2">
                                {q.question_text}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-[10px] text-text-muted">
                                {q.subject && (
                                  <span className="font-semibold text-text-secondary">
                                    {q.subject.name}
                                  </span>
                                )}
                                <span>•</span>
                                <span
                                  className={`font-semibold ${
                                    q.difficulty === "Easy"
                                      ? "text-emerald-500"
                                      : q.difficulty === "Hard"
                                      ? "text-rose-500"
                                      : "text-amber-500"
                                  }`}
                                >
                                  {q.difficulty}
                                </span>
                                {q.pyq_exam_name && (
                                  <>
                                    <span>•</span>
                                    <span>PYQ: {q.pyq_exam_name}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Examination Instructions */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Examination Instructions & Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                placeholder="List candidate instructions and rules..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Scoring, Timing & Summary */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Timing & Marking Scheme
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-5">
              {/* Duration */}
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Duration (Minutes)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={5}
                    max={360}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
                  />
                  <div className="flex items-center gap-1">
                    {[30, 60, 90, 120].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDurationMinutes(mins)}
                        className={`text-xs px-2 py-1.5 rounded-lg border transition ${
                          durationMinutes === mins
                            ? "border-primary bg-primary/10 text-primary font-bold"
                            : "border-border hover:bg-background-secondary text-text-muted"
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Correct Marks */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Marks per Correct
                  </label>
                  <Input
                    type="number"
                    step={0.5}
                    min={0.5}
                    max={10}
                    value={correctMarks}
                    onChange={(e) => setCorrectMarks(parseFloat(e.target.value) || 1.0)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Negative Penalty
                  </label>
                  <Input
                    type="number"
                    step={0.05}
                    min={0}
                    max={5}
                    disabled={!hasNegativeMarking}
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(parseFloat(e.target.value) || 0.25)}
                  />
                </div>
              </div>

              {/* Negative marking toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-text-primary">
                <input
                  type="checkbox"
                  checked={hasNegativeMarking}
                  onChange={(e) => setHasNegativeMarking(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span>Enable Negative Marking for incorrect options</span>
              </label>

              {/* Randomization options */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-text-primary">
                  <input
                    type="checkbox"
                    checked={randomizeQuestions}
                    onChange={(e) => setRandomizeQuestions(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Randomize question sequence per attempt</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-text-primary">
                  <input
                    type="checkbox"
                    checked={randomizeOptions}
                    onChange={(e) => setRandomizeOptions(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Shuffle options (A, B, C, D)</span>
                </label>
              </div>

              {/* Blueprint Summary Box */}
              <div className="p-4 rounded-xl bg-background-secondary/60 border border-border space-y-2 text-xs">
                <div className="font-semibold text-text-primary flex items-center justify-between">
                  <span>Blueprint Summary</span>
                  <Badge variant="primary" size="sm">
                    {examType}
                  </Badge>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Total Questions:</span>
                  <span className="font-bold text-text-primary">{computedTotalQuestions}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Total Marks:</span>
                  <span className="font-bold text-text-primary">{computedTotalMarks} pts</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Qualifying Passing Marks:</span>
                  <span className="font-bold text-text-primary">{computedPassingMarks} pts (40%)</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Time Allocated:</span>
                  <span className="font-bold text-text-primary">{durationMinutes} minutes</span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                type="submit"
                size="lg"
                isLoading={isPending}
                className="w-full gap-2 font-semibold"
              >
                <Play className="w-4 h-4 fill-white" /> Create & Publish Examination
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
