import { requireRole } from "@/lib/auth";
import { getAllSubjects, getAllExams } from "@/lib/data/syllabus";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AdminSyllabusClient from "./AdminSyllabusClient";

export default async function AdminSyllabusPage() {
  const { profile } = await requireRole("admin");

  const [subjects, exams] = await Promise.all([
    getAllSubjects(),
    getAllExams(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="admin" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Syllabus & Topic Management</h1>
            <p className="text-sm text-slate-600 mt-1">
              Admin hierarchy editor to author chapters and topics with verified textbook references,
              and map subjects to examinations.
            </p>
          </div>

          <AdminSyllabusClient subjects={subjects} exams={exams} />
        </main>
      </div>
    </div>
  );
}
