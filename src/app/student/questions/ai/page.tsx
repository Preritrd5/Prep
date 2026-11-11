import { requireOwner } from "@/lib/auth";
import { getAllExams, getAllSubjects } from "@/lib/data/syllabus";
import { getAIGenerationJobs } from "@/lib/data/questions";
import AppLayout from "@/components/layout/AppLayout";
import AIGeneratorClient from "@/app/admin/questions/ai/AIGeneratorClient";
import QuestionBankNavTabs from "@/components/questions/QuestionBankNavTabs";
import { PageHeader } from "@/components/ui/page-header";

export default async function StudentAIGeneratorPage() {
  const { profile } = await requireOwner();

  const [exams, subjects, recentJobs] = await Promise.all([
    getAllExams(),
    getAllSubjects(),
    getAIGenerationJobs(),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="AI Question Generator"
        description="Formulate targeted multiple-choice questions for any curriculum topic or competitive examination using Gemini AI."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Question Bank", href: "/student/questions" },
          { label: "AI Generator" },
        ]}
      />

      <QuestionBankNavTabs />

      <AIGeneratorClient exams={exams} subjects={subjects} recentJobs={recentJobs} />
    </AppLayout>
  );
}
