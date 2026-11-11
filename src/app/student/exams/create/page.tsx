import { PageHeader } from "@/components/ui/page-header";
import { requireOwner } from "@/lib/auth";
import { getAllExams, getAllSubjects } from "@/lib/data/syllabus";
import { getQuestions } from "@/lib/data/questions";
import AppLayout from "@/components/layout/AppLayout";
import CreateMCQExamClient from "@/components/exams/CreateMCQExamClient";

export default async function StudentCreateMCQExamPage() {
  const { profile } = await requireOwner();

  const [exams, subjects, questions] = await Promise.all([
    getAllExams(),
    getAllSubjects(),
    getQuestions({ status: "Published" }),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Create MCQ Examination"
        description="Design full-length computer-based mock tests, sectional papers, or customized quizzes with server-timed attempt tracking and instant score analytics."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Examinations", href: "/student/exams/online" },
          { label: "Create MCQ Examination" },
        ]}
      />

      <CreateMCQExamClient
        exams={exams}
        subjects={subjects}
        questions={questions}
      />
    </AppLayout>
  );
}
