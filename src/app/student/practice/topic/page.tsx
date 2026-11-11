import { PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getAllExams, getAllSubjectsWithTree } from "@/lib/data/syllabus";
import { getQuestions, getStudentBookmarks } from "@/lib/data/questions";
import AppLayout from "@/components/layout/AppLayout";
import TopicPracticeClient from "./TopicPracticeClient";

export default async function StudentTopicPracticePage() {
  const { user, profile } = await requireRole("student");

  const [exams, subjects, allQuestions, bookmarkedIds] = await Promise.all([
    getAllExams(),
    getAllSubjectsWithTree(),
    getQuestions(),
    getStudentBookmarks(user.id),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Topic-wise Practice"
        description="Select specific syllabus topics and practice with immediate pedagogical explanations or full test evaluations."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Practice", href: "/student/practice/banks" },
          { label: "Topic Practice" },
        ]}
      />

      <TopicPracticeClient
        exams={exams}
        subjects={subjects}
        allQuestions={allQuestions}
        bookmarkedIds={bookmarkedIds}
      />
    </AppLayout>
  );
}
