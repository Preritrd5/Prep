import { requireRole } from "@/lib/auth";
import { getStudentNotifications } from "@/lib/data/analytics";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import NotificationsClient from "./NotificationsClient";

export default async function StudentNotificationsPage() {
  const { profile, user } = await requireRole("student");
  const notifications = await getStudentNotifications(user.id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <NotificationsClient notifications={notifications} />
        </main>
      </div>
    </div>
  );
}
