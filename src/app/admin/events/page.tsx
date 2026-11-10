import { requireRole } from "@/lib/auth";
import { getExamScheduleEvents, getAllExams } from "@/lib/data/syllabus";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AdminEventsClient from "./AdminEventsClient";

export default async function AdminEventsPage() {
  const { profile } = await requireRole("admin");

  const [events, exams] = await Promise.all([
    getExamScheduleEvents(),
    getAllExams(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="admin" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Official Exam Calendar Management</h1>
            <p className="text-sm text-slate-600 mt-1">
              Publish and maintain official examination dates, application deadlines, and admit card
              schedules with verified source URLs.
            </p>
          </div>

          <AdminEventsClient events={events} exams={exams} />
        </main>
      </div>
    </div>
  );
}
