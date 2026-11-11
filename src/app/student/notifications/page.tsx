import { requireRole } from "@/lib/auth";
import { getStudentNotifications } from "@/lib/data/analytics";
import AppLayout from "@/components/layout/AppLayout";
import NotificationsClient from "./NotificationsClient";

export default async function StudentNotificationsPage() {
  const { profile, user } = await requireRole("student");
  const notifications = await getStudentNotifications(user.id);

  return (
    <AppLayout profile={profile}>
      <NotificationsClient notifications={notifications} />
    </AppLayout>
  );
}
