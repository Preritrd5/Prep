import { requireOwner } from "@/lib/auth";
import { getAdminExamMonitoringData } from "@/lib/data/exams-online";
import AppLayout from "@/components/layout/AppLayout";
import AdminExamsNavTabs from "@/components/admin/AdminExamsNavTabs";
import AdminMonitorClient from "./AdminMonitorClient";

export default async function AdminMonitorExamsPage() {
  const { profile } = await requireOwner();
  const metrics = await getAdminExamMonitoringData();

  return (
    <AppLayout profile={profile}>
      <AdminExamsNavTabs />
      <AdminMonitorClient metrics={metrics} />
    </AppLayout>
  );
}
