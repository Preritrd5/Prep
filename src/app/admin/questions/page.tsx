import { requireRole } from "@/lib/auth";
import { getQuestions } from "@/lib/data/questions";
import { getAllSubjects } from "@/lib/data/syllabus";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AdminQuestionsClient from "./AdminQuestionsClient";

export default async function AdminQuestionsPage() {
  const { profile } = await requireRole("admin");

  const [questions, subjects] = await Promise.all([
    getQuestions(),
    getAllSubjects(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="admin" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <AdminQuestionsClient questions={questions} subjects={subjects} />
        </main>
      </div>
    </div>
  );
}
