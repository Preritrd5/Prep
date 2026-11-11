import { PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getAllExams, getAllSubjects } from "@/lib/data/syllabus";
import { getAIGenerationJobs } from "@/lib/data/questions";
import AppLayout from "@/components/layout/AppLayout";
import AdminQuestionsNavTabs from "@/components/admin/AdminQuestionsNavTabs";
import AIGeneratorClient from "./AIGeneratorClient";

export default async function AdminAIGeneratorPage() {
  const { profile } = await requireOwner();

  const [exams, subjects, recentJobs] = await Promise.all([
    getAllExams(),
    getAllSubjects(),
    getAIGenerationJobs(),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Gemini AI Question Generator"
        description="Use Gemini 2.5 Flash to generate competitive exam multiple choice questions, complete with options, correct answers, and pedagogical rationales."
        breadcrumbs={[
          { label: "Admin Console", href: "/admin/dashboard" },
          { label: "Questions", href: "/admin/questions" },
          { label: "AI Generator" },
        ]}
      />

      <AdminQuestionsNavTabs />

      <AIGeneratorClient exams={exams} subjects={subjects} recentJobs={recentJobs} />
    </AppLayout>
  );
}
