import { requireOwner } from "@/lib/auth";
import { getQuestions } from "@/lib/data/questions";
import { getAllSubjects } from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import AdminQuestionsNavTabs from "@/components/admin/AdminQuestionsNavTabs";
import AdminQuestionsClient from "./AdminQuestionsClient";

export default async function AdminQuestionsPage() {
  const { profile } = await requireOwner();

  const [questions, subjects] = await Promise.all([
    getQuestions(),
    getAllSubjects(),
  ]);

  return (
    <AppLayout profile={profile}>
      <AdminQuestionsNavTabs />
      <AdminQuestionsClient questions={questions} subjects={subjects} />
    </AppLayout>
  );
}
