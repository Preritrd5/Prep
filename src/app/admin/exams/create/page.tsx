import { PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getAllExams, getAllSubjects } from "@/lib/data/syllabus";
import { getQuestions } from "@/lib/data/questions";
import AppLayout from "@/components/layout/AppLayout";
import AdminExamsNavTabs from "@/components/admin/AdminExamsNavTabs";
import ExamCreateForm from "./ExamCreateForm";

export default async function AdminCreateExamPage() {
  const { profile } = await requireOwner();

  const [exams, subjects, questions] = await Promise.all([
    getAllExams(),
    getAllSubjects(),
    getQuestions({ status: "Published" }),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Create Online Examination & Mock Test"
        description="Configure full-length mock tests, sectional papers, negative marking schemes, and question blueprints."
        breadcrumbs={[
          { label: "Admin Console", href: "/admin/dashboard" },
          { label: "Examinations", href: "/admin/exams" },
          { label: "Create Exam" },
        ]}
      />

      <AdminExamsNavTabs />

      <ExamCreateForm
        exams={exams}
        subjects={subjects}
        availableQuestions={questions}
      />
    </AppLayout>
  );
}
