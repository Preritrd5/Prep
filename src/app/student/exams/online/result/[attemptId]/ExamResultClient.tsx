"use client";

import { PageHeader, Card, Badge, Button } from "@/components/ui";
import Link from "next/link";
import {
  Clock,
  ArrowLeft,
  BarChart2,
  FileText,
  Lock,
} from "lucide-react";
import type { ExamResult, ExamAttempt, ExamTemplate } from "@/lib/types";

interface ExamResultClientProps {
  result: ExamResult | null;
  attempt: ExamAttempt;
  template: ExamTemplate;
  questionsReview: {
    questionText: string;
    options: { label: string; text: string }[];
    studentOption: string | null;
    correctOption: string;
    isCorrect: boolean;
    marksEarned: number;
    explanation: string | null;
    timeSpent: number;
    sectionName: string;
  }[];
}

export default function ExamResultClient({
  result,
  attempt,
  template,
  questionsReview,
}: ExamResultClientProps) {
  const isReleased =
    template.result_release_policy === "Immediate" ||
    template.results_published === true ||
    attempt.result_release_status === "Results Released";

  const totalScore = result?.total_score ?? attempt.score ?? 0;
  const maxMarks = result?.max_marks ?? attempt.max_marks ?? 100;
  const percentage = result?.percentage ?? attempt.percentage ?? 0;
  const accuracy = result?.accuracy_percent ?? 0;
  const correctCount = result?.correct_count ?? attempt.correct_count ?? 0;
  const incorrectCount = result?.incorrect_count ?? attempt.incorrect_count ?? 0;
  const unansweredCount = result?.unanswered_count ?? attempt.unanswered_count ?? 0;
  const totalQuestions = result?.total_questions ?? questionsReview.length;

  const isPassed = template.passing_marks !== null && template.passing_marks !== undefined
    ? totalScore >= template.passing_marks
    : percentage >= 40;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Navigation */}
      <PageHeader
        title={template.title}
        description={`Submitted on ${new Date(attempt.submitted_at || attempt.updated_at).toLocaleString()}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Online Exams", href: "/student/exams/online" },
          { label: "Attempt Result" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/student/exams/online">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-text-muted hover:text-text-primary">
                <ArrowLeft className="w-4 h-4" /> Portal
              </Button>
            </Link>
            <Link href="/student/exams/online/history">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5" /> All Attempts
              </Button>
            </Link>
          </div>
        }
      />

      {/* Main Scorecard Banner */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <Badge variant="primary">
              {template.exam_category} • Attempt #{attempt.attempt_number}
            </Badge>
            <h2 className="text-xl font-bold text-text-primary mt-2">Evaluation Scorecard</h2>
          </div>

          <div className="text-left sm:text-right">
            <Badge variant={isPassed ? "success" : "error"} className="text-xs py-1 px-3">
              {isPassed ? "Qualified / Passed" : "Needs Improvement"}
            </Badge>
            <p className="text-xs text-text-muted mt-1">
              Passing Mark: {template.passing_marks ?? "40%"}
            </p>
          </div>
        </div>

        {/* Vital Score Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-secondary-bg border border-border text-center">
            <span className="text-[10px] font-bold uppercase text-text-muted block">Total Score</span>
            <p className="text-3xl font-extrabold text-text-primary mt-1">
              {totalScore} <span className="text-sm font-semibold text-text-muted">/ {maxMarks}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
            <span className="text-[10px] font-bold uppercase text-primary block">Percentage</span>
            <p className="text-3xl font-extrabold text-primary mt-1">{percentage}%</p>
          </div>

          <div className="p-4 rounded-xl bg-success-light border border-success/30 text-center">
            <span className="text-[10px] font-bold uppercase text-success block">Accuracy</span>
            <p className="text-3xl font-extrabold text-success mt-1">{accuracy}%</p>
          </div>

          <div className="p-4 rounded-xl bg-secondary-bg border border-border text-center">
            <span className="text-[10px] font-bold uppercase text-text-muted block">Correct Answers</span>
            <p className="text-3xl font-extrabold text-text-primary mt-1">
              {correctCount} <span className="text-sm font-semibold text-text-muted">/ {totalQuestions}</span>
            </p>
          </div>
        </div>

        {/* Detailed Count Strips */}
        <div className="grid grid-cols-3 gap-3 text-center text-xs pt-2">
          <div className="p-2.5 rounded-xl bg-success-light text-success border border-success/30 font-semibold">
            {correctCount} Correct (+{result?.positive_marks || 0}m)
          </div>
          <div className="p-2.5 rounded-xl bg-error-light text-error border border-error/30 font-semibold">
            {incorrectCount} Incorrect (-{result?.negative_marks || 0}m)
          </div>
          <div className="p-2.5 rounded-xl bg-secondary-bg text-text-secondary border border-border font-semibold">
            {unansweredCount} Unattempted
          </div>
        </div>
      </Card>

      {/* Section-wise Performance Breakdown */}
      {result?.section_scores_json && result.section_scores_json.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="p-5 border-b border-border bg-secondary-bg/50">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" /> Section-wise Performance Breakdown
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-secondary-bg/50 border-b border-border text-text-secondary uppercase font-semibold">
                  <th className="p-3">Section</th>
                  <th className="p-3">Questions</th>
                  <th className="p-3">Attempted</th>
                  <th className="p-3">Correct</th>
                  <th className="p-3">Incorrect</th>
                  <th className="p-3 font-bold">Marks Scored</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-text-primary">
                {result.section_scores_json.map((sec, idx) => (
                  <tr key={idx} className="hover:bg-secondary-bg/30 transition-colors">
                    <td className="p-3 font-semibold">{sec.section_name}</td>
                    <td className="p-3 text-text-secondary">{sec.total_questions}</td>
                    <td className="p-3 text-text-secondary">{sec.attempted}</td>
                    <td className="p-3 text-success font-bold">{sec.correct}</td>
                    <td className="p-3 text-error font-bold">{sec.incorrect}</td>
                    <td className="p-3 font-bold">
                      {sec.score} / {sec.max_marks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Detailed Question-by-Question Review */}
      {!isReleased ? (
        <Card className="p-6 bg-warning-light/40 border-warning/30 text-text-primary space-y-2 text-center">
          <Lock className="w-8 h-8 mx-auto text-warning mb-1" />
          <h3 className="text-base font-bold">Question Review Pending Release</h3>
          <p className="text-xs text-text-secondary max-w-lg mx-auto">
            Your examination has been safely evaluated and scored. Individual answer keys and explanations will be unlocked once official results are declared by the administrator.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <FileText className="w-4 h-4 text-text-muted" /> Complete Question & Answer Review ({questionsReview.length})
            </h2>
          </div>

          <div className="space-y-4">
            {questionsReview.map((rev, idx) => (
              <Card
                key={idx}
                className={`p-6 space-y-4 ${
                  rev.isCorrect
                    ? "border-success/40 bg-success-light/20"
                    : rev.studentOption === null
                    ? "border-border"
                    : "border-error/40 bg-error-light/20"
                }`}
              >
                <div className="flex items-center justify-between text-xs pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-muted uppercase">
                      Question {idx + 1} of {questionsReview.length}
                    </span>
                    <Badge variant="secondary">
                      {rev.sectionName}
                    </Badge>
                  </div>

                  <Badge
                    variant={
                      rev.isCorrect
                        ? "success"
                        : rev.studentOption === null
                        ? "secondary"
                        : "error"
                    }
                  >
                    {rev.isCorrect
                      ? `Correct (+${rev.marksEarned}m)`
                      : rev.studentOption === null
                      ? "Unattempted (0m)"
                      : `Incorrect (${rev.marksEarned}m)`}
                  </Badge>
                </div>

                {/* Question Statement */}
                <p className="text-sm font-semibold text-text-primary leading-relaxed whitespace-pre-wrap">
                  {rev.questionText}
                </p>

                {/* Options Review */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {rev.options.map((opt) => {
                    const isKey = rev.correctOption === opt.label;
                    const isStudentPick = rev.studentOption === opt.label;

                    return (
                      <div
                        key={opt.label}
                        className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                          isKey
                            ? "bg-success-light border-success text-success font-medium"
                            : isStudentPick && !rev.isCorrect
                            ? "bg-error-light border-error text-error"
                            : "bg-secondary-bg border-border text-text-primary"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                            isKey
                              ? "bg-success text-white"
                              : isStudentPick && !rev.isCorrect
                              ? "bg-error text-white"
                              : "bg-card border border-border text-text-primary"
                          }`}
                        >
                          {opt.label}
                        </span>

                        <span className="flex-1 leading-snug">{opt.text}</span>

                        {isKey && (
                          <Badge variant="success" className="text-[10px]">
                            Key
                          </Badge>
                        )}
                        {isStudentPick && !rev.isCorrect && (
                          <Badge variant="error" className="text-[10px]">
                            Your Pick
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pedagogical Explanation */}
                {rev.explanation && (
                  <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-text-primary space-y-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-primary block">
                      Pedagogical Rationale:
                    </span>
                    <p className="leading-relaxed">{rev.explanation}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
