"use client";

import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { useState } from "react";
import Link from "next/link";
import { Bookmark, BookOpen, ChevronLeft } from "lucide-react";
import type { Question } from "@/lib/types";
import PracticeRunner from "@/components/practice/PracticeRunner";

interface BookmarksClientProps {
  bookmarkedQuestions: Question[];
  bookmarkedIds: string[];
}

export default function BookmarksClient({
  bookmarkedQuestions,
  bookmarkedIds,
}: BookmarksClientProps) {
  const [isPracticing, setIsPracticing] = useState(false);

  if (bookmarkedQuestions.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        title="No Bookmarked Questions"
        description="While practicing topics or exams, click the bookmark icon on any challenging question to save it here for targeted revision."
        action={{
          label: "Start Topic Practice",
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
          <ChevronLeft className="h-4 w-4" /> Exit Practice Runner
        </Button>
        <PracticeRunner
          questions={bookmarkedQuestions}
          title="Bookmarked Questions Practice Session"
          subtitle="Focused revision session covering all saved questions."
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
            Saved Bookmarks ({bookmarkedQuestions.length})
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Questions flagged for personal review and revision.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsPracticing(true)}
          className="gap-2 text-xs"
        >
          <BookOpen className="w-4 h-4" /> Practice All Bookmarks ({bookmarkedQuestions.length})
        </Button>
      </Card>

      {/* Bookmarked Questions Cards */}
      <div className="space-y-3">
        {bookmarkedQuestions.map((q, idx) => (
          <Card key={q.id} className="p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text-muted">#{idx + 1}</span>
              <div className="flex items-center gap-2">
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
                <Badge variant="secondary">
                  {q.source_type}
                </Badge>
              </div>
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
