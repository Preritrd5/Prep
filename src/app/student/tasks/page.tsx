import { requireRole } from "@/lib/auth";
import { getStudentTasks, getAllExams, getAllSubjects } from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import TasksClient from "./TasksClient";
import { PageHeader } from "@/components/ui/page-header";

export default async function StudentTasksPage() {
  const { profile, user } = await requireRole("student");

  const [tasks, allExams, allSubjects] = await Promise.all([
    getStudentTasks(user.id),
    getAllExams(),
    getAllSubjects(),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Study Task Management"
        description="Track daily preparation items, manage priorities, and carry forward incomplete tasks without duplication or scheduling conflicts."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Study Tasks" },
        ]}
      />

      <TasksClient tasks={tasks} allExams={allExams} allSubjects={allSubjects} />
    </AppLayout>
  );
}
