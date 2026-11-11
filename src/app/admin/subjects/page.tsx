import { requireRole } from "@/lib/auth";
import { getAllSubjects } from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import AdminSubjectsClient from "./AdminSubjectsClient";
import { PageHeader } from "@/components/ui/page-header";

export default async function AdminSubjectsPage() {
  const { profile } = await requireRole("admin");
  const subjects = await getAllSubjects();

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Subject Repository"
        description="Admin central curriculum library to manage subjects, standardized codes, and module classifications."
        breadcrumbs={[
          { label: "Admin Console", href: "/admin/dashboard" },
          { label: "Subjects" },
        ]}
      />

      <AdminSubjectsClient subjects={subjects} />
    </AppLayout>
  );
}
