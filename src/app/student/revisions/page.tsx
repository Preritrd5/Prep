import { requireRole } from "@/lib/auth";
import { getStudentRevisionsExtended } from "@/lib/data/analytics";
import { getStudentExams, getExamSyllabus } from "@/lib/data/syllabus";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import RevisionsClient from "./RevisionsClient";

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <RevisionsClient
            revisions={revisions}
            availableTopics={availableTopics}
          />
        </main>
      </div>
    </div>
  );
}
