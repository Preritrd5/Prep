import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getExamTemplateById, getStudentAvailableExams } from "@/lib/data/exams-online";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import InstructionsClient from "./InstructionsClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExamInstructionsPage({ params }: PageProps) {
  const { user, profile } = await requireRole("student");
  const { id } = await params;

  const template = await getExamTemplateById(id);
  if (!template) {
    notFound();
  }

  const { studentAttempts } = await getStudentAvailableExams(user.id);
  const examPastAttempts = studentAttempts.filter((a) => a.template_id === id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <InstructionsClient
            template={template}
            pastAttempts={examPastAttempts}
          />
        </main>
      </div>
    </div>
  );
}
