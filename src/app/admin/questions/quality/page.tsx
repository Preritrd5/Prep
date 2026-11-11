import { requireOwner } from "@/lib/auth";
import { getAdminContentQualityReport } from "@/lib/data/analytics";
import AppLayout from "@/components/layout/AppLayout";
import AdminQuestionsNavTabs from "@/components/admin/AdminQuestionsNavTabs";
import ContentQualityClient from "./ContentQualityClient";

export default async function AdminContentQualityPage() {
  const { profile } = await requireOwner();
  const report = await getAdminContentQualityReport();

  return (
    <AppLayout profile={profile}>
      <AdminQuestionsNavTabs />
      <ContentQualityClient report={report} />
    </AppLayout>
  );
}
