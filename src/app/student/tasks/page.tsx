import { requireRole } from "@/lib/auth";
import { getStudentTasks, getAllExams, getAllSubjects } from "@/lib/data/syllabus";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import TasksClient from "./TasksClient";

export default async function StudentTasksPage() {
  const { profile, user } = await requireRole("student");

  const [tasks, allExams, allSubjects] = await Promise.all([
    getStudentTasks(user.id),
    getAllExams(),
    getAllSubjects(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Study Task Management</h1>
            <p className="text-sm text-slate-600 mt-1">
              Track daily preparation items, manage priorities, and carry forward incomplete tasks
              without duplication or scheduling conflicts.
            </p>
          </div>

          <TasksClient tasks={tasks} allExams={allExams} allSubjects={allSubjects} />
        </main>
      </div>
    </div>
  );
}
