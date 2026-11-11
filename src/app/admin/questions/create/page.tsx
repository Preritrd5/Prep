import { PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getAllExams, getAllSubjects } from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import AdminQuestionsNavTabs from "@/components/admin/AdminQuestionsNavTabs";
import QuestionForm from "./QuestionForm";

export default async function CreateQuestionPage() {
  const { profile } = await requireOwner();

  const [exams, subjects] = await Promise.all([
    getAllExams(),
    getAllSubjects(),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Create MCQ Question"
        description="Add a new multiple-choice question with four answer options, correct answer key, and multi-examination mappings."
        breadcrumbs={[
          { label: "Admin Console", href: "/admin/dashboard" },
          { label: "Questions", href: "/admin/questions" },
          { label: "Create Question" },
        ]}
      />

      <AdminQuestionsNavTabs />

      <QuestionForm exams={exams} subjects={subjects} />
    </AppLayout>
  );
}
