import { requireRole } from "@/lib/auth";
import { getAllExams, getAllSubjects } from "@/lib/data/syllabus";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import QuestionForm from "./QuestionForm";

export default async function CreateQuestionPage() {
  const { profile } = await requireRole("admin");

  const [exams, subjects] = await Promise.all([
    getAllExams(),
    getAllSubjects(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="admin" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Create MCQ Question</h1>
            <p className="text-sm text-slate-600 mt-1">
              Add a new multiple-choice question with four answer options, correct answer key,
              and multi-examination mappings.
            </p>
          </div>

          <QuestionForm exams={exams} subjects={subjects} />
        </main>
      </div>
    </div>
  );
}
