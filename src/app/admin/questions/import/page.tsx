import { requireRole } from "@/lib/auth";
import { getAllExams, getAllSubjects } from "@/lib/data/syllabus";
import { getImportBatches } from "@/lib/data/questions";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ImportWizard from "./ImportWizard";

export default async function AdminImportQuestionsPage() {
  const { profile } = await requireRole("admin");

  const [exams, subjects, recentBatches] = await Promise.all([
    getAllExams(),
    getAllSubjects(),
    getImportBatches(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="admin" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Bulk Import Questions</h1>
            <p className="text-sm text-slate-600 mt-1">
              Upload spreadsheets (.xlsx / .csv) to batch import multiple-choice questions into the repository.
            </p>
          </div>

          <ImportWizard exams={exams} subjects={subjects} recentBatches={recentBatches} />
        </main>
      </div>
    </div>
  );
}
