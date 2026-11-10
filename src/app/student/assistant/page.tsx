import { requireRole } from "@/lib/auth";
import { getStudentPerformanceAnalytics, getWeakTopics } from "@/lib/data/analytics";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import StudyAssistantClient from "./StudyAssistantClient";

export default async function StudentAssistantPage() {
  const { profile, user } = await requireRole("student");

  const [analytics, weakTopics] = await Promise.all([
    getStudentPerformanceAnalytics(user.id, "overall"),
    getWeakTopics(user.id),
  ]);

  const displayName = profile.full_name || profile.email.split("@")[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <StudyAssistantClient
            analytics={analytics}
            weakTopics={weakTopics}
            studentName={displayName}
          />
        </main>
      </div>
    </div>
  );
}
