import { requireRole } from "@/lib/auth";
import {
  getStudentPerformanceAnalytics,
  getSubjectWiseAnalytics,
  getTopicWiseAnalytics,
  getWeakTopics,
} from "@/lib/data/analytics";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import StudentAnalyticsClient from "./StudentAnalyticsClient";

export default async function StudentAnalyticsPage() {
  const { profile, user } = await requireRole("student");

  const [analytics, subjects, topics, weakTopics] = await Promise.all([
    getStudentPerformanceAnalytics(user.id, "overall"),
    getSubjectWiseAnalytics(user.id),
    getTopicWiseAnalytics(user.id, 3),
    getWeakTopics(user.id),
  ]);

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main id="main-content" className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <StudentAnalyticsClient
            initialAnalytics={analytics}
            subjects={subjects}
            topics={topics}
            weakTopics={weakTopics}
          />
        </main>
      </div>
    </div>
  );
}
