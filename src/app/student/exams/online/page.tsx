import { requireRole } from "@/lib/auth";
import { getStudentAvailableExams } from "@/lib/data/exams-online";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import StudentExamsClient from "./StudentExamsClient";

export default async function StudentOnlineExamsPage() {
  const { user, profile } = await requireRole("student");
  const { availableExams, studentAttempts } = await getStudentAvailableExams(user.id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <StudentExamsClient
            availableExams={availableExams}
            studentAttempts={studentAttempts}
          />
        </main>
      </div>
    </div>
  );
}
