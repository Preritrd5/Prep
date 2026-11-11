import { requireOwner } from "@/lib/auth";
import { getStudentNotifications } from "@/lib/data/analytics";
import AppLayout from "@/components/layout/AppLayout";
import NotificationsClient from "@/app/student/notifications/NotificationsClient";

export default async function NotificationsPage() {
  const { profile, user } = await requireOwner();
  const notifications = await getStudentNotifications(user.id);

  return (
    <AppLayout profile={profile}>
      <NotificationsClient notifications={notifications} />
    </AppLayout>
  );
}
