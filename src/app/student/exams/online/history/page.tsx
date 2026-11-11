import { PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getStudentExamAttempts } from "@/lib/data/exams-online";
import AppLayout from "@/components/layout/AppLayout";
import StudentExamHistoryClient from "./StudentExamHistoryClient";

export default async function StudentExamHistoryPage() {
  const { user, profile } = await requireRole("student");
  const attempts = await getStudentExamAttempts(user.id);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Online Examination History"
        description="Review all your past online mock examinations, performance scores, and question-by-question evaluations."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Online Exams", href: "/student/exams/online" },
          { label: "History" },
        ]}
      />

      <StudentExamHistoryClient attempts={attempts} />
    </AppLayout>
  );
}
