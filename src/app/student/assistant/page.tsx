import { requireRole } from "@/lib/auth";
import { getStudentPerformanceAnalytics, getWeakTopics } from "@/lib/data/analytics";
import AppLayout from "@/components/layout/AppLayout";
import StudyAssistantClient from "./StudyAssistantClient";
import { PageHeader } from "@/components/ui/page-header";

export default async function StudentAssistantPage() {
  const { profile, user } = await requireRole("student");

  const [analytics, weakTopics] = await Promise.all([
    getStudentPerformanceAnalytics(user.id, "overall"),
    getWeakTopics(user.id),
  ]);

  const displayName = profile.full_name || profile.email.split("@")[0];

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="AI Study Assistant"
        description="Personalized conversational intelligence grounded in your syllabus coverage, MCQ accuracy history, and identified weak areas."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "AI Study Assistant" },
        ]}
      />

      <StudyAssistantClient
        analytics={analytics}
        weakTopics={weakTopics}
        studentName={displayName}
      />
    </AppLayout>
  );
}
