import { requireRole } from "@/lib/auth";
import {
  getStudentRoutines,
  getStudyPreferences,
  getAllExams,
  getAllSubjects,
} from "@/lib/data/syllabus";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import RoutineClient from "./RoutineClient";

export default async function StudentRoutinePage() {
  const { profile, user } = await requireRole("student");

  const [routines, preferences, allExams, allSubjects] = await Promise.all([
    getStudentRoutines(user.id),
    getStudyPreferences(user.id),
    getAllExams(),
    getAllSubjects(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Daily Routine Management</h1>
            <p className="text-sm text-slate-600 mt-1">
              Design recurring weekly study routines, configure time blocks across weekdays,
              and manage study preference rules.
            </p>
          </div>

          <RoutineClient
            routines={routines}
            preferences={preferences}
            allExams={allExams}
            allSubjects={allSubjects}
          />
        </main>
      </div>
    </div>
  );
}
