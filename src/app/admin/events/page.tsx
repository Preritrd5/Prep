import { requireOwner } from "@/lib/auth";
import { getExamScheduleEvents, getAllExams } from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import AdminExamsNavTabs from "@/components/admin/AdminExamsNavTabs";
import AdminEventsClient from "./AdminEventsClient";
import { PageHeader } from "@/components/ui/page-header";

export default async function AdminEventsPage() {
  const { profile } = await requireOwner();

  const [events, exams] = await Promise.all([
    getExamScheduleEvents(),
    getAllExams(),
  ]);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Official Exam Calendar Management"
        description="Publish and maintain official examination dates, application deadlines, and admit card schedules with verified source URLs."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Official Events" },
        ]}
      />

      <AdminExamsNavTabs />

      <AdminEventsClient events={events} exams={exams} />
    </AppLayout>
  );
}
