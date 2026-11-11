import { requireOwner } from "@/lib/auth";
import { getStudentTasks, getAllExams, getAllSubjects } from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import RoutineNavTabs from "@/components/routine/RoutineNavTabs";
import TasksClient from "./TasksClient";
import { PageHeader } from "@/components/ui/page-header";

export default async function StudentTasksPage() {
  const { profile, user } = await requireOwner();

  const [tasks, allExams, allSubjects] = await Promise.all([
    getStudentTasks(user.id),
    getAllExams(),
    getAllSubjects(),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Study Tasks & Daily Checklist"
        description="Track daily preparation items, manage priorities, and carry forward incomplete tasks without duplication or scheduling conflicts."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Routine & Tasks", href: "/student/routine" },
          { label: "Study Tasks" },
        ]}
      />

      <RoutineNavTabs />

      <TasksClient tasks={tasks} allExams={allExams} allSubjects={allSubjects} />
    </AppLayout>
  );
}
