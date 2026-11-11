import { PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getQuestionsForPractice, getStudentBookmarks } from "@/lib/data/questions";
import AppLayout from "@/components/layout/AppLayout";
import RevisionsNavTabs from "@/components/revisions/RevisionsNavTabs";
import BookmarksClient from "./BookmarksClient";

export default async function StudentBookmarksPage() {
  const { user, profile } = await requireOwner();

  const [bookmarkedQuestions, bookmarkedIds] = await Promise.all([
    getQuestionsForPractice({ bookmarkedOnly: true, studentId: user.id }),
    getStudentBookmarks(user.id),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Saved Bookmarks & Important Questions"
        description="Review and practice questions you flagged during your study sessions."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Revisions", href: "/student/revisions" },
          { label: "Bookmarks" },
        ]}
      />

      <RevisionsNavTabs />

      <BookmarksClient
        bookmarkedQuestions={bookmarkedQuestions}
        bookmarkedIds={bookmarkedIds}
      />
    </AppLayout>
  );
}
