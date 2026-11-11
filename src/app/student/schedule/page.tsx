import { requireOwner } from "@/lib/auth";
import { getStudentExams, getExamScheduleEvents, getAllExams } from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import {
  CalendarDays,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export default async function StudentSchedulePage() {
  const { profile, user } = await requireOwner();

  const [enrolledExams, allExams] = await Promise.all([
    getStudentExams(user.id),
    getAllExams(),
  ]);

  const examIds = enrolledExams.map((se) => se.exam_id);
  const events = await getExamScheduleEvents(examIds.length > 0 ? examIds : undefined);

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="Official Examination Calendar"
        description="Verified examination dates, application windows, and admit card release milestones managed directly by platform administrators."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Exam Calendar" },
        ]}
      />

      <Card className="overflow-hidden shadow-xs p-0">
        {events.length > 0 ? (
          <div className="divide-y divide-border">
            {events.map((ev) => {
              const exam = ev.exam || allExams.find((e) => e.id === ev.exam_id);

              return (
                <div
                  key={ev.id}
                  className="p-5 hover:bg-hover-surface transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="accent" size="sm">
                        {ev.event_type}
                      </Badge>
                      {exam && (
                        <Badge variant="primary" size="sm">
                          {exam.name}
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-heading text-base font-bold text-text-primary">
                      {ev.title}
                    </h3>
                    {ev.description && (
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {ev.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-1">
                      <span className="flex items-center gap-1 font-semibold text-text-primary">
                        <Calendar className="h-3.5 w-3.5 text-text-muted" />
                        {new Date(ev.start_date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {ev.end_date && (
                          <span>
                            {" "}
                            -{" "}
                            {new Date(ev.end_date).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </span>

                      {ev.verification_date && (
                        <span className="font-mono text-[11px] text-text-muted">
                          Verified: {ev.verification_date}
                        </span>
                      )}
                    </div>
                  </div>

                  {ev.official_source_url && (
                    <a
                      href={ev.official_source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-primary shadow-xs hover:bg-hover-surface shrink-0 transition"
                    >
                      Official Source
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={<CalendarDays className="h-6 w-6" />}
              title="No Exam Schedule Events Published Yet"
              description="Official notification schedules and application deadlines will appear here once published by administrators."
            />
          </div>
        )}
      </Card>
    </AppLayout>
  );
}
