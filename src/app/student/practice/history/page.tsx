import { PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import {
  getStudentPracticeSessions,
  getStudentPracticeStats,
} from "@/lib/data/questions";
import AppLayout from "@/components/layout/AppLayout";
import PracticeNavTabs from "@/components/practice/PracticeNavTabs";
import PracticeHistoryClient from "./PracticeHistoryClient";

export default async function StudentPracticeHistoryPage() {
  const { user, profile } = await requireOwner();

  const [sessions, stats] = await Promise.all([
    getStudentPracticeSessions(user.id),
    getStudentPracticeStats(user.id),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="MCQ Practice Center — History"
        description="Review your overall preparation accuracy and history of evaluated test and learn mode sessions."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Practice", href: "/student/practice/topic" },
          { label: "History" },
        ]}
      />

      <PracticeNavTabs />

      <PracticeHistoryClient sessions={sessions} stats={stats} />
    </AppLayout>
  );
}
