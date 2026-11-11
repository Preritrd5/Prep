import { requireOwner } from "@/lib/auth";
import {
  getStudentPerformanceAnalytics,
  getSubjectWiseAnalytics,
  getTopicWiseAnalytics,
  getWeakTopics,
} from "@/lib/data/analytics";
import AppLayout from "@/components/layout/AppLayout";
import AnalyticsNavTabs from "@/components/analytics/AnalyticsNavTabs";
import StudentAnalyticsClient from "./StudentAnalyticsClient";

export default async function StudentAnalyticsPage() {
  const { profile, user } = await requireOwner();

  const [analytics, subjects, topics, weakTopics] = await Promise.all([
    getStudentPerformanceAnalytics(user.id, "overall"),
    getSubjectWiseAnalytics(user.id),
    getTopicWiseAnalytics(user.id, 3),
    getWeakTopics(user.id),
  ]);

  return (
    <AppLayout profile={profile}>
      <AnalyticsNavTabs />
      <StudentAnalyticsClient
        initialAnalytics={analytics}
        subjects={subjects}
        topics={topics}
        weakTopics={weakTopics}
      />
    </AppLayout>
  );
}
