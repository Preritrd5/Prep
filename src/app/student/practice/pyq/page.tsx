import { PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getAllSubjects } from "@/lib/data/syllabus";
import { getQuestions, getStudentBookmarks } from "@/lib/data/questions";
import AppLayout from "@/components/layout/AppLayout";
import PYQPracticeClient from "./PYQPracticeClient";

export default async function StudentPYQPage() {
  const { user, profile } = await requireRole("student");

  const [subjects, allQuestions, bookmarkedIds] = await Promise.all([
    getAllSubjects(),
    getQuestions({ sourceType: "Previous Year Question" }),
    getStudentBookmarks(user.id),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Previous Year Questions (PYQ) Archive"
        description="Explore and solve past years' official examination questions from UPSC, KAS, GATE, Railway, and KEA."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Practice", href: "/student/practice/exam" },
          { label: "PYQs" },
        ]}
      />

      <PYQPracticeClient
        subjects={subjects}
        pyqQuestions={allQuestions}
        bookmarkedIds={bookmarkedIds}
      />
    </AppLayout>
  );
}
