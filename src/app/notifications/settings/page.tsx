import { requireOwner } from "@/lib/auth";
import { getStudentNotificationPreferences } from "@/lib/data/analytics";
import AppLayout from "@/components/layout/AppLayout";
import NotificationSettingsClient from "@/app/student/notifications/settings/NotificationSettingsClient";

export default async function NotificationSettingsPage() {
  const { profile, user } = await requireOwner();
  const prefs = await getStudentNotificationPreferences(user.id);

  return (
    <AppLayout profile={profile}>
      <NotificationSettingsClient initialPrefs={prefs} />
    </AppLayout>
  );
}
