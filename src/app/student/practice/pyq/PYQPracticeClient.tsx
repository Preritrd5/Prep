"use client";

import { useState } from "react";
import { BookOpen, Calendar, Award, CheckCircle, Shield } from "lucide-react";
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Examination
            </label>
            <select
              value={selectedExamName}
              onChange={(e) => setSelectedExamName(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Question Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
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

        <div className="text-right">
          <span className="text-xs text-slate-500 block">Verified PYQs</span>
          <span className="text-base font-bold text-purple-700">{filtered.length} Questions</span>
        </div>
      </div>

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
