import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getExamResult } from "@/lib/data/exams-online";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role={profile.role} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <ExamResultClient
            result={result}
            attempt={attempt}
            template={template}
            questionsReview={questionsReview}
          />
        </main>
      </div>
    </div>
  );
}
