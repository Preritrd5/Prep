"use client";

import { Card, Badge } from "@/components/ui";
import { useState } from "react";
import type { Subject, Question } from "@/lib/types";
import PracticeRunner from "@/components/practice/PracticeRunner";

interface SubjectPracticeClientProps {
  subjects: Subject[];
  allQuestions: Question[];
  bookmarkedIds: string[];
}

export default function SubjectPracticeClient({
  subjects,
  allQuestions,
  bookmarkedIds,
}: SubjectPracticeClientProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [questionCount, setQuestionCount] = useState<number>(20);

  const filtered = allQuestions
    .filter((q) => {
      if (selectedSubjectId !== "All" && q.subject_id !== selectedSubjectId) return false;
      if (selectedDifficulty !== "All" && q.difficulty !== selectedDifficulty) return false;
      return q.status === "Published";
    })
    .slice(0, questionCount);

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="space-y-6">
      {/* Subject Selector Bar */}
      <Card className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="border border-border rounded-xl px-3 py-1.5 text-xs font-semibold bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Subjects (Comprehensive Mock)</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="border border-border rounded-xl px-3 py-1.5 text-xs font-semibold bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">Mixed Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">
              Length
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="border border-border rounded-xl px-3 py-1.5 text-xs font-semibold bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={20}>20 Questions</option>
              <option value={30}>30 Questions</option>
              <option value={50}>50 Questions</option>
            </select>
          </div>
        </div>

        <div className="text-left md:text-right">
          <span className="text-xs text-text-muted block">Questions Selected</span>
          <Badge variant="primary" className="text-xs font-bold mt-0.5">
            {filtered.length} Items
          </Badge>
        </div>
      </Card>

      <PracticeRunner
        questions={filtered}
        title={
          selectedSubjectId === "All"
            ? "Comprehensive Subject Practice"
            : `${activeSubject?.name || "Subject"} Practice Session`
        }
        subtitle="Drill conceptual topics with instant evaluation or timed assessment."
        subjectId={selectedSubjectId !== "All" ? selectedSubjectId : undefined}
        bookmarkedQuestionIds={bookmarkedIds}
      />
    </div>
  );
}
