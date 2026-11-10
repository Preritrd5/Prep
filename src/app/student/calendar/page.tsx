import { requireRole } from "@/lib/auth";
import {
  getStudentTasks,
  getExamScheduleEvents,
  getStudentRoutines,
  getStudyPreferences,
  getStudentExams,
} from "@/lib/data/syllabus";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import CalendarClient from "./CalendarClient";

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Study Calendar</h1>
            <p className="text-sm text-slate-600 mt-1">
              Interactive timeline with daily, weekly, and monthly views combining study tasks,
              recurring routines, and official examination deadlines.
            </p>
          </div>

          <CalendarClient
            tasks={tasks}
            events={events}
            routines={routines}
            timezone={preferences.timezone}
          />
        </main>
      </div>
    </div>
  );
}
