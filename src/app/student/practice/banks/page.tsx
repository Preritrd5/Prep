import { requireRole } from "@/lib/auth";
import { getAllSubjects } from "@/lib/data/syllabus";
import {
  getStudentPersonalBanks,
  getQuestions,
  getStudentBookmarks,
} from "@/lib/data/questions";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import PersonalBanksClient from "./PersonalBanksClient";

export default async function StudentPersonalBanksPage() {
  const { user, profile } = await requireRole("student");

  const [personalBanks, personalQuestions, subjects, bookmarkedIds] = await Promise.all([
    getStudentPersonalBanks(user.id),
    getQuestions({ isPersonal: true }),
    getAllSubjects(),
    getStudentBookmarks(user.id),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Personal Question Banks</h1>
            <p className="text-sm text-slate-600 mt-1">
              Create custom question banks and author your own private questions for personalized revision.
            </p>
          </div>

          <PersonalBanksClient
            personalBanks={personalBanks}
            personalQuestions={personalQuestions}
            subjects={subjects}
            bookmarkedIds={bookmarkedIds}
          />
        </main>
      </div>
    </div>
  );
}
