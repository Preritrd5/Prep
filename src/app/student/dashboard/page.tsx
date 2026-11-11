import { requireRole } from "@/lib/auth";
import {
  getStudentExams,
  getStudentTasks,
  getExamScheduleEvents,
} from "@/lib/data/syllabus";
import {
  getStudentPerformanceAnalytics,
  getStudentStudyRecommendations,
} from "@/lib/data/analytics";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowRight,
  ListTodo,
  Layers,
  Plus,
  BarChart3,
  Bot,
  Play,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function StudentDashboardPage() {
  const { profile, user } = await requireRole("student");

  const [enrolledExams, tasks, recommendations, analytics] = await Promise.all([
    getStudentExams(user.id),
    getStudentTasks(user.id),
    getStudentStudyRecommendations(user.id),
    getStudentPerformanceAnalytics(user.id),
  ]);

  const examIds = enrolledExams.map((se) => se.exam_id);
  const events = await getExamScheduleEvents(examIds);

  // Calculate real metrics
  const completedTasksCount = tasks.filter((t) => t.status === "Completed").length;
  const pendingTasksCount = tasks.filter(
    (t) => t.status === "Upcoming" || t.status === "In Progress"
  ).length;
  const pacePercentage =
    tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  const displayName = profile.full_name || profile.email.split("@")[0];

  return (
    <AppLayout profile={profile}>
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary-subtle)] px-3 py-0.5 text-xs font-mono font-semibold text-primary border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>STUDENT PREPARATION WORKSPACE</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Welcome back, {displayName}!
            </h1>
            <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
              Your preparation trajectory is active. You have{" "}
              <strong className="text-text-primary font-semibold">
                {enrolledExams.length} examination(s)
              </strong>{" "}
              enrolled with{" "}
              <strong className="text-text-primary font-semibold">
                {analytics.completedTopics} of {analytics.totalSyllabusTopics} syllabus topics completed ({analytics.syllabusCompletionPercentage}%)
              </strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link href="/student/analytics">
              <Button variant="primary" size="sm" leftIcon={<BarChart3 className="h-4 w-4" />}>
                Analytics
              </Button>
            </Link>
            <Link href="/student/assistant">
              <Button variant="secondary" size="sm" leftIcon={<Bot className="h-4 w-4 text-primary" />}>
                AI Assistant
              </Button>
            </Link>
            <Link href="/student/exams/online">
              <Button variant="outline" size="sm" leftIcon={<Play className="h-4 w-4 text-accent" />}>
                Mock Tests
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Real Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Target Examinations"
          value={enrolledExams.length}
          icon={<BookOpen className="h-5 w-5" />}
          accentColor="primary"
          description={
            enrolledExams.length > 0
              ? "Active preparation portfolios"
              : "No examinations selected yet"
          }
        />
        <StatCard
          title="Tasks Completed"
          value={completedTasksCount}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accentColor="success"
          description="Finished study sessions and assignments"
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasksCount}
          icon={<ListTodo className="h-5 w-5" />}
          accentColor="warning"
          description="Eligible for routine carry-forward"
        />
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-text-secondary">
              Preparation Pace
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-subtle)] text-primary border border-primary/20">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              {pacePercentage}%
            </span>
            <div className="mt-2 h-2 w-full rounded-full bg-background-secondary overflow-hidden border border-border">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${pacePercentage}%` }}
              />
            </div>
          </div>
          <p className="mt-1.5 text-xs text-text-muted leading-relaxed">
            {tasks.length > 0
              ? `${completedTasksCount} of ${tasks.length} total tasks`
              : "No study tasks scheduled yet"}
          </p>
        </div>
      </div>

      {/* Recommendations Banner */}
      {recommendations.length > 0 && (
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-subtle)] text-primary border border-primary/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-text-primary">
                  Personalized Study Recommendations
                </h3>
                <p className="text-xs text-text-secondary">
                  Targeted suggestions formulated from your syllabus targets and performance.
                </p>
              </div>
            </div>
            <Link
              href="/student/analytics"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0"
            >
              View Weak Areas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.id}
                className="rounded-xl border border-border bg-surface p-4 flex flex-col justify-between space-y-3 transition-colors hover:border-primary/40 shadow-xs"
              >
                <div className="space-y-1.5">
                  <Badge variant="primary" size="sm">
                    {rec.recommendation_type}
                  </Badge>
                  <h4 className="font-heading text-xs font-bold text-text-primary">
                    {rec.title}
                  </h4>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    {rec.reason}
                  </p>
                </div>

                {rec.action_url && (
                  <Link
                    href={rec.action_url}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline transition pt-2 border-t border-border"
                  >
                    Take Action <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Enrolled Exams & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enrolled Examinations */}
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="font-heading text-base font-bold text-text-primary">
                Selected Examination Portfolios
              </h3>
              <Link
                href="/student/exams"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Manage Exams →
              </Link>
            </div>

            {enrolledExams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {enrolledExams.map((se) => (
                  <div
                    key={se.id}
                    className="rounded-xl border border-border bg-surface p-4 hover:border-primary/40 transition flex flex-col justify-between space-y-3 shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="primary" size="sm">
                          Priority {se.priority}
                        </Badge>
                        {se.target_date && (
                          <span className="font-mono text-[10px] text-text-muted">
                            Target: {se.target_date}
                          </span>
                        )}
                      </div>
                      <h4 className="font-heading text-sm font-bold text-text-primary">
                        {se.exam?.name || "Examination"}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                      <Link
                        href={`/student/syllabus?examId=${se.exam_id}`}
                        className="text-primary font-semibold hover:underline"
                      >
                        Browse Syllabus →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<BookOpen className="h-6 w-6" />}
                title="No examinations selected"
                description="Choose target competitive examinations to activate your syllabus tracking."
                action={
                  <Link href="/student/exams">
                    <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
                      Enroll in an examination
                    </Button>
                  </Link>
                }
              />
            )}
          </Card>

          {/* Tasks Preview */}
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="font-heading text-base font-bold text-text-primary">
                Upcoming Study Tasks
              </h3>
              <Link
                href="/student/tasks"
                className="text-xs font-semibold text-primary hover:underline"
              >
                View All Tasks →
              </Link>
            </div>

            {tasks.length > 0 ? (
              <div className="divide-y divide-border">
                {tasks.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    className="py-3 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2
                        className={`h-4 w-4 ${
                          t.status === "Completed"
                            ? "text-success"
                            : "text-text-muted"
                        }`}
                      />
                      <div>
                        <span
                          className={`font-semibold ${
                            t.status === "Completed"
                              ? "text-text-muted line-through"
                              : "text-text-primary"
                          }`}
                        >
                          {t.title}
                        </span>
                        <span className="font-mono text-[11px] text-text-muted block mt-0.5">
                          {t.scheduled_date} • {t.duration_minutes}m
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={
                        t.status === "Completed"
                          ? "success"
                          : t.status === "In Progress"
                          ? "primary"
                          : "secondary"
                      }
                      size="sm"
                    >
                      {t.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-xs text-text-muted">
                No active tasks. Use the Study Planner to generate your schedule.
              </p>
            )}
          </Card>
        </div>

        {/* Right Column: Events & Quick Shortcuts */}
        <div className="space-y-6">
          {/* Official Exam Calendar */}
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="font-heading text-base font-bold text-text-primary">
                Official Exam Calendar
              </h3>
              <Link
                href="/student/schedule"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Full Calendar →
              </Link>
            </div>

            {events.length > 0 ? (
              <div className="space-y-3">
                {events.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-xl border border-border bg-surface p-3 text-xs space-y-1 shadow-xs"
                  >
                    <Badge variant="accent" size="sm">
                      {ev.event_type}
                    </Badge>
                    <h4 className="font-heading font-bold text-text-primary mt-1">
                      {ev.title}
                    </h4>
                    <p className="font-mono text-text-muted text-[11px]">
                      {new Date(ev.start_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted text-center py-4">
                No upcoming examination deadlines for your enrolled exams.
              </p>
            )}
          </Card>

          {/* Study Tools Quick Navigation */}
          <Card className="p-6">
            <div className="border-b border-border pb-3 mb-4">
              <h3 className="font-heading text-base font-bold text-text-primary">
                Study Management Tools
              </h3>
            </div>

            <div className="space-y-2 text-xs font-medium">
              <Link
                href="/student/routine"
                className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface hover:bg-hover-surface transition-colors group shadow-xs"
              >
                <span className="flex items-center gap-2 text-text-primary">
                  <Clock className="h-4 w-4 text-primary" />
                  Daily Routine & Slots
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-text-muted group-hover:text-primary transition" />
              </Link>

              <Link
                href="/student/calendar"
                className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface hover:bg-hover-surface transition-colors group shadow-xs"
              >
                <span className="flex items-center gap-2 text-text-primary">
                  <Calendar className="h-4 w-4 text-primary" />
                  Interactive Calendar
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-text-muted group-hover:text-primary transition" />
              </Link>

              <Link
                href="/student/revisions"
                className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface hover:bg-hover-surface transition-colors group shadow-xs"
              >
                <span className="flex items-center gap-2 text-text-primary">
                  <Layers className="h-4 w-4 text-primary" />
                  Spaced Revision Manager
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-text-muted group-hover:text-primary transition" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
