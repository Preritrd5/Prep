import { requireRole } from "@/lib/auth";
import { getAllSubjects } from "@/lib/data/syllabus";
import { getQuestions, getStudentBookmarks } from "@/lib/data/questions";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import PYQPracticeClient from "./PYQPracticeClient";

export default async function StudentPYQPage() {
  const { user, profile } = await requireRole("student");

  const [subjects, allQuestions, bookmarkedIds] = await Promise.all([
    getAllSubjects(),
    getQuestions({ sourceType: "Previous Year Question" }),
    getStudentBookmarks(user.id),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Previous Year Questions (PYQ) Archive</h1>
            <p className="text-sm text-slate-600 mt-1">
              Explore and solve past years&apos; official examination questions from UPSC, KAS, GATE, Railway, and KEA.
            </p>
          </div>

          <PYQPracticeClient
            subjects={subjects}
            pyqQuestions={allQuestions}
            bookmarkedIds={bookmarkedIds}
          />
        </main>
      </div>
    </div>
  );
}
