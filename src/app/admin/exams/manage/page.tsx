import { requireRole } from "@/lib/auth";
import { getExamTemplates } from "@/lib/data/exams-online";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AdminExamsClient from "./AdminExamsClient";

export default async function AdminManageExamsPage() {
  const { profile } = await requireRole("admin");
  const templates = await getExamTemplates();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="admin" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <AdminExamsClient templates={templates} />
        </main>
      </div>
    </div>
  );
}
