"use client";

import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { useState } from "react";
import { RotateCcw, CheckCircle, ChevronLeft } from "lucide-react";
import type { Question } from "@/lib/types";
import PracticeRunner from "@/components/practice/PracticeRunner";

interface IncorrectQuestionsClientProps {
  incorrectQuestions: Question[];
  bookmarkedIds: string[];
}

export default function IncorrectQuestionsClient({
  incorrectQuestions,
  bookmarkedIds,
}: IncorrectQuestionsClientProps) {
  const [isPracticing, setIsPracticing] = useState(false);

  if (incorrectQuestions.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle}
        title="Clean Slate — No Incorrect Questions!"
        description="You currently have zero uncorrected mistakes logged in your practice sessions. Excellent accuracy!"
        action={{
          label: "Practice New Topics",
          onClick: () => {
            window.location.href = "/student/practice/topic";
          },
        }}
      />
    );
  }

  if (isPracticing) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsPracticing(false)}
          className="text-xs text-primary hover:text-primary-hover gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> Exit Mistakes Practice
        </Button>
        <PracticeRunner
          questions={incorrectQuestions}
          title="Mistake Notebook Drill Session"
          subtitle="Re-attempt past incorrect questions in Learn Mode to achieve 100% conceptual mastery."
          initialMode="Learn"
          bookmarkedQuestionIds={bookmarkedIds}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">
            Mistake Notebook ({incorrectQuestions.length} Items)
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Questions answered incorrectly in previous practice attempts.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsPracticing(true)}
          className="gap-2 text-xs bg-error hover:bg-error/90 text-white"
        >
          <RotateCcw className="w-4 h-4" /> Re-Attempt Past Mistakes ({incorrectQuestions.length})
        </Button>
      </Card>

      {/* Questions list */}
      <div className="space-y-3">
        {incorrectQuestions.map((q, idx) => (
          <Card key={q.id} className="p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text-muted">Mistake #{idx + 1}</span>
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

            <p className="text-sm font-semibold text-text-primary leading-snug">{q.question_text}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {(q.options || []).map((opt) => (
                <div
                  key={opt.id}
                  className="p-2.5 rounded-xl bg-secondary-bg border border-border text-xs text-text-primary flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded-md bg-card border border-border flex items-center justify-center font-bold text-text-primary text-[11px]">
                    {opt.option_label}
                  </span>
                  <span>{opt.option_text}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
