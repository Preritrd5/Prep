"use client";

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
  Sparkles,
  Award,
  AlertCircle,
  Send,
  HelpCircle,
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-semibold text-lg text-slate-800">No Questions Available</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          There are currently no published questions matching this specific selection. Try another topic, subject, or check back after an admin publishes new items.
        </p>
      </div>
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
      <div className="space-y-6 animate-fade-in">
        {/* Scorecard Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="text-center max-w-lg mx-auto space-y-3">
            <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-700">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Practice Session Completed!</h2>
            <p className="text-sm text-slate-500">{title}</p>

            <div className="grid grid-cols-4 gap-2 pt-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                <span className="text-xl font-bold text-slate-800">{testResult.totalQuestions}</span>
              </div>
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block">Attempted</span>
                <span className="text-xl font-bold text-indigo-800">{testResult.attemptedCount}</span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Correct</span>
                <span className="text-xl font-bold text-emerald-800">{testResult.correctCount}</span>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                <span className="text-[10px] uppercase font-bold text-purple-400 block">Score</span>
                <span className="text-xl font-bold text-purple-800">{testResult.scorePercent}%</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setTestResult(null);
                  setSelectedAnswers({});
                  setEvaluations({});
                  setCurrentIndex(0);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake Practice
              </button>
              <Link
                href="/student/practice/history"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium text-xs hover:bg-slate-50 transition"
              >
                <BarChart2 className="w-3.5 h-3.5 text-slate-500" /> View History
              </Link>
            </div>
          </div>
        </div>

        {/* Detailed Review of All Questions */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Detailed Answer Review</h3>
          {testResult.reviews.map((rev, idx) => {
            const q = questions.find((item) => item.id === rev.questionId);
            if (!q) return null;

            return (
              <div
                key={rev.questionId}
                className={`bg-white rounded-xl shadow-sm border p-5 space-y-3 ${
                  rev.isCorrect
                    ? "border-emerald-200 bg-emerald-50/10"
                    : rev.selectedOption === null
                    ? "border-slate-200"
                    : "border-rose-200 bg-rose-50/10"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Question {idx + 1} of {questions.length}</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded ${
                      rev.isCorrect
                        ? "bg-emerald-100 text-emerald-800"
                        : rev.selectedOption === null
                        ? "bg-slate-100 text-slate-600"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {rev.isCorrect
                      ? "Correct"
                      : rev.selectedOption === null
                      ? "Unattempted"
                      : "Incorrect"}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-900 leading-snug">{q.question_text}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {(q.options || []).map((opt) => {
                    const isUserPick = rev.selectedOption === opt.option_label;
                    const isKey = rev.correctOption === opt.option_label;

                    return (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                          isKey
                            ? "bg-emerald-100/70 border-emerald-400 text-emerald-950 font-medium"
                            : isUserPick && !rev.isCorrect
                            ? "bg-rose-100/70 border-rose-400 text-rose-950"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${
                            isKey
                              ? "bg-emerald-600 text-white"
                              : isUserPick && !rev.isCorrect
                              ? "bg-rose-600 text-white"
                              : "bg-white border text-slate-700"
                          }`}
                        >
                          {opt.option_label}
                        </span>
                        <span className="flex-1">{opt.option_text}</span>
                        {isKey && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {isUserPick && !rev.isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {rev.explanation && (
                  <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 space-y-1">
                    <span className="font-bold uppercase text-[10px] tracking-wide text-indigo-700 block">
                      Explanation:
                    </span>
                    <p>{rev.explanation}</p>
                  </div>
                )}
              </div>
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setMode("Learn")}
              className={`px-3 py-1.5 rounded-md transition ${
                mode === "Learn" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Learn Mode
            </button>
            <button
              onClick={() => setMode("Test")}
              className={`px-3 py-1.5 rounded-md transition ${
                mode === "Test" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Test Mode
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{activeTimer}s</span>
          </div>
        </div>
      </div>

      {/* Main Runner Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Question Area */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
            {/* Question Meta Strip */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Question {currentIndex + 1} of {questions.length}
                </span>

                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    currentQ?.difficulty === "Easy"
                      ? "bg-emerald-50 text-emerald-700"
                      : currentQ?.difficulty === "Medium"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {currentQ?.difficulty}
                </span>

                {currentQ?.source_type === "Previous Year Question" && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                    PYQ: {currentQ.pyq_exam_name || "Official"} {currentQ.pyq_year ? `(${currentQ.pyq_year})` : ""}
                  </span>
                )}
              </div>

              {/* Bookmark Button */}
              <button
                onClick={() => currentQ && handleToggleBookmark(currentQ.id)}
                className={`p-1.5 rounded-lg border transition ${
                  isBookmarked
                    ? "bg-amber-50 border-amber-300 text-amber-600"
                    : "bg-white border-slate-200 text-slate-400 hover:text-slate-700"
                }`}
                title={isBookmarked ? "Remove Bookmark" : "Bookmark Question"}
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </button>
            </div>

            {/* Question Text */}
            <p className="text-base font-semibold text-slate-900 leading-relaxed">
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
                    className={`w-full p-3.5 rounded-xl border text-left text-sm flex items-center gap-3 transition ${
                      isEvaluated && isCorrectOption
                        ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-medium shadow-sm"
                        : isEvaluated && isWrongSelection
                        ? "bg-rose-50 border-rose-400 text-rose-950"
                        : isSelected
                        ? "bg-indigo-50 border-indigo-400 text-indigo-950 font-medium"
                        : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isEvaluated && isCorrectOption
                          ? "bg-emerald-600 text-white"
                          : isEvaluated && isWrongSelection
                          ? "bg-rose-600 text-white"
                          : isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {opt.option_label}
                    </span>
                    <span className="flex-1 leading-snug">{opt.option_text}</span>

                    {isEvaluated && isCorrectOption && (
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isEvaluated && isWrongSelection && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Learn Mode: Pedagogical Explanation Reveal */}
            {mode === "Learn" && currentEvaluation && (
              <div className="mt-5 p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 space-y-1.5 animate-fade-in">
                <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-700 block">
                  Pedagogical Explanation:
                </span>
                <p className="leading-relaxed">{currentEvaluation.explanation}</p>
                {currentQ.source_reference && (
                  <p className="text-[11px] text-indigo-600/80 italic pt-1">
                    Reference: {currentQ.source_reference}
                  </p>
                )}
              </div>
            )}

            {/* Bottom Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-2">
                {/* Check Answer in Learn Mode */}
                {mode === "Learn" && !currentEvaluation && (
                  <button
                    type="button"
                    onClick={handleCheckAnswer}
                    disabled={!currentSelection || isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition disabled:opacity-40 shadow-sm"
                  >
                    Check Answer
                  </button>
                )}

                {/* Next button */}
                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  mode === "Test" && (
                    <button
                      type="button"
                      onClick={handleSubmitTest}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit Test
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Palette & Stats */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Question Palette ({questions.length})
            </h3>

            {/* Grid of question bubbles */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isEval = evaluations[q.id];

                let bgClass = "bg-slate-100 text-slate-700 hover:bg-slate-200";

                if (mode === "Learn" && isEval) {
                  bgClass = isEval.isCorrect
                    ? "bg-emerald-500 text-white font-bold"
                    : "bg-rose-500 text-white font-bold";
                } else if (isAnswered) {
                  bgClass = "bg-indigo-600 text-white font-bold";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition border ${
                      isCurrent ? "ring-2 ring-indigo-500 ring-offset-2" : "border-slate-200"
                    } ${bgClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Test Mode Finish CTA */}
            {mode === "Test" && (
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSubmitTest}
                  disabled={isPending}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Finish & Submit Test
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
