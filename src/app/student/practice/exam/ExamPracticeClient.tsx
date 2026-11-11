"use client";

import { Card, Badge } from "@/components/ui";
import { useState } from "react";
import type { Exam, Question } from "@/lib/types";
import PracticeRunner from "@/components/practice/PracticeRunner";

interface ExamPracticeClientProps {
  exams: Exam[];
  allQuestions: Question[];
  bookmarkedIds: string[];
}

export default function ExamPracticeClient({
  exams,
  allQuestions,
  bookmarkedIds,
}: ExamPracticeClientProps) {
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || "");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

  const chosenExam = exams.find((e) => e.id === selectedExamId);

  // Filter questions that match exam category or code
  const filtered = allQuestions.filter((q) => {
    if (q.status !== "Published") return false;
    if (selectedDifficulty !== "All" && q.difficulty !== selectedDifficulty) return false;

    if (selectedExamId !== "All" && chosenExam) {
      if (
        chosenExam.category === "UPSC" &&
        (q.pyq_exam_name?.includes("UPSC") || q.subject_id?.includes("s1000000-0000-0000-0000-000000000002") || q.subject_id?.includes("s1000000-0000-0000-0000-000000000005"))
      ) {
        return true;
      }
      if (
        chosenExam.category === "KAS" &&
        (q.pyq_exam_name?.includes("KAS") || q.pyq_exam_name?.includes("Karnataka") || q.subject_id?.includes("s1000000-0000-0000-0000-000000000002"))
      ) {
        return true;
      }
      if (
        chosenExam.category === "GATE" &&
        (q.pyq_exam_name?.includes("GATE") || q.subject_id?.includes("s1000000-0000-0000-0000-000000000012") || q.subject_id?.includes("s1000000-0000-0000-0000-000000000013"))
      ) {
        return true;
      }
      if (
        chosenExam.category === "Railway Examinations" &&
        (q.pyq_exam_name?.includes("Railway") || q.pyq_exam_name?.includes("RRB") || q.subject_id?.includes("s1000000-0000-0000-0000-000000000011"))
      ) {
        return true;
      }
      if (
        chosenExam.category === "KEA Examinations" &&
        (q.pyq_exam_name?.includes("KEA") || q.pyq_exam_name?.includes("Surveyor") || q.pyq_exam_name?.includes("VAO") || q.pyq_exam_name?.includes("SDA") || q.pyq_exam_name?.includes("FDA"))
      ) {
        return true;
      }
      if (
        chosenExam.category === "AE Civil Engineering" &&
        (q.pyq_exam_name?.includes("AE") || q.pyq_exam_name?.includes("PWD") || q.subject_id?.includes("s1000000-0000-0000-0000-000000000012") || q.subject_id?.includes("s1000000-0000-0000-0000-000000000013"))
      ) {
        return true;
      }
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Exam Categories Selector */}
      <Card className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">
              Select Competitive Examination
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              style={{ colorScheme: "dark" }}
              className="border border-border rounded-xl px-3 py-1.5 text-xs font-semibold bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Competitive Examinations</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} ({exam.category})
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
              style={{ colorScheme: "dark" }}
              className="border border-border rounded-xl px-3 py-1.5 text-xs font-semibold bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="text-left md:text-right">
          <span className="text-xs text-text-muted block">Exam Mapped Questions</span>
          <Badge variant="primary" className="text-xs font-bold mt-0.5">
            {filtered.length} Questions
          </Badge>
        </div>
      </Card>

      <PracticeRunner
        questions={filtered}
        title={`${chosenExam?.name || "Exam"} Practice Paper`}
        subtitle="Syllabus-aligned questions calibrated to actual competitive examination standards."
        examId={selectedExamId}
        bookmarkedQuestionIds={bookmarkedIds}
      />
    </div>
  );
}
