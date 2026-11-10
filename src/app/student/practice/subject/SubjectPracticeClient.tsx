"use client";

import { useState } from "react";
import { Layers, BookOpen, Sparkles, Filter } from "lucide-react";
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">Mixed Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Length
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={20}>20 Questions</option>
              <option value={30}>30 Questions</option>
              <option value={50}>50 Questions</option>
            </select>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500 block">Questions Selected</span>
          <span className="text-base font-bold text-indigo-600">{filtered.length} Items</span>
        </div>
      </div>

      <PracticeRunner
        questions={filtered}
        title={
          selectedSubjectId === "All"
            ? "Comprehensive Subject Practice"
            : `${activeSubject?.name} Practice Test`
        }
        subtitle="Complete subject-level mock questions covering foundational and advanced concepts."
        subjectId={selectedSubjectId !== "All" ? selectedSubjectId : undefined}
        bookmarkedQuestionIds={bookmarkedIds}
      />
    </div>
  );
}
