import { requireRole } from "@/lib/auth";
import { getStudentPerformanceAnalytics } from "@/lib/data/analytics";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import StudentReportsClient from "./StudentReportsClient";

export default async function StudentReportsPage() {
  const { profile, user } = await requireRole("student");

  const [daily, weekly, monthly, overall] = await Promise.all([
    getStudentPerformanceAnalytics(user.id, "daily"),
    getStudentPerformanceAnalytics(user.id, "weekly"),
    getStudentPerformanceAnalytics(user.id, "monthly"),
    getStudentPerformanceAnalytics(user.id, "overall"),
  ]);

  const displayName = profile.full_name || profile.email.split("@")[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <StudentReportsClient
            dailyAnalytics={daily}
            weeklyAnalytics={weekly}
            monthlyAnalytics={monthly}
            overallAnalytics={overall}
            studentName={displayName}
          />
        </main>
      </div>
    </div>
  );
}
