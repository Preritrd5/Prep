import { requireRole } from "@/lib/auth";
import { getAllExams, getStudentExams } from "@/lib/data/syllabus";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ExamsClient from "./ExamsClient";

export default async function StudentExamsPage() {
  const { profile, user } = await requireRole("student");

  const [allExams, enrolledExams] = await Promise.all([
    getAllExams(),
    getStudentExams(user.id),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Examination Management</h1>
            <p className="text-sm text-slate-600 mt-1">
              Select multiple competitive examinations, set your individual target dates,
              and manage preparation priorities.
            </p>
          </div>

          <ExamsClient allExams={allExams} enrolledExams={enrolledExams} />
        </main>
      </div>
    </div>
  );
}
