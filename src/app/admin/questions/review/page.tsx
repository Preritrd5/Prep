import { requireRole } from "@/lib/auth";
import { getQuestions } from "@/lib/data/questions";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ReviewQueueClient from "./ReviewQueueClient";

export default async function AdminReviewQueuePage() {
  const { profile } = await requireRole("admin");

  const questions = await getQuestions();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="admin" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Question Review & Approval Queue</h1>
            <p className="text-sm text-slate-600 mt-1">
              Inspect pending, AI-generated, and bulk-imported questions. Verify syllabus alignment, options,
              and rationales before publishing to students.
            </p>
          </div>

          <ReviewQueueClient initialQuestions={questions} />
        </main>
      </div>
    </div>
  );
}
