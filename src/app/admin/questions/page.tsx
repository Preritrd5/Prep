import { requireRole } from "@/lib/auth";
import { getQuestions } from "@/lib/data/questions";
import { getAllSubjects } from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import AdminQuestionsClient from "./AdminQuestionsClient";

export default async function AdminQuestionsPage() {
  const { profile } = await requireRole("admin");

  const [questions, subjects] = await Promise.all([
    getQuestions(),
    getAllSubjects(),
  ]);

  return (
    <AppLayout profile={profile}>
      <AdminQuestionsClient questions={questions} subjects={subjects} />
    </AppLayout>
  );
}
