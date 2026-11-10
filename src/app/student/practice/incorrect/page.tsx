import { requireRole } from "@/lib/auth";
import { getQuestionsForPractice, getStudentBookmarks } from "@/lib/data/questions";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import IncorrectQuestionsClient from "./IncorrectQuestionsClient";

export default async function StudentIncorrectQuestionsPage() {
  const { user, profile } = await requireRole("student");

  const [incorrectQuestions, bookmarkedIds] = await Promise.all([
    getQuestionsForPractice({ incorrectOnly: true, studentId: user.id }),
    getStudentBookmarks(user.id),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Mistakes Notebook</h1>
            <p className="text-sm text-slate-600 mt-1">
              Analyze and drill questions you missed during your previous practice sessions.
            </p>
          </div>

          <IncorrectQuestionsClient
            incorrectQuestions={incorrectQuestions}
            bookmarkedIds={bookmarkedIds}
          />
        </main>
      </div>
    </div>
  );
}
