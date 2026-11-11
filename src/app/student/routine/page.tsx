import { requireRole } from "@/lib/auth";
import {
  getStudentRoutines,
  getStudyPreferences,
  getAllExams,
  getAllSubjects,
} from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import RoutineClient from "./RoutineClient";
import { PageHeader } from "@/components/ui/page-header";

export default async function StudentRoutinePage() {
  const { profile, user } = await requireRole("student");

  const [routines, preferences, allExams, allSubjects] = await Promise.all([
    getStudentRoutines(user.id),
    getStudyPreferences(user.id),
    getAllExams(),
    getAllSubjects(),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Daily Routine & Preferences"
        description="Design recurring weekly study routines, configure time blocks across weekdays, and manage study preference rules."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Daily Routine" },
        ]}
      />

      <RoutineClient
        routines={routines}
        preferences={preferences}
        allExams={allExams}
        allSubjects={allSubjects}
      />
    </AppLayout>
  );
}
