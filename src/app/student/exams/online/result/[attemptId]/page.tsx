import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getExamResult } from "@/lib/data/exams-online";
import AppLayout from "@/components/layout/AppLayout";
import ExamResultClient from "./ExamResultClient";

interface PageProps {
  params: Promise<{ attemptId: string }>;
}

export default async function ExamResultPage({ params }: PageProps) {
  const { user, profile } = await requireAuth();
  const { attemptId } = await params;

  // Student can view their own result; admin can inspect any result
  const studentId = profile.role === "admin" ? undefined : user.id;
  const { result, attempt, template, questionsReview } = await getExamResult(attemptId, studentId);

  if (!attempt || !template) {
    notFound();
  }

  return (
    <AppLayout profile={profile}>
      <ExamResultClient
        result={result}
        attempt={attempt}
        template={template}
        questionsReview={questionsReview}
      />
    </AppLayout>
  );
}
