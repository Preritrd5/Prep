import { PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getQuestionsForPractice, getStudentBookmarks } from "@/lib/data/questions";
import AppLayout from "@/components/layout/AppLayout";
import BookmarksClient from "./BookmarksClient";

export default async function StudentBookmarksPage() {
  const { user, profile } = await requireRole("student");

  const [bookmarkedQuestions, bookmarkedIds] = await Promise.all([
    getQuestionsForPractice({ bookmarkedOnly: true, studentId: user.id }),
    getStudentBookmarks(user.id),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Bookmarked Questions"
        description="Review and practice questions you flagged during your study sessions."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Practice", href: "/student/practice/banks" },
          { label: "Bookmarks" },
        ]}
      />

      <BookmarksClient
        bookmarkedQuestions={bookmarkedQuestions}
        bookmarkedIds={bookmarkedIds}
      />
    </AppLayout>
  );
}
