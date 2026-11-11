import { notFound, redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { getStudentAttemptById } from "@/lib/data/exams-online";
import LiveExamClient from "./LiveExamClient";

interface PageProps {
  params: Promise<{ attemptId: string }>;
}

export default async function LiveExamPage({ params }: PageProps) {
  const { user } = await requireOwner();
  const { attemptId } = await params;

  const { attempt, questions, answers } = await getStudentAttemptById(attemptId, user.id);

  if (!attempt) {
    notFound();
  }

  // If already submitted/evaluated, redirect to result screen immediately
  if (["Submitted", "Auto Submitted", "Evaluated", "Results Released"].includes(attempt.status)) {
    redirect(`/student/exams/online/result/${attempt.id}`);
  }

  return (
    <LiveExamClient
      attempt={attempt}
      questions={questions}
      initialAnswers={answers}
    />
  );
}
