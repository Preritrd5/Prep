import { requireRole } from "@/lib/auth";
import {
  getStudentTasks,
  getExamScheduleEvents,
  getStudentRoutines,
  getStudyPreferences,
  getStudentExams,
} from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import CalendarClient from "./CalendarClient";
import { PageHeader } from "@/components/ui/page-header";

export default async function StudentCalendarPage() {
  const { profile, user } = await requireRole("student");

  const [tasks, enrolledExams, routines, preferences] = await Promise.all([
    getStudentTasks(user.id),
    getStudentExams(user.id),
    getStudentRoutines(user.id),
    getStudyPreferences(user.id),
  ]);

  const examIds = enrolledExams.map((se) => se.exam_id);
  const events = await getExamScheduleEvents(examIds);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Study Calendar"
        description="Interactive timeline with daily, weekly, and monthly views combining study tasks, recurring routines, and official examination deadlines."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Calendar" },
        ]}
      />

      <CalendarClient
        tasks={tasks}
        events={events}
        routines={routines}
        timezone={preferences.timezone}
      />
    </AppLayout>
  );
}
