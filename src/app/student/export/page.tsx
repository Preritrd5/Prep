import { requireRole } from "@/lib/auth";
import { getStudentExportData } from "@/lib/data/analytics";
import AppLayout from "@/components/layout/AppLayout";
import StudentExportClient from "./StudentExportClient";

export default async function StudentExportPage() {
  const { profile, user } = await requireRole("student");
  const exportData = await getStudentExportData(user.id);

  return (
    <AppLayout profile={profile}>
      <StudentExportClient exportData={exportData} />
    </AppLayout>
  );
}
