import { PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getAllExams, getAllSubjects } from "@/lib/data/syllabus";
import { getImportBatches } from "@/lib/data/questions";
import AppLayout from "@/components/layout/AppLayout";
import AdminQuestionsNavTabs from "@/components/admin/AdminQuestionsNavTabs";
import ImportWizard from "./ImportWizard";

export default async function AdminImportQuestionsPage() {
  const { profile } = await requireOwner();

  const [exams, subjects, recentBatches] = await Promise.all([
    getAllExams(),
    getAllSubjects(),
    getImportBatches(),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Bulk Import Questions"
        description="Upload spreadsheets (.xlsx / .csv) to batch import multiple-choice questions into the repository."
        breadcrumbs={[
          { label: "Admin Console", href: "/admin/dashboard" },
          { label: "Questions", href: "/admin/questions" },
          { label: "Bulk Import" },
        ]}
      />

      <AdminQuestionsNavTabs />

      <ImportWizard exams={exams} subjects={subjects} recentBatches={recentBatches} />
    </AppLayout>
  );
}
