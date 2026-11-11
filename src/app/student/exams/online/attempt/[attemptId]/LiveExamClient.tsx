"use client";

import { Button, Badge, Modal } from "@/components/ui";
import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  RotateCcw,
  Flag,
  Check,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
} from "lucide-react";
import type {
  ExamAttempt,
  ExamAttemptQuestion,
  ExamAttemptAnswer,
  OptionLabel,
} from "@/lib/types";
import {
  studentAutosaveExamAnswerAction,
  studentSubmitExamAttemptAction,
} from "@/app/actions/exams-online";

interface LiveExamClientProps {
  attempt: ExamAttempt;
  questions: ExamAttemptQuestion[];
  initialAnswers: ExamAttemptAnswer[];
}

export default function LiveExamClient({
  attempt,
  questions,
  initialAnswers,
}: LiveExamClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Local state for answers map: attempt_question_id -> { selected_option, is_marked_for_review, is_visited, time_spent_seconds }
  const [answersState, setAnswersState] = useState<
    Record<
      string,
      {
        selected_option: OptionLabel | null;
        is_marked_for_review: boolean;
        is_visited: boolean;
        time_spent_seconds: number;
      }
    >
  >(() => {
    const map: Record<string, any> = {};
    initialAnswers.forEach((ans) => {
      map[ans.attempt_question_id] = {
        selected_option: ans.selected_option,
        is_marked_for_review: ans.is_marked_for_review,
        is_visited: ans.is_visited,
        time_spent_seconds: ans.time_spent_seconds || 0,
      };
    });
    return map;
  });

  const [visitedSet, setVisitedSet] = useState<Set<string>>(() => {
    const s = new Set<string>();
    initialAnswers.forEach((ans) => {
      if (ans.is_visited) s.add(ans.attempt_question_id);
    });
    if (questions[0]) s.add(questions[0].id);
    return s;
  });

  // Server-Authoritative Timer
  const calculateRemainingSeconds = useCallback(() => {
    const expiresMs = new Date(attempt.expires_at).getTime();
    const nowMs = Date.now();
    return Math.max(0, Math.floor((expiresMs - nowMs) / 1000));
  }, [attempt.expires_at]);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(calculateRemainingSeconds);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving" | "Error">("Saved");
  const [isPending, startTransition] = useTransition();

  const currentQ = questions[currentIndex];

  // Mark current question as visited
  useEffect(() => {
    if (currentQ && !visitedSet.has(currentQ.id)) {
      setVisitedSet((prev) => new Set(prev).add(currentQ.id));
    }
  }, [currentQ, visitedSet]);

  const handleFinalSubmit = useCallback((_isAuto: boolean = false) => {
    setIsSubmitModalOpen(false);
    startTransition(async () => {
      const res = await studentSubmitExamAttemptAction(attempt.id);
      if (res.success) {
        router.push(`/student/exams/online/result/${attempt.id}`);
      }
    });
  }, [attempt.id, router]);

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateRemainingSeconds();
      setRemainingSeconds(remaining);

      // Automatic submission upon expiry
      if (remaining <= 0) {
        clearInterval(interval);
        handleFinalSubmit(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateRemainingSeconds, handleFinalSubmit]);

  // Autosave action handler
  const triggerAutosave = (
    qId: string,
    option: OptionLabel | null,
    markedForReview: boolean
  ) => {
    setSaveStatus("Saving");
    startTransition(async () => {
      const res = await studentAutosaveExamAnswerAction({
        attemptId: attempt.id,
        attemptQuestionId: qId,
        selectedOption: option,
        isMarkedForReview: markedForReview,
        timeSpentSeconds: answersState[qId]?.time_spent_seconds || 0,
      });

      if (res.expired) {
        router.push(`/student/exams/online/result/${attempt.id}`);
      } else if (res.error) {
        setSaveStatus("Error");
      } else {
        setSaveStatus("Saved");
      }
    });
  };

  const handleSelectOption = (optLabel: OptionLabel) => {
    if (!currentQ) return;
    const isCurrentlyMarked = answersState[currentQ.id]?.is_marked_for_review || false;

    setAnswersState((prev) => ({
      ...prev,
      [currentQ.id]: {
        selected_option: optLabel,
        is_marked_for_review: isCurrentlyMarked,
        is_visited: true,
        time_spent_seconds: (prev[currentQ.id]?.time_spent_seconds || 0) + 1,
      },
    }));

    triggerAutosave(currentQ.id, optLabel, isCurrentlyMarked);
  };

  const handleClearResponse = () => {
    if (!currentQ) return;
    const isCurrentlyMarked = answersState[currentQ.id]?.is_marked_for_review || false;

    setAnswersState((prev) => ({
      ...prev,
      [currentQ.id]: {
        selected_option: null,
        is_marked_for_review: isCurrentlyMarked,
        is_visited: true,
        time_spent_seconds: prev[currentQ.id]?.time_spent_seconds || 0,
      },
    }));

    triggerAutosave(currentQ.id, null, isCurrentlyMarked);
  };

  const handleToggleReview = () => {
    if (!currentQ) return;
    const currentSelected = answersState[currentQ.id]?.selected_option || null;
    const nextMarked = !(answersState[currentQ.id]?.is_marked_for_review);

    setAnswersState((prev) => ({
      ...prev,
      [currentQ.id]: {
        selected_option: currentSelected,
        is_marked_for_review: nextMarked,
        is_visited: true,
        time_spent_seconds: prev[currentQ.id]?.time_spent_seconds || 0,
      },
    }));

    triggerAutosave(currentQ.id, currentSelected, nextMarked);
  };

  // Format timer HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Palette metrics
  let answeredCount = 0;
  let markedCount = 0;
  let answeredAndMarkedCount = 0;
  let notAnsweredCount = 0;
  let notVisitedCount = 0;

  questions.forEach((q) => {
    const isVisited = visitedSet.has(q.id);
    const ans = answersState[q.id];
    const hasOption = ans && ans.selected_option !== null && ans.selected_option !== undefined;
    const isMarked = ans && ans.is_marked_for_review;

    if (!isVisited) {
      notVisitedCount++;
    } else if (hasOption && isMarked) {
      answeredAndMarkedCount++;
    } else if (hasOption) {
      answeredCount++;
    } else if (isMarked) {
      markedCount++;
    } else {
      notAnsweredCount++;
    }
  });

  const totalAnswered = answeredCount + answeredAndMarkedCount;

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans select-none">
      {/* Top Test Navigation Bar */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Badge variant="primary" className="font-bold uppercase tracking-wide">
            CBT Exam
          </Badge>
          <div>
            <h1 className="text-sm font-bold text-text-primary truncate max-w-md">
              {attempt.template?.title || "Online Examination"}
            </h1>
            <span className="text-[11px] text-text-muted">
              Section: {currentQ?.section_name || "General Section"}
            </span>
          </div>
        </div>

        {/* Server Countdown Timer */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold shadow-sm transition-colors ${
              remainingSeconds < 300
                ? "bg-error-light border-error text-error animate-pulse"
                : "bg-secondary-bg border-border text-primary"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Time Left: {formatTime(remainingSeconds)}</span>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSubmitModalOpen(true)}
            className="text-xs bg-success hover:bg-success/90 font-bold"
          >
            Submit Exam
          </Button>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col lg:flex-row gap-4">
        {/* Left: Question Stem & Options */}
        <main className="flex-1 bg-card rounded-2xl shadow-sm border border-border flex flex-col justify-between overflow-hidden">
          {/* Question Subheader */}
          <div className="px-6 py-3.5 bg-secondary-bg/50 border-b border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-primary uppercase">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <Badge variant="secondary">
                +{currentQ?.marks || 1} / -{currentQ?.negative_marks || 0.25} Marks
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-text-muted">
              {saveStatus === "Saving" ? (
                <span className="text-[11px] text-warning flex items-center gap-1 font-medium">
                  <RotateCcw className="w-3 h-3 animate-spin" /> Saving...
                </span>
              ) : (
                <span className="text-[11px] text-success flex items-center gap-1 font-medium">
                  <Check className="w-3 h-3" /> Saved to server
                </span>
              )}
            </div>
          </div>

          {/* Question Text & Options */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <p className="text-base font-semibold text-text-primary leading-relaxed whitespace-pre-wrap">
              {currentQ?.question_text}
            </p>

            {/* Answer Options Radio List */}
            <div className="space-y-3 pt-2">
              {(currentQ?.options_json || []).map((opt) => {
                const isSelected = answersState[currentQ.id]?.selected_option === opt.option_label;

                return (
                  <button
                    key={opt.option_label}
                    type="button"
                    onClick={() => handleSelectOption(opt.option_label)}
                    className={`w-full p-4 rounded-xl border text-left text-sm flex items-center gap-3 transition-all ${
                      isSelected
                        ? "bg-primary/10 border-primary text-text-primary font-medium shadow-sm ring-1 ring-primary"
                        : "bg-card border-border text-text-primary hover:bg-secondary-bg hover:border-primary/40"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-secondary-bg text-text-primary border border-border"
                      }`}
                    >
                      {opt.option_label}
                    </span>
                    <span className="flex-1 leading-snug">{opt.option_text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Bar */}
          <footer className="px-6 py-4 bg-secondary-bg/50 border-t border-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant={answersState[currentQ?.id]?.is_marked_for_review ? "primary" : "outline"}
                size="sm"
                onClick={handleToggleReview}
                className="gap-1.5 text-xs"
              >
                <Flag className="w-3.5 h-3.5" />
                {answersState[currentQ?.id]?.is_marked_for_review
                  ? "Marked for Review"
                  : "Mark for Review"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleClearResponse}
                disabled={!answersState[currentQ?.id]?.selected_option}
                className="text-xs"
              >
                Clear Response
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>

              {currentIndex < questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="gap-1 text-xs"
                >
                  Save & Next <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="gap-1 text-xs bg-success hover:bg-success/90"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Examination
                </Button>
              )}
            </div>
          </footer>
        </main>

        {/* Right: Question Navigation Palette */}
        <aside className="w-full lg:w-80 bg-card rounded-2xl shadow-sm border border-border p-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted border-b border-border pb-2">
              Question Palette ({questions.length})
            </h2>

            {/* Standard 5-State Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-text-secondary">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-success text-white font-bold text-[9px] flex items-center justify-center">
                  ✓
                </span>
                <span>Answered ({totalAnswered})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-error text-white font-bold text-[9px] flex items-center justify-center">
                  ✕
                </span>
                <span>Not Answered ({notAnsweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-accent text-white font-bold text-[9px] flex items-center justify-center">
                  ●
                </span>
                <span>Marked Review ({markedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-secondary-bg border border-border text-text-muted font-bold text-[9px] flex items-center justify-center">
                  -
                </span>
                <span>Not Visited ({notVisitedCount})</span>
              </div>
            </div>

            {/* Question Grid Buttons */}
            <div className="grid grid-cols-5 gap-2 pt-2 max-h-[360px] overflow-y-auto">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isVisited = visitedSet.has(q.id);
                const ans = answersState[q.id];
                const hasOption = ans && ans.selected_option !== null && ans.selected_option !== undefined;
                const isMarked = ans && ans.is_marked_for_review;

                let pillColor = "bg-secondary-bg text-text-muted border-border hover:bg-secondary-bg/80";

                if (!isVisited) {
                  pillColor = "bg-secondary-bg text-text-muted border-border";
                } else if (hasOption && isMarked) {
                  pillColor = "bg-accent text-white font-bold border-accent ring-2 ring-success";
                } else if (hasOption) {
                  pillColor = "bg-success text-white font-bold border-success";
                } else if (isMarked) {
                  pillColor = "bg-accent text-white font-bold border-accent";
                } else {
                  pillColor = "bg-error text-white font-bold border-error";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl text-xs font-semibold flex items-center justify-center transition-all border relative ${
                      isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
                    } ${pillColor}`}
                  >
                    {idx + 1}
                    {hasOption && isMarked && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-success-light" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              variant="primary"
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full text-xs font-bold"
            >
              Finish & Submit Test
            </Button>
          </div>
        </aside>
      </div>

      {/* Submission Confirmation Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Confirm Examination Submission"
        description="Please review your question summary before submitting."
      >
        <div className="space-y-4">
          {/* Summary Statistics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-secondary-bg border border-border">
              <span className="text-text-muted block">Total Questions</span>
              <span className="text-base font-bold text-text-primary">{questions.length}</span>
            </div>

            <div className="p-3 rounded-xl bg-success-light border border-success/30">
              <span className="text-success block">Answered</span>
              <span className="text-base font-bold text-success">{totalAnswered}</span>
            </div>

            <div className="p-3 rounded-xl bg-error-light border border-error/30">
              <span className="text-error block">Unanswered</span>
              <span className="text-base font-bold text-error">
                {questions.length - totalAnswered}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <span className="text-primary block">Marked for Review</span>
              <span className="text-base font-bold text-primary">
                {markedCount + answeredAndMarkedCount}
              </span>
            </div>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            Once you click <strong>Confirm and Submit</strong>, your examination attempt will be closed and evaluated server-side. You will not be able to return or change any answers.
          </p>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSubmitModalOpen(false)}
            >
              Back to Test
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleFinalSubmit(false)}
              disabled={isPending}
              className="bg-success hover:bg-success/90 text-white font-bold"
            >
              {isPending ? "Evaluating Responses..." : "Confirm & Submit"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
