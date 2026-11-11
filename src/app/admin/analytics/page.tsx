import { requireOwner } from "@/lib/auth";
import { getAdminAnalyticsSummary } from "@/lib/data/analytics";
import AppLayout from "@/components/layout/AppLayout";
import AdminAnalyticsClient from "./AdminAnalyticsClient";

export default async function AdminAnalyticsPage() {
  const { profile } = await requireOwner();
  const analytics = await getAdminAnalyticsSummary();

  return (
    <AppLayout profile={profile}>
      <AdminAnalyticsClient analytics={analytics} />
    </AppLayout>
  );
}
