import { requireOwner } from "@/lib/auth";
import { getAdminAuditLogs } from "@/lib/data/analytics";
import AppLayout from "@/components/layout/AppLayout";
import AuditLogsClient from "./AuditLogsClient";

export default async function AdminAuditLogsPage() {
  const { profile } = await requireOwner();
  const logs = await getAdminAuditLogs(50);

  return (
    <AppLayout profile={profile}>
      <AuditLogsClient logs={logs} />
    </AppLayout>
  );
}
