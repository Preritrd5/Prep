import { requireRole } from "@/lib/auth";
import { getAdminExamMonitoringData } from "@/lib/data/exams-online";
import AppLayout from "@/components/layout/AppLayout";
import AdminMonitorClient from "./AdminMonitorClient";

export default async function AdminMonitorExamsPage() {
  const { profile } = await requireRole("admin");
  const metrics = await getAdminExamMonitoringData();

  return (
    <AppLayout profile={profile}>
      <AdminMonitorClient metrics={metrics} />
    </AppLayout>
  );
}
