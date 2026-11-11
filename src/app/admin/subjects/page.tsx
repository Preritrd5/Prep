import { requireOwner } from "@/lib/auth";
import { getAllSubjects } from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import AdminCurriculumNavTabs from "@/components/admin/AdminCurriculumNavTabs";
import AdminSubjectsClient from "./AdminSubjectsClient";
import { PageHeader } from "@/components/ui/page-header";

export default async function AdminSubjectsPage() {
  const { profile } = await requireOwner();
  const subjects = await getAllSubjects();

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Curriculum Subjects Directory"
        description="Admin central curriculum library to manage subjects, standardized codes, and module classifications."
        breadcrumbs={[
          { label: "Admin Console", href: "/admin/dashboard" },
          { label: "Subjects" },
        ]}
      />

      <AdminCurriculumNavTabs />

      <AdminSubjectsClient subjects={subjects} />
    </AppLayout>
  );
}
