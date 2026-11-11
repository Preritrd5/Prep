import { PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getAllSubjects } from "@/lib/data/syllabus";
import {
  getStudentPersonalBanks,
  getQuestions,
  getStudentBookmarks,
} from "@/lib/data/questions";
import AppLayout from "@/components/layout/AppLayout";
import PracticeNavTabs from "@/components/practice/PracticeNavTabs";
import PersonalBanksClient from "./PersonalBanksClient";

export default async function StudentPersonalBanksPage() {
  const { user, profile } = await requireOwner();

  const [personalBanks, personalQuestions, subjects, bookmarkedIds] = await Promise.all([
    getStudentPersonalBanks(user.id),
    getQuestions({ isPersonal: true }),
    getAllSubjects(),
    getStudentBookmarks(user.id),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="MCQ Practice Center — Question Banks"
        description="Create custom question banks and author your own private questions for personalized revision."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Practice", href: "/student/practice/topic" },
          { label: "Question Banks" },
        ]}
      />

      <PracticeNavTabs />

      <PersonalBanksClient
        personalBanks={personalBanks}
        personalQuestions={personalQuestions}
        subjects={subjects}
        bookmarkedIds={bookmarkedIds}
      />
    </AppLayout>
  );
}
