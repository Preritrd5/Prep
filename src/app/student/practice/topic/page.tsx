import { requireRole } from "@/lib/auth";
import { getAllExams, getAllSubjects } from "@/lib/data/syllabus";
import { getQuestions, getStudentBookmarks } from "@/lib/data/questions";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import TopicPracticeClient from "./TopicPracticeClient";

export default async function StudentTopicPracticePage() {
  const { user, profile } = await requireRole("student");

  const [exams, subjects, allQuestions, bookmarkedIds] = await Promise.all([
    getAllExams(),
    getAllSubjects(),
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
            <h1 className="text-2xl font-bold text-slate-900">Topic-wise Practice</h1>
            <p className="text-sm text-slate-600 mt-1">
              Select specific syllabus topics and practice with immediate pedagogical explanations
              or full test evaluations.
            </p>
          </div>

          <TopicPracticeClient
            exams={exams}
            subjects={subjects}
            allQuestions={allQuestions}
            bookmarkedIds={bookmarkedIds}
          />
        </main>
      </div>
    </div>
  );
}
