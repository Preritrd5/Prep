import { requireRole } from "@/lib/auth";
import { getStudentPerformanceAnalytics } from "@/lib/data/analytics";
import AppLayout from "@/components/layout/AppLayout";
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
    <AppLayout profile={profile}>
      <StudentReportsClient
        dailyAnalytics={daily}
        weeklyAnalytics={weekly}
        monthlyAnalytics={monthly}
        overallAnalytics={overall}
        studentName={displayName}
      />
    </AppLayout>
  );
}
