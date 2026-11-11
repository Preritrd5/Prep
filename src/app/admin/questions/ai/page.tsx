import { PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getAllExams, getAllSubjects } from "@/lib/data/syllabus";
import { getAIGenerationJobs } from "@/lib/data/questions";
import AppLayout from "@/components/layout/AppLayout";
import AIGeneratorClient from "./AIGeneratorClient";

export default async function AdminAIGeneratorPage() {
  const { profile } = await requireRole("admin");

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

      <AIGeneratorClient exams={exams} subjects={subjects} recentJobs={recentJobs} />
    </AppLayout>
  );
}
