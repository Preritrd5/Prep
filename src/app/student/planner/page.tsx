import { requireRole } from "@/lib/auth";
import {
  getStudentExams,
  getAllExams,
  getStudyPreferences,
} from "@/lib/data/syllabus";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import PlannerClient from "./PlannerClient";

export default async function StudentPlannerPage() {
  const { profile, user } = await requireRole("student");

  const [enrolledExams, allExams, preferences] = await Promise.all([
    getStudentExams(user.id),
    getAllExams(),
    getStudyPreferences(user.id),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Automatic Study Planner</h1>
            <p className="text-sm text-slate-600 mt-1">
              Generate deterministic, conflict-free preparation schedules matching your daily study
              hours, pending syllabus topics, and exam target timelines.
            </p>
          </div>

          <PlannerClient
            enrolledExams={enrolledExams}
            allExams={allExams}
            preferences={preferences}
          />
        </main>
      </div>
    </div>
  );
}
