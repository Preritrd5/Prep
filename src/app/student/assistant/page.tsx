import { requireOwner } from "@/lib/auth";
import { getStudentPerformanceAnalytics, getWeakTopics } from "@/lib/data/analytics";
import { getAllExams, getAllSubjectsWithTree } from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import StudyAssistantClient from "./StudyAssistantClient";
import { PageHeader } from "@/components/ui/page-header";

export default async function StudentAssistantPage() {
  const { profile, user } = await requireOwner();

  const [analytics, weakTopics, exams, subjects] = await Promise.all([
    getStudentPerformanceAnalytics(user.id, "overall"),
    getWeakTopics(user.id),
    getAllExams(),
    getAllSubjectsWithTree(),
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
        exams={exams}
        subjects={subjects}
      />
    </AppLayout>
  );
}
