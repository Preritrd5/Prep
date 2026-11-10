import { requireRole } from "@/lib/auth";
import { getQuestionsForPractice, getStudentBookmarks } from "@/lib/data/questions";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import BookmarksClient from "./BookmarksClient";

export default async function StudentBookmarksPage() {
  const { user, profile } = await requireRole("student");

  const [bookmarkedQuestions, bookmarkedIds] = await Promise.all([
    getQuestionsForPractice({ bookmarkedOnly: true, studentId: user.id }),
    getStudentBookmarks(user.id),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Bookmarked Questions</h1>
            <p className="text-sm text-slate-600 mt-1">
              Review and practice questions you flagged during your study sessions.
            </p>
          </div>

          <BookmarksClient
            bookmarkedQuestions={bookmarkedQuestions}
            bookmarkedIds={bookmarkedIds}
          />
        </main>
      </div>
    </div>
  );
}
