import { requireRole } from "@/lib/auth";
import { getStudentExportData } from "@/lib/data/analytics";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import StudentExportClient from "./StudentExportClient";

export default async function StudentExportPage() {
  const { profile, user } = await requireRole("student");
  const exportData = await getStudentExportData(user.id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <StudentExportClient exportData={exportData} />
        </main>
      </div>
    </div>
  );
}
