import { requireRole } from "@/lib/auth";
import { getStudentRevisionsExtended } from "@/lib/data/analytics";
import { getStudentExams, getExamSyllabus } from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import RevisionsClient from "./RevisionsClient";
import { PageHeader } from "@/components/ui/page-header";

export default async function StudentRevisionsPage() {
  const { profile, user } = await requireRole("student");

  const [revisions, enrolledExams] = await Promise.all([
    getStudentRevisionsExtended(user.id),
    getStudentExams(user.id),
  ]);

  // Collect available topics from enrolled exams
  const availableTopicsMap = new Map<string, { id: string; title: string; subjectName: string }>();

  for (const se of enrolledExams) {
    const { subjects } = await getExamSyllabus(se.exam_id);
    for (const sub of subjects || []) {
      for (const ch of sub.chapters || []) {
        for (const top of ch.topics || []) {
          if (!availableTopicsMap.has(top.id)) {
            availableTopicsMap.set(top.id, {
              id: top.id,
              title: top.title,
              subjectName: sub.name,
            });
          }
        }
      }
    }
  }

  const availableTopics = Array.from(availableTopicsMap.values());

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Spaced Repetition & Revision Tracker"
        description="Automated retention intervals (1d, 3d, 7d, 21d, 45d, 90d) to cement formulas, theory, and problem archetypes."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Revisions" },
        ]}
      />

      <RevisionsClient
        revisions={revisions}
        availableTopics={availableTopics}
      />
    </AppLayout>
  );
}
