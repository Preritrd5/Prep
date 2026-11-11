import { PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getAllExams } from "@/lib/data/syllabus";
import { getQuestions, getStudentBookmarks } from "@/lib/data/questions";
import AppLayout from "@/components/layout/AppLayout";
import PracticeNavTabs from "@/components/practice/PracticeNavTabs";
import ExamPracticeClient from "./ExamPracticeClient";

export default async function StudentExamPracticePage() {
  const { user, profile } = await requireOwner();

  const [exams, allQuestions, bookmarkedIds] = await Promise.all([
    getAllExams(),
    getQuestions(),
    getStudentBookmarks(user.id),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="MCQ Practice Center — Exam Practice"
        description="Practice question sets curated specifically for GATE, KAS, UPSC, Railway, KEA, and AE Civil examinations."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Practice", href: "/student/practice/topic" },
          { label: "Exam Practice" },
        ]}
      />

      <PracticeNavTabs />

      <ExamPracticeClient
        exams={exams}
        allQuestions={allQuestions}
        bookmarkedIds={bookmarkedIds}
      />
    </AppLayout>
  );
}
