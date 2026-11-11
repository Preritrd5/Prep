import { PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getQuestionsForPractice, getStudentBookmarks } from "@/lib/data/questions";
import AppLayout from "@/components/layout/AppLayout";
import RevisionsNavTabs from "@/components/revisions/RevisionsNavTabs";
import IncorrectQuestionsClient from "./IncorrectQuestionsClient";

export default async function StudentIncorrectQuestionsPage() {
  const { user, profile } = await requireOwner();

  const [incorrectQuestions, bookmarkedIds] = await Promise.all([
    getQuestionsForPractice({ incorrectOnly: true, studentId: user.id }),
    getStudentBookmarks(user.id),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Mistakes Notebook & Error Journal"
        description="Analyze and drill questions you missed during your previous practice sessions."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Revisions", href: "/student/revisions" },
          { label: "Mistakes Notebook" },
        ]}
      />

      <RevisionsNavTabs />

      <IncorrectQuestionsClient
        incorrectQuestions={incorrectQuestions}
        bookmarkedIds={bookmarkedIds}
      />
    </AppLayout>
  );
}
