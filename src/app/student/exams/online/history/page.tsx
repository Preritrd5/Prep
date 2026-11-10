import { requireRole } from "@/lib/auth";
import { getStudentExamAttempts } from "@/lib/data/exams-online";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import StudentExamHistoryClient from "./StudentExamHistoryClient";

export default async function StudentExamHistoryPage() {
  const { user, profile } = await requireRole("student");
  const attempts = await getStudentExamAttempts(user.id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Online Examination History</h1>
            <p className="text-sm text-slate-600 mt-1">
              Review all your past online mock examinations, performance scores, and question-by-question evaluations.
            </p>
          </div>

          <StudentExamHistoryClient attempts={attempts} />
        </main>
      </div>
    </div>
  );
}
