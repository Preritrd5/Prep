import { requireOwner } from "@/lib/auth";
import { getAllExams, getAllSubjects } from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import QuestionForm from "@/app/admin/questions/create/QuestionForm";
import QuestionBankNavTabs from "@/components/questions/QuestionBankNavTabs";
import { PageHeader } from "@/components/ui/page-header";

export default async function StudentCreateQuestionPage() {
  const { profile } = await requireOwner();

  const [exams, subjects] = await Promise.all([
    getAllExams(),
    getAllSubjects(),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Add MCQ Question"
        description="Add a new multiple-choice question to your personal question bank with four answer options, correct answer key, and syllabus mappings."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Question Bank", href: "/student/questions" },
          { label: "Add Question" },
        ]}
      />

      <QuestionBankNavTabs />

      <QuestionForm exams={exams} subjects={subjects} />
    </AppLayout>
  );
}
