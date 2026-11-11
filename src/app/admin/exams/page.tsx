import { PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getAllExams } from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import AdminExamsClient from "./AdminExamsClient";

export default async function AdminExamsPage() {
  const { profile } = await requireRole("admin");
  const exams = await getAllExams();

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Examination Management"
        description="Admin governance portal to add, edit, activate and deactivate examinations and variants."
        breadcrumbs={[
          { label: "Admin Console", href: "/admin/dashboard" },
          { label: "Examinations" },
        ]}
      />

      <AdminExamsClient exams={exams} />
    </AppLayout>
  );
}
