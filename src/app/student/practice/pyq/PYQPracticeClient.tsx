"use client";

import { Card, Badge } from "@/components/ui";
import { useState } from "react";
import type { Subject, Question } from "@/lib/types";
import PracticeRunner from "@/components/practice/PracticeRunner";

interface PYQPracticeClientProps {
  subjects: Subject[];
  pyqQuestions: Question[];
  bookmarkedIds: string[];
}

export default function PYQPracticeClient({
  subjects,
  pyqQuestions,
  bookmarkedIds,
}: PYQPracticeClientProps) {
  const [selectedExamName, setSelectedExamName] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("All");

  // Extract unique exam names and years from PYQ questions
  const examNames = Array.from(
    new Set(pyqQuestions.map((q) => q.pyq_exam_name).filter(Boolean))
  ) as string[];

  const years = Array.from(
    new Set(pyqQuestions.map((q) => q.pyq_year).filter(Boolean))
  ).sort((a: any, b: any) => b - a) as number[];

  const filtered = pyqQuestions.filter((q) => {
    if (selectedExamName !== "All" && q.pyq_exam_name !== selectedExamName) return false;
    if (selectedYear !== "All" && q.pyq_year !== Number(selectedYear)) return false;
    if (selectedSubjectId !== "All" && q.subject_id !== selectedSubjectId) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* PYQ Filters */}
      <Card className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">
              Examination
            </label>
            <select
              value={selectedExamName}
              onChange={(e) => setSelectedExamName(e.target.value)}
              className="border border-border rounded-xl px-3 py-1.5 text-xs font-semibold bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All PYQ Examinations</option>
              {examNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">
              Question Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-border rounded-xl px-3 py-1.5 text-xs font-semibold bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Years</option>
              {years.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="border border-border rounded-xl px-3 py-1.5 text-xs font-semibold bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-left md:text-right">
          <span className="text-xs text-text-muted block">Verified PYQs</span>
          <Badge variant="primary" className="text-xs font-bold mt-0.5">
            {filtered.length} Questions
          </Badge>
        </div>
      </Card>

      <PracticeRunner
        questions={filtered}
        title={
          selectedExamName === "All"
            ? "Verified Previous Year Questions (PYQs)"
            : `${selectedExamName} ${selectedYear !== "All" ? `(${selectedYear})` : ""} PYQ Paper`
        }
        subtitle="Authentic questions from previous official examination papers with step-by-step reasoning."
        bookmarkedQuestionIds={bookmarkedIds}
      />
    </div>
  );
}
