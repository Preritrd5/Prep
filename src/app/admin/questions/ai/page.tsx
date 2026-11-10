import { requireRole } from "@/lib/auth";
import { getAllExams, getAllSubjects } from "@/lib/data/syllabus";
import { getAIGenerationJobs } from "@/lib/data/questions";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AIGeneratorClient from "./AIGeneratorClient";

export default async function AdminAIGeneratorPage() {
  const { profile } = await requireRole("admin");

  const [exams, subjects, recentJobs] = await Promise.all([
    getAllExams(),
    getAllSubjects(),
    getAIGenerationJobs(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="admin" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Gemini AI Question Generator</h1>
            <p className="text-sm text-slate-600 mt-1">
              Use Gemini 2.5 Flash to generate competitive exam multiple choice questions, complete with
              options, correct answers, and pedagogical rationales.
            </p>
          </div>

          <AIGeneratorClient exams={exams} subjects={subjects} recentJobs={recentJobs} />
        </main>
      </div>
    </div>
  );
}
