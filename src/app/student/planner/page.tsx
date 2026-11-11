import { requireOwner } from "@/lib/auth";
import {
  getStudentExams,
  getAllExams,
  getStudyPreferences,
} from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import RoutineNavTabs from "@/components/routine/RoutineNavTabs";
import PlannerClient from "./PlannerClient";
import { PageHeader } from "@/components/ui/page-header";

export default async function StudentPlannerPage() {
  const { profile, user } = await requireOwner();

  const [enrolledExams, allExams, preferences] = await Promise.all([
    getStudentExams(user.id),
    getAllExams(),
    getStudyPreferences(user.id),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Weekly Study Planner"
        description="Generate deterministic, conflict-free preparation schedules matching your daily study hours, pending syllabus topics, and exam target timelines."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Routine & Tasks", href: "/student/routine" },
          { label: "Study Planner" },
        ]}
      />

      <RoutineNavTabs />

      <PlannerClient
        enrolledExams={enrolledExams}
        allExams={allExams}
        preferences={preferences}
      />
    </AppLayout>
  );
}
