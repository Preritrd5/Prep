import { requireRole } from "@/lib/auth";
import { getAllExams } from "@/lib/data/syllabus";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AdminExamsClient from "./AdminExamsClient";

export default async function AdminExamsPage() {
  const { profile } = await requireRole("admin");
  const exams = await getAllExams();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="admin" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Examination Management</h1>
            <p className="text-sm text-slate-600 mt-1">
              Admin governance portal to add, edit, activate and deactivate examinations and variants.
            </p>
          </div>

          <AdminExamsClient exams={exams} />
        </main>
      </div>
    </div>
  );
}
