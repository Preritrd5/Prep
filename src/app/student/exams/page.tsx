import { PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getAllExams, getStudentExams } from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import ExamsClient from "./ExamsClient";

export default async function StudentExamsPage() {
  const { profile, user } = await requireRole("student");

  const [allExams, enrolledExams] = await Promise.all([
    getAllExams(),
    getStudentExams(user.id),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Examination Management"
        description="Select multiple competitive examinations, set your individual target dates, and manage preparation priorities."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Examinations" },
        ]}
      />

      <ExamsClient allExams={allExams} enrolledExams={enrolledExams} />
    </AppLayout>
  );
}
