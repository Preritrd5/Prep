import { PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getAllExams, getStudentExams } from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import ExamsNavTabs from "@/components/exams/ExamsNavTabs";
import ExamsClient from "./ExamsClient";

export default async function StudentExamsPage() {
  const { profile, user } = await requireOwner();

  const [allExams, enrolledExams] = await Promise.all([
    getAllExams(),
    getStudentExams(user.id),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Target Competitive Examinations"
        description="Select multiple competitive examinations, set your individual target dates, and manage preparation priorities."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Examinations" },
        ]}
      />

      <ExamsNavTabs />

      <ExamsClient allExams={allExams} enrolledExams={enrolledExams} />
    </AppLayout>
  );
}
