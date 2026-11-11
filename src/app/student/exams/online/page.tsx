import { PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getStudentAvailableExams } from "@/lib/data/exams-online";
import AppLayout from "@/components/layout/AppLayout";
import StudentExamsClient from "./StudentExamsClient";

export default async function StudentOnlineExamsPage() {
  const { user, profile } = await requireRole("student");
  const { availableExams, studentAttempts } = await getStudentAvailableExams(user.id);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Online Examination & Mock Test Portal"
        description="Simulate real computer-based competitive examinations under timed, server-enforced conditions."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Online Exams" },
        ]}
      />

      <StudentExamsClient
        availableExams={availableExams}
        studentAttempts={studentAttempts}
      />
    </AppLayout>
  );
}
