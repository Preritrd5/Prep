import { requireRole } from "@/lib/auth";
import {
  getStudentExams,
  getAllExams,
  getStudyPreferences,
} from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import PlannerClient from "./PlannerClient";
import { PageHeader } from "@/components/ui/page-header";

export default async function StudentPlannerPage() {
  const { profile, user } = await requireRole("student");

  const [enrolledExams, allExams, preferences] = await Promise.all([
    getStudentExams(user.id),
    getAllExams(),
    getStudyPreferences(user.id),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Automatic Study Planner"
        description="Generate deterministic, conflict-free preparation schedules matching your daily study hours, pending syllabus topics, and exam target timelines."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Study Planner" },
        ]}
      />

      <PlannerClient
        enrolledExams={enrolledExams}
        allExams={allExams}
        preferences={preferences}
      />
    </AppLayout>
  );
}
