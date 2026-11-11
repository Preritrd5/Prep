import { PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getStudentAvailableExams } from "@/lib/data/exams-online";
import AppLayout from "@/components/layout/AppLayout";
import ExamsNavTabs from "@/components/exams/ExamsNavTabs";
import StudentExamsClient from "./StudentExamsClient";

export default async function StudentOnlineExamsPage() {
  const { user, profile } = await requireOwner();
  const { availableExams, studentAttempts } = await getStudentAvailableExams(user.id);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Mock Tests & Computer-Based Testing (CBT)"
        description="Simulate real computer-based competitive examinations under timed, server-enforced conditions."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Mock Tests" },
        ]}
      />

      <ExamsNavTabs />

      <StudentExamsClient
        availableExams={availableExams}
        studentAttempts={studentAttempts}
      />
    </AppLayout>
  );
}
