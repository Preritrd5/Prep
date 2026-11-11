import { PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getAllExams } from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import AdminExamsNavTabs from "@/components/admin/AdminExamsNavTabs";
import AdminExamsClient from "./AdminExamsClient";

export default async function AdminExamsPage() {
  const { profile } = await requireOwner();
  const exams = await getAllExams();

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Examination & Mock Test Management"
        description="Admin governance portal to add, edit, activate and deactivate examinations and variants."
        breadcrumbs={[
          { label: "Admin Console", href: "/admin/dashboard" },
          { label: "Examinations" },
        ]}
      />

      <AdminExamsNavTabs />

      <AdminExamsClient exams={exams} />
    </AppLayout>
  );
}
