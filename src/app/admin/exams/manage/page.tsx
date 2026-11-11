import { PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getExamTemplates } from "@/lib/data/exams-online";
import AppLayout from "@/components/layout/AppLayout";
import AdminExamsClient from "./AdminExamsClient";

export default async function AdminManageExamsPage() {
  const { profile } = await requireRole("admin");
  const templates = await getExamTemplates();

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Online Examination Management"
        description="Author, schedule, and configure full-length mock tests, sectional papers, and chapter assessments."
        breadcrumbs={[
          { label: "Admin Console", href: "/admin/dashboard" },
          { label: "Online Exams", href: "/admin/exams/manage" },
          { label: "Templates" },
        ]}
      />

      <AdminExamsClient templates={templates} />
    </AppLayout>
  );
}
