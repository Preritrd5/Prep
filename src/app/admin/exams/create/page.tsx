import { PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getAllExams, getAllSubjects } from "@/lib/data/syllabus";
import { getQuestions } from "@/lib/data/questions";
import AppLayout from "@/components/layout/AppLayout";
import ExamCreateForm from "./ExamCreateForm";

export default async function AdminCreateExamPage() {
  const { profile } = await requireRole("admin");

  const [exams, subjects, questions] = await Promise.all([
    getAllExams(),
    getAllSubjects(),
    getQuestions({ status: "Published" }),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Create Online Examination"
        description="Configure full-length mock tests, sectional papers, negative marking schemes, and question blueprints."
        breadcrumbs={[
          { label: "Admin Console", href: "/admin/dashboard" },
          { label: "Online Exams", href: "/admin/exams/manage" },
          { label: "Create Exam" },
        ]}
      />

      <ExamCreateForm
        exams={exams}
        subjects={subjects}
        availableQuestions={questions}
      />
    </AppLayout>
  );
}
