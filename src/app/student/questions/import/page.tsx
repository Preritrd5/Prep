import { requireOwner } from "@/lib/auth";
import { getAllSubjects, getAllExams } from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import BulkImportWizard from "@/components/questions/BulkImportWizard";
import QuestionBankNavTabs from "@/components/questions/QuestionBankNavTabs";
import { PageHeader } from "@/components/ui/page-header";

export default async function StudentBulkImportPage() {
  const { profile } = await requireOwner();

  const [subjects, exams] = await Promise.all([
    getAllSubjects(),
    getAllExams(),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Bulk Question Import Wizard"
        description="Upload question papers in PDF, Word, Excel, CSV, TXT, or Image format. Extract questions, verify answer keys, convert non-MCQs with Gemini AI, and author custom mock tests."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Question Bank", href: "/student/questions" },
          { label: "Bulk Import" },
        ]}
      />

      <QuestionBankNavTabs />

      <BulkImportWizard subjects={subjects} exams={exams} />
    </AppLayout>
  );
}
