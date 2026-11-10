import { requireRole } from "@/lib/auth";
import { getAdminAnalyticsSummary } from "@/lib/data/analytics";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AdminAnalyticsClient from "./AdminAnalyticsClient";

export default async function AdminAnalyticsPage() {
  const { profile } = await requireRole("admin");
  const analytics = await getAdminAnalyticsSummary();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="admin" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <AdminAnalyticsClient analytics={analytics} />
        </main>
      </div>
    </div>
  );
}
