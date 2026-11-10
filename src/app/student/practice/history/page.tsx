import { requireRole } from "@/lib/auth";
import {
  getStudentPracticeSessions,
  getStudentPracticeStats,
} from "@/lib/data/questions";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import PracticeHistoryClient from "./PracticeHistoryClient";

export default async function StudentPracticeHistoryPage() {
  const { user, profile } = await requireRole("student");

  const [sessions, stats] = await Promise.all([
    getStudentPracticeSessions(user.id),
    getStudentPracticeStats(user.id),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Practice Session History</h1>
            <p className="text-sm text-slate-600 mt-1">
              Review your overall preparation accuracy and history of evaluated test and learn mode sessions.
            </p>
          </div>

          <PracticeHistoryClient sessions={sessions} stats={stats} />
        </main>
      </div>
    </div>
  );
}
