import { requireOwner } from "@/lib/auth";
import { getQuestions } from "@/lib/data/questions";
import { getAllSubjects } from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import PersonalQuestionBankClient from "./PersonalQuestionBankClient";

export default async function PersonalQuestionBankPage() {
  const { profile } = await requireOwner();

  const [questions, subjects] = await Promise.all([
    getQuestions(),
    getAllSubjects(),
  ]);

  return (
    <AppLayout profile={profile}>
      <PersonalQuestionBankClient questions={questions} subjects={subjects} />
    </AppLayout>
  );
}
