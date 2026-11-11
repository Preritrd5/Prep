import { requireRole } from "@/lib/auth";
import { getAdminContentQualityReport } from "@/lib/data/analytics";
import AppLayout from "@/components/layout/AppLayout";
import ContentQualityClient from "./ContentQualityClient";

export default async function AdminContentQualityPage() {
  const { profile } = await requireRole("admin");
  const report = await getAdminContentQualityReport();

  return (
    <AppLayout profile={profile}>
      <ContentQualityClient report={report} />
    </AppLayout>
  );
}
