"use client";

import { useState } from "react";
import {
  Layers,
  BookOpen,
  Filter,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import type { Exam, Subject, Question } from "@/lib/types";
import PracticeRunner from "@/components/practice/PracticeRunner";

interface TopicPracticeClientProps {
  exams: Exam[];
  subjects: Subject[];
  allQuestions: Question[];
  bookmarkedIds: string[];
}

export default function TopicPracticeClient({
  exams,
  subjects,
  allQuestions,
  bookmarkedIds,
}: TopicPracticeClientProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || "");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

  const filteredQuestions = allQuestions.filter((q) => {
    if (selectedSubjectId && q.subject_id !== selectedSubjectId) return false;
    if (selectedDifficulty !== "All" && q.difficulty !== selectedDifficulty) return false;
    return q.status === "Published";
  });

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="space-y-6">
      {/* Subject & Difficulty Selector Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Select Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
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
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500 block">Available Questions</span>
          <span className="text-base font-bold text-indigo-600">
            {filteredQuestions.length} Questions
          </span>
        </div>
      </div>

      {/* Practice Runner */}
      <PracticeRunner
        questions={filteredQuestions}
        title={`${activeSubject?.name || "Topic"} Practice Session`}
        subtitle="Practice with immediate feedback in Learn Mode or test your mastery in Test Mode."
        subjectId={selectedSubjectId}
        bookmarkedQuestionIds={bookmarkedIds}
      />
    </div>
  );
}
