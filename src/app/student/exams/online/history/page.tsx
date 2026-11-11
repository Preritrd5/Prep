import { PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getStudentExamAttempts } from "@/lib/data/exams-online";
import AppLayout from "@/components/layout/AppLayout";
import ExamsNavTabs from "@/components/exams/ExamsNavTabs";
import StudentExamHistoryClient from "./StudentExamHistoryClient";

export default async function StudentExamHistoryPage() {
  const { user, profile } = await requireOwner();
  const attempts = await getStudentExamAttempts(user.id);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Mock Test Attempts History"
        description="Review all your past online mock examinations, performance scores, and question-by-question evaluations."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Mock Tests", href: "/student/exams/online" },
          { label: "History" },
        ]}
      />

      <ExamsNavTabs />

      <StudentExamHistoryClient attempts={attempts} />
    </AppLayout>
  );
}
