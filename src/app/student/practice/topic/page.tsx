import { PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getAllExams, getAllSubjectsWithTree } from "@/lib/data/syllabus";
import { getQuestions, getStudentBookmarks } from "@/lib/data/questions";
import AppLayout from "@/components/layout/AppLayout";
import PracticeNavTabs from "@/components/practice/PracticeNavTabs";
import TopicPracticeClient from "./TopicPracticeClient";

export default async function StudentTopicPracticePage() {
  const { user, profile } = await requireOwner();

  const [exams, subjects, allQuestions, bookmarkedIds] = await Promise.all([
    getAllExams(),
    getAllSubjectsWithTree(),
    getQuestions(),
    getStudentBookmarks(user.id),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="MCQ Practice Center"
        description="Select specific syllabus topics and practice with immediate pedagogical explanations or full test evaluations."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Practice", href: "/student/practice/topic" },
          { label: "Topic Practice" },
        ]}
      />

      <PracticeNavTabs />

      <TopicPracticeClient
        exams={exams}
        subjects={subjects}
        allQuestions={allQuestions}
        bookmarkedIds={bookmarkedIds}
      />
    </AppLayout>
  );
}
