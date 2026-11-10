import { requireRole } from "@/lib/auth";
import { getAllExams } from "@/lib/data/syllabus";
import { getQuestions, getStudentBookmarks } from "@/lib/data/questions";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ExamPracticeClient from "./ExamPracticeClient";

export default async function StudentExamPracticePage() {
  const { user, profile } = await requireRole("student");

  const [exams, allQuestions, bookmarkedIds] = await Promise.all([
    getAllExams(),
    getQuestions(),
    getStudentBookmarks(user.id),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Exam-wise Practice</h1>
            <p className="text-sm text-slate-600 mt-1">
              Practice question sets curated specifically for GATE, KAS, UPSC, Railway, KEA, and AE Civil examinations.
            </p>
          </div>

          <ExamPracticeClient
            exams={exams}
            allQuestions={allQuestions}
            bookmarkedIds={bookmarkedIds}
          />
        </main>
      </div>
    </div>
  );
}
