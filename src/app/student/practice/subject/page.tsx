import { PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getAllSubjects } from "@/lib/data/syllabus";
import { getQuestions, getStudentBookmarks } from "@/lib/data/questions";
import AppLayout from "@/components/layout/AppLayout";
import PracticeNavTabs from "@/components/practice/PracticeNavTabs";
import SubjectPracticeClient from "./SubjectPracticeClient";

export default async function StudentSubjectPracticePage() {
  const { user, profile } = await requireOwner();

  const [subjects, allQuestions, bookmarkedIds] = await Promise.all([
    getAllSubjects(),
    getQuestions(),
    getStudentBookmarks(user.id),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="MCQ Practice Center — Subject Practice"
        description="Select entire subjects for broad conceptual drilling or mixed cross-subject general studies practice."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Practice", href: "/student/practice/topic" },
          { label: "Subject Practice" },
        ]}
      />

      <PracticeNavTabs />

      <SubjectPracticeClient
        subjects={subjects}
        allQuestions={allQuestions}
        bookmarkedIds={bookmarkedIds}
      />
    </AppLayout>
  );
}
