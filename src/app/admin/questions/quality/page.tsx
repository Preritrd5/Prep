import { requireRole } from "@/lib/auth";
import { getAdminContentQualityReport } from "@/lib/data/analytics";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ContentQualityClient from "./ContentQualityClient";

export default async function AdminContentQualityPage() {
  const { profile } = await requireRole("admin");
  const report = await getAdminContentQualityReport();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="admin" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <ContentQualityClient report={report} />
        </main>
      </div>
    </div>
  );
}
