import { Suspense } from "react";
import { requireRole } from "@/lib/auth";
import { getAllExams, getStudentExams, getExamSyllabus } from "@/lib/data/syllabus";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import SyllabusClient from "./SyllabusClient";

interface SyllabusPageProps {
  searchParams: Promise<{ examId?: string }>;
}

export default async function StudentSyllabusPage({ searchParams }: SyllabusPageProps) {
  const { profile, user } = await requireRole("student");
  const params = await searchParams;

  const [allExams, enrolledExams] = await Promise.all([
    getAllExams(),
    getStudentExams(user.id),
  ]);

  // Determine active exam
  let activeExamId = params.examId;
  if (!activeExamId && enrolledExams.length > 0) {
    activeExamId = enrolledExams[0].exam_id;
  }
  if (!activeExamId && allExams.length > 0) {
    activeExamId = allExams[0].id;
  }

  const { exam: currentExam, subjects } = await getExamSyllabus(
    activeExamId || "",
    user.id
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Syllabus Tracker</h1>
            <p className="text-sm text-slate-600 mt-1">
              Interactive Examination → Subject → Chapter → Topic hierarchy with textbook
              references, official syllabus tracking, and personal notes.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              </div>
            }
          >
            <SyllabusClient
              currentExam={currentExam}
              allExams={allExams}
              subjects={subjects}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
