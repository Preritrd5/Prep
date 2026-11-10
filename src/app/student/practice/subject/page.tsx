import { requireRole } from "@/lib/auth";
import { getAllSubjects } from "@/lib/data/syllabus";
import { getQuestions, getStudentBookmarks } from "@/lib/data/questions";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import SubjectPracticeClient from "./SubjectPracticeClient";

export default async function StudentSubjectPracticePage() {
  const { user, profile } = await requireRole("student");

  const [subjects, allQuestions, bookmarkedIds] = await Promise.all([
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
            <h1 className="text-2xl font-bold text-slate-900">Subject-wise Practice</h1>
            <p className="text-sm text-slate-600 mt-1">
              Select entire subjects for broad conceptual drilling or mixed cross-subject general studies practice.
            </p>
          </div>

          <SubjectPracticeClient
            subjects={subjects}
            allQuestions={allQuestions}
            bookmarkedIds={bookmarkedIds}
          />
        </main>
      </div>
    </div>
  );
}
