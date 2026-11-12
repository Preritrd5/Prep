"use client";

import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Bookmark,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  Award,
  Send,
  BarChart2,
  BookOpen,
} from "lucide-react";
import type { Question, OptionLabel, PracticeMode } from "@/lib/types";
import {
  submitLearnAttemptAction,
  submitTestSessionAction,
  toggleQuestionBookmarkAction,
} from "@/app/actions/questions";

interface PracticeRunnerProps {
  questions: Question[];
  title: string;
  subtitle?: string;
  examId?: string;
  subjectId?: string;
  topicId?: string;
  initialMode?: PracticeMode;
  bookmarkedQuestionIds?: string[];
  onFinish?: () => void;
}

interface QuestionEvaluation {
  isCorrect: boolean;
  correctOption: OptionLabel;
  explanation: string;
}

export default function PracticeRunner({
  questions,
  title,
  subtitle,
  examId,
  subjectId,
  topicId,
  initialMode = "Learn",
  bookmarkedQuestionIds = [],
}: PracticeRunnerProps) {
  const [mode, setMode] = useState<PracticeMode>(initialMode);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Selected answers: questionId -> OptionLabel | null
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, OptionLabel | null>>({});

  // Question times: questionId -> seconds
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  const [activeTimer, setActiveTimer] = useState(0);

  // Learn Mode evaluations: questionId -> QuestionEvaluation
  const [evaluations, setEvaluations] = useState<Record<string, QuestionEvaluation>>({});

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(bookmarkedQuestionIds));

  // Test Mode Submission Result
  const [testResult, setTestResult] = useState<{
    totalQuestions: number;
    attemptedCount: number;
    correctCount: number;
    incorrectCount: number;
    scorePercent: number;
    reviews: {
      questionId: string;
      selectedOption: OptionLabel | null;
      correctOption: OptionLabel;
      isCorrect: boolean;
      explanation: string | null;
      timeSpent: number;
    }[];
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  const currentQ = questions[currentIndex];

  // Active question timer
  useEffect(() => {
    setActiveTimer(0);
    const interval = setInterval(() => {
      setActiveTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  if (!questions || questions.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="h-6 w-6" />}
        title="No Questions Available"
        description="There are currently no published questions matching this specific selection. Try another topic, subject, or check back after an admin publishes new items."
      />
    );
  }

  // Handle Option Select
  const handleSelectOption = (label: OptionLabel) => {
    if (!currentQ) return;
    // In Learn Mode, prevent changing after evaluation
    if (mode === "Learn" && evaluations[currentQ.id]) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: label,
    }));
  };

  // Handle Learn Mode "Check Answer"
  const handleCheckAnswer = () => {
    if (!currentQ) return;
    const selected = selectedAnswers[currentQ.id];
    if (!selected) return;

    startTransition(async () => {
      const timeSpent = (questionTimes[currentQ.id] || 0) + activeTimer;
      setQuestionTimes((prev) => ({ ...prev, [currentQ.id]: timeSpent }));

      const res = await submitLearnAttemptAction({
        questionId: currentQ.id,
        selectedOption: selected,
        timeSpent,
      });

      setEvaluations((prev) => ({
        ...prev,
        [currentQ.id]: {
          isCorrect: res.isCorrect,
          correctOption: res.correctOption,
          explanation: res.explanation,
        },
      }));
    });
  };

  // Toggle Bookmark
  const handleToggleBookmark = (qId: string) => {
    startTransition(async () => {
      const res = await toggleQuestionBookmarkAction(qId);
      setBookmarks((prev) => {
        const next = new Set(prev);
        if (res.bookmarked) {
          next.add(qId);
        } else {
          next.delete(qId);
        }
        return next;
      });
    });
  };

  // Submit Test Mode
  const handleSubmitTest = () => {
    if (!confirm("Are you sure you want to finish and submit your test session?")) return;

    const answersPayload = questions.map((q) => ({
      questionId: q.id,
      selectedOption: selectedAnswers[q.id] || null,
      timeSpent: questionTimes[q.id] || (q.id === currentQ.id ? activeTimer : 0),
    }));

    startTransition(async () => {
      const res = await submitTestSessionAction({
        examId,
        subjectId,
        topicId,
        mode: "Test",
        answers: answersPayload,
      });

      if (res.success) {
        setTestResult({
          totalQuestions: res.totalQuestions,
          attemptedCount: res.attemptedCount,
          correctCount: res.correctCount,
          incorrectCount: res.incorrectCount,
          scorePercent: res.scorePercent,
          reviews: res.reviews,
        });
      }
    });
  };

  // Render Test Mode Results View
  if (testResult) {
    return (
      <div className="space-y-6">
        {/* Scorecard Header */}
        <Card className="p-6 text-center shadow-xs">
          <div className="max-w-lg mx-auto space-y-3">
            <div className="inline-flex p-3 rounded-2xl bg-[var(--color-success-subtle)] text-[var(--color-success-text)] border border-[var(--color-success-border)]">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-text-primary">Practice Session Completed!</h2>
            <p className="text-sm text-text-muted">{title}</p>

            <div className="grid grid-cols-4 gap-3 pt-4">
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-[10px] font-mono uppercase font-bold text-text-muted block">Total</span>
                <span className="font-heading text-xl font-bold text-text-primary">{testResult.totalQuestions}</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-primary-subtle)] border border-primary/20">
                <span className="text-[10px] font-mono uppercase font-bold text-primary block">Attempted</span>
                <span className="font-heading text-xl font-bold text-primary">{testResult.attemptedCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-success-subtle)] border border-[var(--color-success-border)]">
                <span className="text-[10px] font-mono uppercase font-bold text-[var(--color-success-text)] block">Correct</span>
                <span className="font-heading text-xl font-bold text-[var(--color-success-text)]">{testResult.correctCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="text-[10px] font-mono uppercase font-bold text-text-muted block">Score</span>
                <span className="font-heading text-xl font-bold text-text-primary">{testResult.scorePercent}%</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setTestResult(null);
                  setSelectedAnswers({});
                  setEvaluations({});
                  setCurrentIndex(0);
                }}
                className="gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake Practice
              </Button>
              <Link href="/student/practice/history">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5" /> View History
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Detailed Review of All Questions */}
        <div className="space-y-4">
          <h3 className="font-heading text-base font-bold text-text-primary">Detailed Answer Review</h3>
          {testResult.reviews.map((rev, idx) => {
            const q = questions.find((item) => item.id === rev.questionId);
            if (!q) return null;

            return (
              <Card
                key={rev.questionId}
                className={`p-5 space-y-3 shadow-xs ${
                  rev.isCorrect
                    ? "border-[var(--color-success-border)] bg-[var(--color-success-subtle)]/40"
                    : rev.selectedOption === null
                    ? "border-border"
                    : "border-[var(--color-danger-border)] bg-[var(--color-danger-subtle)]/40"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-text-muted">Question {idx + 1} of {questions.length}</span>
                  <Badge
                    variant={
                      rev.isCorrect
                        ? "success"
                        : rev.selectedOption === null
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {rev.isCorrect
                      ? "Correct"
                      : rev.selectedOption === null
                      ? "Unattempted"
                      : "Incorrect"}
                  </Badge>
                </div>

                <p className="text-sm font-semibold text-text-primary leading-relaxed">{q.question_text}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {(q.options || []).map((opt) => {
                    const isUserPick = rev.selectedOption === opt.option_label;
                    const isKey = rev.correctOption === opt.option_label;

                    return (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                          isKey
                            ? "bg-[var(--color-success-subtle)] border-[var(--color-success-border)] text-[var(--color-success-text)] font-medium"
                            : isUserPick && !rev.isCorrect
                            ? "bg-[var(--color-danger-subtle)] border-[var(--color-danger-border)] text-[var(--color-danger-text)]"
                            : "bg-surface border-border text-text-primary"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                            isKey
                              ? "bg-success text-white"
                              : isUserPick && !rev.isCorrect
                              ? "bg-error text-white"
                              : "bg-card border border-border text-text-primary"
                          }`}
                        >
                          {opt.option_label}
                        </span>
                        <span className="flex-1">{opt.option_text}</span>
                        {isKey && <CheckCircle className="w-4 h-4 text-success shrink-0" />}
                        {isUserPick && !rev.isCorrect && (
                          <XCircle className="w-4 h-4 text-error shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {rev.explanation && (
                  <div className="p-3 rounded-lg bg-[var(--color-primary-subtle)] border border-primary/20 text-xs text-text-primary space-y-1">
                    <span className="font-mono font-bold uppercase text-[10px] tracking-wide text-primary block">
                      Explanation:
                    </span>
                    <p className="leading-relaxed">{rev.explanation}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  const currentEvaluation = currentQ ? evaluations[currentQ.id] : null;
  const currentSelection = currentQ ? selectedAnswers[currentQ.id] : null;
  const isBookmarked = currentQ ? bookmarks.has(currentQ.id) : false;

  return (
    <div className="space-y-6">
      {/* Practice Header Bar */}
      <Card className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">{title}</h2>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex p-0.5 bg-secondary-bg rounded-xl border border-border text-xs font-semibold">
            <button
              onClick={() => setMode("Learn")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === "Learn" ? "bg-card text-primary font-bold shadow-sm" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Learn Mode
            </button>
            <button
              onClick={() => setMode("Test")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === "Test" ? "bg-card text-primary font-bold shadow-sm" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Test Mode
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-text-muted font-mono bg-secondary-bg px-2.5 py-1.5 rounded-xl border border-border">
            <Clock className="w-3.5 h-3.5 text-text-muted" />
            <span>{activeTimer}s</span>
          </div>
        </div>
      </Card>

      {/* Main Runner Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Question Area */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-6 space-y-5">
            {/* Question Meta Strip */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wide">
                  Question {currentIndex + 1} of {questions.length}
                </span>

                <Badge
                  variant={
                    currentQ?.difficulty === "Easy"
                      ? "success"
                      : currentQ?.difficulty === "Medium"
                      ? "warning"
                      : "error"
                  }
                >
                  {currentQ?.difficulty}
                </Badge>

                {currentQ?.source_type === "Previous Year Question" && (
                  <Badge variant="primary">
                    PYQ: {currentQ.pyq_exam_name || "Official"} {currentQ.pyq_year ? `(${currentQ.pyq_year})` : ""}
                  </Badge>
                )}
              </div>

              {/* Bookmark Button */}
              <button
                onClick={() => currentQ && handleToggleBookmark(currentQ.id)}
                className={`p-1.5 rounded-xl border transition-all ${
                  isBookmarked
                    ? "bg-warning-light border-warning text-warning"
                    : "bg-card border-border text-text-muted hover:text-text-primary hover:border-primary"
                }`}
                title={isBookmarked ? "Remove Bookmark" : "Bookmark Question"}
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </button>
            </div>

            {/* Question Text */}
            <p className="text-base font-semibold text-text-primary leading-relaxed">
              {currentQ?.question_text}
            </p>

            {/* Answer Options */}
            <div className="space-y-2.5 pt-2">
              {(currentQ?.options || []).map((opt) => {
                const isSelected = currentSelection === opt.option_label;
                const isEvaluated = currentEvaluation !== null;
                const isCorrectOption = currentEvaluation?.correctOption === opt.option_label;
                const isWrongSelection = isSelected && !currentEvaluation?.isCorrect;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.option_label)}
                    disabled={isEvaluated && mode === "Learn"}
                    className={`w-full p-3.5 rounded-xl border text-left text-sm flex items-center gap-3 transition-all ${
                      isEvaluated && isCorrectOption
                        ? "bg-success-light border-success text-success font-medium shadow-sm"
                        : isEvaluated && isWrongSelection
                        ? "bg-error-light border-error text-error"
                        : isSelected
                        ? "bg-primary/10 border-primary text-text-primary font-medium"
                        : "bg-card border-border text-text-primary hover:bg-secondary-bg hover:border-primary/40"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isEvaluated && isCorrectOption
                          ? "bg-success text-white"
                          : isEvaluated && isWrongSelection
                          ? "bg-error text-white"
                          : isSelected
                          ? "bg-primary text-white"
                          : "bg-secondary-bg text-text-primary border border-border"
                      }`}
                    >
                      {opt.option_label}
                    </span>
                    <span className="flex-1 leading-snug">{opt.option_text}</span>

                    {isEvaluated && isCorrectOption && (
                      <CheckCircle className="w-5 h-5 text-success shrink-0" />
                    )}
                    {isEvaluated && isWrongSelection && (
                      <XCircle className="w-5 h-5 text-error shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Learn Mode: Pedagogical Explanation Reveal */}
            {mode === "Learn" && currentEvaluation && (
              <div className="mt-5 p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs text-text-primary space-y-1.5">
                <span className="font-bold uppercase tracking-wider text-[10px] text-primary block">
                  Pedagogical Explanation:
                </span>
                <p className="leading-relaxed">{currentEvaluation.explanation}</p>
                {currentQ.source_reference && (
                  <p className="text-[11px] text-text-muted italic pt-1">
                    Reference: {currentQ.source_reference}
                  </p>
                )}
              </div>
            )}

            {/* Bottom Action Bar */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>

              <div className="flex items-center gap-2">
                {/* Check Answer in Learn Mode */}
                {mode === "Learn" && !currentEvaluation && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCheckAnswer}
                    disabled={!currentSelection || isPending}
                    className="gap-1.5 text-xs"
                  >
                    Check Answer
                  </Button>
                )}

                {/* Next button */}
                {currentIndex < questions.length - 1 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="gap-1 text-xs"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  mode === "Test" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSubmitTest}
                      isLoading={isPending}
                      className="gap-1.5 text-xs bg-success hover:bg-success/90"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit Test
                    </Button>
                  )
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Palette & Stats */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Question Palette ({questions.length})
            </h3>

            {/* Grid of question bubbles */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isEval = evaluations[q.id];

                let bgClass = "bg-secondary-bg text-text-primary hover:bg-secondary-bg/80 border-border";

                if (mode === "Learn" && isEval) {
                  bgClass = isEval.isCorrect
                    ? "bg-success text-white font-bold border-success"
                    : "bg-error text-white font-bold border-error";
                } else if (isAnswered) {
                  bgClass = "bg-primary text-white font-bold border-primary";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl text-xs font-semibold flex items-center justify-center transition-all border ${
                      isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
                    } ${bgClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Test Mode Finish CTA */}
            {mode === "Test" && (
              <div className="pt-3 border-t border-border">
                <Button
                  variant="primary"
                  onClick={handleSubmitTest}
                  isLoading={isPending}
                  className="w-full gap-2 text-xs bg-success hover:bg-success/90"
                >
                  <Send className="w-3.5 h-3.5" /> Finish & Submit Test
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
