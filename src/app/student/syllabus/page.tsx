import { Suspense } from "react";
import { requireOwner } from "@/lib/auth";
import { getAllExams, getStudentExams, getExamSyllabus } from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import SyllabusClient from "./SyllabusClient";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface SyllabusPageProps {
  searchParams: Promise<{ examId?: string }>;
}

export default async function StudentSyllabusPage({ searchParams }: SyllabusPageProps) {
  const { profile, user } = await requireOwner();
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
    <AppLayout profile={profile}>
      <PageHeader
        title="Syllabus Tracker"
        description="Interactive Examination → Subject → Chapter → Topic hierarchy with textbook references, official syllabus tracking, and personal notes."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Syllabus Tracker" },
        ]}
      />

      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner size="lg" label="Loading syllabus topics..." />
          </div>
        }
      >
        <SyllabusClient
          currentExam={currentExam}
          allExams={allExams}
          subjects={subjects}
        />
      </Suspense>
    </AppLayout>
  );
}
