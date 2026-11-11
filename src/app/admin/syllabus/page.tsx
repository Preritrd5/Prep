import { requireOwner } from "@/lib/auth";
import { getAllSubjects, getAllExams } from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import AdminCurriculumNavTabs from "@/components/admin/AdminCurriculumNavTabs";
import AdminSyllabusClient from "./AdminSyllabusClient";
import { PageHeader } from "@/components/ui/page-header";

export default async function AdminSyllabusPage() {
  const { profile } = await requireOwner();

  const [subjects, exams] = await Promise.all([
    getAllSubjects(),
    getAllExams(),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Syllabus & Curriculum Management"
        description="Admin hierarchy editor to author chapters and topics with verified textbook references, and map curriculum subjects to competitive examinations."
        breadcrumbs={[
          { label: "Admin Console", href: "/admin/dashboard" },
          { label: "Syllabus Management" },
        ]}
      />

      <AdminCurriculumNavTabs />

      <AdminSyllabusClient subjects={subjects} exams={exams} />
    </AppLayout>
  );
}
