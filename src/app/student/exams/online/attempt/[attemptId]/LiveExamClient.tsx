"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Shield,
  RotateCcw,
  Flag,
  HelpCircle,
  Save,
  Check,
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

  // Server-Authoritative Timer (MODULE 8)
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
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      {/* Top Test Navigation Bar */}
      <header className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs uppercase tracking-wide">
            CBT Exam
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 truncate max-w-md">
              {attempt.template?.title || "Online Examination"}
            </h1>
            <span className="text-[11px] text-slate-400">
              Section: {currentQ?.section_name || "General Section"}
            </span>
          </div>
        </div>

        {/* Server Countdown Timer */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold shadow-sm ${
              remainingSeconds < 300
                ? "bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse"
                : "bg-slate-800 border-slate-700 text-emerald-300"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Time Left: {formatTime(remainingSeconds)}</span>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
          >
            Submit Exam
          </button>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col lg:flex-row gap-4">
        {/* Left: Question Stem & Options */}
        <main className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between overflow-hidden">
          {/* Question Subheader */}
          <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 uppercase">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold">
                +{currentQ?.marks || 1} / -{currentQ?.negative_marks || 0.25} Marks
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-500">
              {saveStatus === "Saving" ? (
                <span className="text-[11px] text-amber-600 flex items-center gap-1">
                  <RotateCcw className="w-3 h-3 animate-spin" /> Saving...
                </span>
              ) : (
                <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Saved to server
                </span>
              )}
            </div>
          </div>

          {/* Question Text & Options */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <p className="text-base font-semibold text-slate-900 leading-relaxed whitespace-pre-wrap">
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
                    className={`w-full p-4 rounded-xl border text-left text-sm flex items-center gap-3 transition ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-500 text-indigo-950 font-medium shadow-sm ring-1 ring-indigo-500"
                        : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
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
          <footer className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleReview}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition ${
                  answersState[currentQ?.id]?.is_marked_for_review
                    ? "bg-purple-100 border-purple-400 text-purple-900"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Flag className="w-3.5 h-3.5 text-purple-600" />
                {answersState[currentQ?.id]?.is_marked_for_review
                  ? "Marked for Review"
                  : "Mark for Review"}
              </button>

              <button
                type="button"
                onClick={handleClearResponse}
                disabled={!answersState[currentQ?.id]?.selected_option}
                className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-40"
              >
                Clear Response
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="inline-flex items-center gap-1 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  Save & Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="inline-flex items-center gap-1 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Examination
                </button>
              )}
            </div>
          </footer>
        </main>

        {/* Right: Question Navigation Palette */}
        <aside className="w-full lg:w-80 bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Question Palette ({questions.length})
            </h2>

            {/* Standard 5-State Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-emerald-500 text-white font-bold text-[9px] flex items-center justify-center">
                  ✓
                </span>
                <span>Answered ({totalAnswered})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center">
                  ✕
                </span>
                <span>Not Answered ({notAnsweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-purple-600 text-white font-bold text-[9px] flex items-center justify-center">
                  ●
                </span>
                <span>Marked Review ({markedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-slate-200 text-slate-600 font-bold text-[9px] flex items-center justify-center">
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

                let pillColor = "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200";

                if (!isVisited) {
                  pillColor = "bg-slate-100 text-slate-400 border-slate-200";
                } else if (hasOption && isMarked) {
                  pillColor = "bg-purple-700 text-white font-bold border-purple-800 ring-2 ring-emerald-400";
                } else if (hasOption) {
                  pillColor = "bg-emerald-600 text-white font-bold border-emerald-700";
                } else if (isMarked) {
                  pillColor = "bg-purple-600 text-white font-bold border-purple-700";
                } else {
                  pillColor = "bg-rose-500 text-white font-bold border-rose-600";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-lg text-xs font-semibold flex items-center justify-center transition border relative ${
                      isCurrent ? "ring-2 ring-indigo-600 ring-offset-2" : ""
                    } ${pillColor}`}
                  >
                    {idx + 1}
                    {hasOption && isMarked && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-300" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
            >
              Finish & Submit Test
            </button>
          </div>
        </aside>
      </div>

      {/* Submission Confirmation Modal (MODULE 7) */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5 animate-scale-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Examination Submission</h3>
                <p className="text-xs text-slate-500">
                  Please review your question summary before submitting.
                </p>
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Total Questions</span>
                <span className="text-base font-bold text-slate-900">{questions.length}</span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-700 block">Answered</span>
                <span className="text-base font-bold text-emerald-800">{totalAnswered}</span>
              </div>

              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                <span className="text-rose-700 block">Unanswered</span>
                <span className="text-base font-bold text-rose-800">
                  {questions.length - totalAnswered}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                <span className="text-purple-700 block">Marked for Review</span>
                <span className="text-base font-bold text-purple-800">
                  {markedCount + answeredAndMarkedCount}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Once you click <strong>Confirm and Submit</strong>, your examination attempt will be closed and evaluated server-side. You will not be able to return or change any answers.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 rounded-lg border text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back to Test
              </button>
              <button
                type="button"
                onClick={() => handleFinalSubmit(false)}
                disabled={isPending}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
              >
                {isPending ? "Evaluating Responses..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
