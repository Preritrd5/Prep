import { PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getAllExams } from "@/lib/data/syllabus";
import { getQuestions, getStudentBookmarks } from "@/lib/data/questions";
import AppLayout from "@/components/layout/AppLayout";
import ExamPracticeClient from "./ExamPracticeClient";

export default async function StudentExamPracticePage() {
  const { user, profile } = await requireRole("student");

  const [exams, allQuestions, bookmarkedIds] = await Promise.all([
    getAllExams(),
    getQuestions(),
    getStudentBookmarks(user.id),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Exam-wise Practice"
        description="Practice question sets curated specifically for GATE, KAS, UPSC, Railway, KEA, and AE Civil examinations."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Practice", href: "/student/practice/banks" },
          { label: "Exam Practice" },
        ]}
      />

      <ExamPracticeClient
        exams={exams}
        allQuestions={allQuestions}
        bookmarkedIds={bookmarkedIds}
      />
    </AppLayout>
  );
}
