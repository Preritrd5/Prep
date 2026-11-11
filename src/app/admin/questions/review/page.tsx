import { PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getQuestions } from "@/lib/data/questions";
import AppLayout from "@/components/layout/AppLayout";
import ReviewQueueClient from "./ReviewQueueClient";

export default async function AdminReviewQueuePage() {
  const { profile } = await requireRole("admin");
  const questions = await getQuestions();

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Question Review & Approval Queue"
        description="Inspect pending, AI-generated, and bulk-imported questions. Verify syllabus alignment, options, and rationales before publishing to students."
        breadcrumbs={[
          { label: "Admin Console", href: "/admin/dashboard" },
          { label: "Questions", href: "/admin/questions" },
          { label: "Review Queue" },
        ]}
      />

      <ReviewQueueClient initialQuestions={questions} />
    </AppLayout>
  );
}
