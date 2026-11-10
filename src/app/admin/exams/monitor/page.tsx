import { requireRole } from "@/lib/auth";
import { getAdminExamMonitoringData } from "@/lib/data/exams-online";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AdminMonitorClient from "./AdminMonitorClient";

export default async function AdminMonitorExamsPage() {
  const { profile } = await requireRole("admin");
  const metrics = await getAdminExamMonitoringData();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="admin" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <AdminMonitorClient metrics={metrics} />
        </main>
      </div>
    </div>
  );
}
