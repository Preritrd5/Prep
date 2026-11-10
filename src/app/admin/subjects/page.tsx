import { requireRole } from "@/lib/auth";
import { getAllSubjects } from "@/lib/data/syllabus";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AdminSubjectsClient from "./AdminSubjectsClient";

export default async function AdminSubjectsPage() {
  const { profile } = await requireRole("admin");
  const subjects = await getAllSubjects();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="admin" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Subject Repository</h1>
            <p className="text-sm text-slate-600 mt-1">
              Admin central curriculum library to manage subjects, codes, and classifications.
            </p>
          </div>

          <AdminSubjectsClient subjects={subjects} />
        </main>
      </div>
    </div>
  );
}
