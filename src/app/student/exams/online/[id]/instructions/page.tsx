import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { getExamTemplateById, getStudentAvailableExams } from "@/lib/data/exams-online";
import AppLayout from "@/components/layout/AppLayout";
import InstructionsClient from "./InstructionsClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExamInstructionsPage({ params }: PageProps) {
  const { user, profile } = await requireOwner();
  const { id } = await params;

  const template = await getExamTemplateById(id);
  if (!template) {
    notFound();
  }

  const { studentAttempts } = await getStudentAvailableExams(user.id);
  const examPastAttempts = studentAttempts.filter((a) => a.template_id === id);

  return (
    <AppLayout profile={profile}>
      <InstructionsClient
        template={template}
        pastAttempts={examPastAttempts}
      />
    </AppLayout>
  );
}
