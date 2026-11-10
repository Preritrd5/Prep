import { requireRole } from "@/lib/auth";
import { getAllExams, getAllSubjects } from "@/lib/data/syllabus";
import { getQuestions } from "@/lib/data/questions";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ExamCreateForm from "./ExamCreateForm";

export default async function AdminCreateExamPage() {
  const { profile } = await requireRole("admin");

  const [exams, subjects, questions] = await Promise.all([
    getAllExams(),
    getAllSubjects(),
    getQuestions({ status: "Published" }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="admin" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Create Online Examination</h1>
            <p className="text-sm text-slate-600 mt-1">
              Configure full-length mock tests, sectional papers, negative marking schemes, and question blueprints.
            </p>
          </div>

          <ExamCreateForm
            exams={exams}
            subjects={subjects}
            availableQuestions={questions}
          />
        </main>
      </div>
    </div>
  );
}
