import { PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getQuestionsForPractice, getStudentBookmarks } from "@/lib/data/questions";
import AppLayout from "@/components/layout/AppLayout";
import IncorrectQuestionsClient from "./IncorrectQuestionsClient";

export default async function StudentIncorrectQuestionsPage() {
  const { user, profile } = await requireRole("student");

  const [incorrectQuestions, bookmarkedIds] = await Promise.all([
    getQuestionsForPractice({ incorrectOnly: true, studentId: user.id }),
    getStudentBookmarks(user.id),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Mistakes Notebook"
        description="Analyze and drill questions you missed during your previous practice sessions."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Practice", href: "/student/practice/banks" },
          { label: "Mistakes Notebook" },
        ]}
      />

      <IncorrectQuestionsClient
        incorrectQuestions={incorrectQuestions}
        bookmarkedIds={bookmarkedIds}
      />
    </AppLayout>
  );
}
