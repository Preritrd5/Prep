import { requireOwner } from "@/lib/auth";
import {
  getStudentExams,
  getStudentTasks,
  getStudentRoutines,
  getExamScheduleEvents,
} from "@/lib/data/syllabus";
import {
  getStudentPerformanceAnalytics,
  getStudentRevisionsExtended,
} from "@/lib/data/analytics";
import { getStudentPracticeSessions } from "@/lib/data/questions";
import { getStudentExamAttempts } from "@/lib/data/exams-online";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar as CalendarIcon,
  Sparkles,
  ArrowRight,
  Layers,
  Plus,
  Play,
  RotateCcw,
  Target,
  FileQuestion,
  GraduationCap,
  Upload,
  Award,
  AlertCircle,
  CheckSquare,
  Bookmark,
  CalendarDays,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function StudentDashboardPage() {
  const { profile, user } = await requireOwner();

  // Fetch real authenticated student preparation data across all 10 modules
  const [
    enrolledExams,
    tasks,
    analytics,
    routines,
    practiceSessions,
    examAttempts,
    revisions,
  ] = await Promise.all([
    getStudentExams(user.id),
    getStudentTasks(user.id),
    getStudentPerformanceAnalytics(user.id),
    getStudentRoutines(user.id),
    getStudentPracticeSessions(user.id),
    getStudentExamAttempts(user.id),
    getStudentRevisionsExtended(user.id),
  ]);

  const examIds = enrolledExams.map((se) => se.exam_id);
  const events = await getExamScheduleEvents(examIds);

  // Computations
  const completedTasksCount = tasks.filter((t) => t.status === "Completed").length;
  const pendingTasks = tasks.filter((t) => t.status !== "Completed");
  const hasExams = enrolledExams.length > 0;
  const displayName = profile.full_name || profile.email.split("@")[0];

  // Pace percentage
  const pacePercentage =
    tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  return (
    <AppLayout profile={profile}>
      {/* ================================================================== */}
      {/* SECTION 1: WELCOME & ONBOARDING TRAJECTORY BANNER                   */}
      {/* ================================================================== */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-7 lg:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary-subtle)] px-3 py-0.5 text-xs font-mono font-semibold text-primary border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>PERSONAL PREPARATION WORKSPACE</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Welcome back, {displayName}!
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
              {hasExams ? (
                <>
                  Your preparation trajectory is active. You have{" "}
                  <strong className="text-text-primary font-semibold">
                    {enrolledExams.length} examination portfolio(s)
                  </strong>{" "}
                  enrolled with{" "}
                  <strong className="text-text-primary font-semibold">
                    {analytics.completedTopics} of {analytics.totalSyllabusTopics} syllabus topics completed ({analytics.syllabusCompletionPercentage}%)
                  </strong>.
                </>
              ) : (
                <>
                  Begin your personal preparation journey by selecting target competitive examinations.
                  This will generate your structured syllabus checklist, daily routine slots, and practice tests.
                </>
              )}
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
            <Link href="/student/assistant">
              <Button variant="secondary" size="sm" leftIcon={<Sparkles className="h-4 w-4 text-primary" />}>
                AI Assistant
              </Button>
            </Link>
            <Link href="/student/questions/import">
              <Button variant="outline" size="sm" leftIcon={<Upload className="h-4 w-4 text-accent" />}>
                Bulk Import
              </Button>
            </Link>
            <Link href="/student/practice/topic">
              <Button variant="primary" size="sm" leftIcon={<Play className="h-4 w-4" />}>
                MCQ Practice
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECTION 2: PREPARATION OVERVIEW METRICS                             */}
      {/* ================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Target Examinations"
          value={enrolledExams.length}
          icon={<BookOpen className="h-5 w-5" />}
          accentColor="primary"
          description={
            hasExams
              ? `${enrolledExams.length} active examination portfolio(s)`
              : "No examinations enrolled yet"
          }
        />
        <StatCard
          title="Syllabus Progress"
          value={hasExams ? `${analytics.completedTopics}/${analytics.totalSyllabusTopics}` : "0"}
          icon={<Layers className="h-5 w-5" />}
          accentColor="accent"
          description={
            hasExams
              ? `${analytics.syllabusCompletionPercentage}% curriculum completed`
              : "Awaiting exam enrollment"
          }
        />
        <StatCard
          title="MCQ Practice Accuracy"
          value={`${analytics.overallAccuracy}%`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accentColor="success"
          description={`${analytics.mcqsAttempted} questions attempted`}
        />
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-text-secondary">
              Study Pace &amp; Tasks
            </p>
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[var(--color-primary-subtle)] text-primary border border-primary/20 shrink-0">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
                {pacePercentage}%
              </span>
              <span className="text-[11px] font-mono text-text-muted">
                {completedTasksCount}/{tasks.length} tasks
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-background-secondary overflow-hidden border border-border">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${pacePercentage}%` }}
              />
            </div>
          </div>
          <p className="mt-1 text-[11px] text-text-muted leading-tight truncate">
            {analytics.totalStudyHours}h logged • {analytics.mcqsAttempted} MCQs drill
          </p>
        </div>
      </div>

      {/* ================================================================== */}
      {/* MAIN TWO-COLUMN DASHBOARD GRID (SECTIONS 3 THROUGH 10)            */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ---------------------------------------------------------------- */}
        {/* LEFT COLUMN: CORE PREPARATION MODULES (8 OF 12 COLS)             */}
        {/* ---------------------------------------------------------------- */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION 3: SELECTED EXAMINATIONS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Selected Examinations</CardTitle>
              </div>
              <Link
                href="/student/exams"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Manage Exams →
              </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              {hasExams ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {enrolledExams.map((se) => (
                    <div
                      key={se.id}
                      className="rounded-xl border border-border bg-surface p-3.5 hover:border-primary/40 transition flex flex-col justify-between space-y-3 shadow-xs"
                    >
                      <div className="space-y-1.5">
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
                        <h4 className="font-heading text-sm font-bold text-text-primary line-clamp-1">
                          {se.exam?.name || "Examination"}
                        </h4>
                        <p className="text-[11px] text-text-muted line-clamp-1">
                          {se.exam?.category || "Competitive Exam"}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                        <Link
                          href={`/student/syllabus?examId=${se.exam_id}`}
                          className="text-primary font-semibold hover:underline flex items-center gap-1"
                        >
                          Syllabus <ArrowRight className="w-3 h-3" />
                        </Link>
                        <Link
                          href={`/student/practice/exam`}
                          className="text-text-muted hover:text-text-primary text-[11px]"
                        >
                          Practice Exam
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<BookOpen className="h-6 w-6" />}
                  title="Zero Selected Examinations"
                  description="Choose your target competitive examinations (UPSC, KAS, GATE, Railway, KEA Land Surveyor) to unlock structured preparation."
                  action={
                    <Link href="/student/exams">
                      <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
                        Select Examinations
                      </Button>
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* SECTION 4: TODAY'S STUDY SCHEDULE */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Today&apos;s Study Schedule</CardTitle>
              </div>
              <Link
                href="/student/routine"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Edit Routine →
              </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              {routines.length > 0 ? (
                <div className="space-y-2.5">
                  {routines.slice(0, 3).map((rt) => (
                    <div
                      key={rt.id}
                      className="p-3 rounded-xl border border-border bg-surface flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-subtle)] text-primary flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 truncate">
                          <p className="font-semibold text-text-primary truncate">{rt.title}</p>
                          <p className="text-[10px] text-text-muted font-mono">
                            {rt.start_time} - {rt.end_time} • {rt.day_of_week}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" size="sm" className="shrink-0">
                        Routine Slot
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Clock className="h-6 w-6" />}
                  title="No Scheduled Routine for Today"
                  description="Set up recurring daily study blocks and revision slots to maintain a disciplined preparation schedule."
                  action={
                    <Link href="/student/routine">
                      <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
                        Configure Routine
                      </Button>
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* SECTION 5: SYLLABUS PROGRESS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Syllabus Progress</CardTitle>
              </div>
              <Link
                href="/student/syllabus"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Syllabus Tracker →
              </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                  <span className="text-text-secondary">Overall Curriculum Completion</span>
                  <span className="font-mono font-bold text-primary">
                    {analytics.syllabusCompletionPercentage}% ({analytics.completedTopics} of {analytics.totalSyllabusTopics} topics)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-background-secondary overflow-hidden border border-border">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${analytics.syllabusCompletionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Progress Summary Chips */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-border">
                <div className="p-2 rounded-lg bg-surface border border-border">
                  <p className="text-[10px] font-mono text-text-muted uppercase">Completed</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {analytics.completedTopics}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-surface border border-border">
                  <p className="text-[10px] font-mono text-text-muted uppercase">Pending</p>
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    {analytics.pendingTopics}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-surface border border-border">
                  <p className="text-[10px] font-mono text-text-muted uppercase">Total Topics</p>
                  <p className="text-sm font-bold text-text-primary mt-0.5">
                    {analytics.totalSyllabusTopics}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 6: PENDING TASKS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Today&apos;s Study Tasks</CardTitle>
              </div>
              <Link
                href="/student/tasks"
                className="text-xs font-semibold text-primary hover:underline"
              >
                All Tasks ({tasks.length}) →
              </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              {tasks.length > 0 ? (
                <div className="divide-y divide-border">
                  {tasks.slice(0, 4).map((t) => (
                    <div
                      key={t.id}
                      className="py-2.5 flex items-center justify-between text-xs first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <CheckCircle2
                          className={`h-4 w-4 shrink-0 ${
                            t.status === "Completed"
                              ? "text-emerald-500"
                              : "text-text-muted"
                          }`}
                        />
                        <div className="min-w-0">
                          <p
                            className={`font-medium truncate ${
                              t.status === "Completed"
                                ? "text-text-muted line-through"
                                : "text-text-primary"
                            }`}
                          >
                            {t.title}
                          </p>
                          <p className="font-mono text-[10px] text-text-muted">
                            {t.scheduled_date} • {t.duration_minutes}m
                          </p>
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
                        className="shrink-0"
                      >
                        {t.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<CheckSquare className="h-6 w-6" />}
                  title="No Study Tasks for Today"
                  description="Create actionable daily study goals to break your competitive exam syllabus into manageable steps."
                  action={
                    <Link href="/student/tasks">
                      <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
                        Create Study Plan
                      </Button>
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* SECTION 8: RECENT MCQ PRACTICE */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Recent MCQ Practice</CardTitle>
              </div>
              <Link
                href="/student/practice/history"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Practice History →
              </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              {practiceSessions.length > 0 ? (
                <div className="space-y-2.5">
                  {practiceSessions.slice(0, 3).map((ps) => {
                    const acc =
                      ps.total_questions > 0
                        ? Math.round((ps.correct_answers / ps.total_questions) * 100)
                        : 0;
                    return (
                      <div
                        key={ps.id}
                        className="p-3 rounded-xl border border-border bg-surface flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-semibold text-text-primary truncate">
                            {ps.topic?.title || "Topic MCQ Drill"}
                          </p>
                          <p className="text-[10px] text-text-muted font-mono">
                            {ps.mode} Mode • {ps.total_questions} Questions • {new Date(ps.started_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {acc}% Accuracy
                          </p>
                          <p className="text-[10px] text-text-muted font-mono">
                            {ps.correct_answers}/{ps.total_questions} correct
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={<FileQuestion className="h-6 w-6" />}
                  title="No MCQ Attempts Yet"
                  description="Test your topic retention with untimed Learn Mode drills or real scored tests with negative marking."
                  action={
                    <Link href="/student/practice/topic">
                      <Button variant="primary" size="sm" leftIcon={<Play className="h-3.5 w-3.5" />}>
                        Start Practice
                      </Button>
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* SECTION 9: RECENT MOCK TEST RESULTS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Recent Mock Test Results</CardTitle>
              </div>
              <Link
                href="/student/exams/online/history"
                className="text-xs font-semibold text-primary hover:underline"
              >
                All Attempts ({examAttempts.length}) →
              </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              {examAttempts.length > 0 ? (
                <div className="space-y-2.5">
                  {examAttempts.slice(0, 3).map((att) => (
                    <div
                      key={att.id}
                      className="p-3 rounded-xl border border-border bg-surface flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-semibold text-text-primary truncate">
                          {att.template?.title || "Computer-Based Mock Test"}
                        </p>
                        <p className="text-[10px] text-text-muted font-mono">
                          Attempt #{att.attempt_number} • {att.status} • {att.time_taken_seconds ? `${Math.round(att.time_taken_seconds / 60)}m` : "Timed"}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-mono font-bold text-primary">
                          {att.score !== null ? `${att.score} pts` : "Pending"}
                        </p>
                        <Link
                          href={`/student/exams/online/result/${att.id}`}
                          className="text-[10px] text-primary hover:underline font-semibold"
                        >
                          View Scorecard →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Award className="h-6 w-6" />}
                  title="No Mock Examinations Attempted"
                  description="Simulate real competitive exam environments with server-enforced countdown timers and instant question-level scorecards."
                  action={
                    <Link href="/practice">
                      <Button variant="primary" size="sm" leftIcon={<Play className="h-3.5 w-3.5" />}>
                        Practice Questions
                      </Button>
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* RIGHT COLUMN: CALENDAR, REVISIONS & QUICK TOOLS (4 OF 12 COLS)    */}
        {/* ---------------------------------------------------------------- */}
        <div className="lg:col-span-4 space-y-6">
          {/* SECTION 7: UPCOMING EXAMINATION DATES */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Official Exam Dates</CardTitle>
              </div>
              <Link
                href="/student/calendar"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Calendar →
              </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
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
                      <h4 className="font-heading font-bold text-text-primary mt-1 line-clamp-1">
                        {ev.title}
                      </h4>
                      <p className="font-mono text-text-muted text-[10px]">
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
                <div className="py-5 text-center space-y-2">
                  <p className="text-xs text-text-muted">
                    No upcoming examination deadlines for your enrolled exams.
                  </p>
                  <Link href="/student/calendar">
                    <Button variant="outline" size="sm" className="text-xs">
                      View Exam Dates
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 10: REVISION REMINDERS & SPACED REPETITION */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-warning" />
                <CardTitle className="text-sm font-semibold">Revision Reminders</CardTitle>
              </div>
              <Link
                href="/student/revisions"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Manager →
              </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              {revisions.length > 0 ? (
                <div className="space-y-2.5">
                  {revisions.slice(0, 3).map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3 rounded-xl border border-border bg-surface text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-text-primary truncate">
                          {rev.topic?.title || "Syllabus Topic"}
                        </span>
                        <Badge
                          variant={
                            rev.confidence_rating === "Needs more practice" || rev.confidence_rating === "Not understood"
                              ? "destructive"
                              : "warning"
                          }
                          size="sm"
                        >
                          Rev #{rev.revision_number}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-text-muted font-mono">
                        <span>Due: {rev.scheduled_date}</span>
                        <span>Interval: {rev.interval_days}d</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-5 text-center space-y-2">
                  <p className="text-xs text-text-muted">
                    All spaced repetition items are up to date!
                  </p>
                  <Link href="/student/revisions">
                    <Button variant="outline" size="sm" className="text-xs">
                      Manage Revisions
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QUICK PREPARATION TOOLKIT */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Quick Toolkit
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 space-y-2 text-xs font-medium">
              <Link
                href="/student/assistant"
                className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface hover:bg-hover-surface transition-colors group shadow-xs"
              >
                <span className="flex items-center gap-2 text-text-primary">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Study Assistant
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-text-muted group-hover:text-primary transition" />
              </Link>

              <Link
                href="/student/questions/import"
                className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface hover:bg-hover-surface transition-colors group shadow-xs"
              >
                <span className="flex items-center gap-2 text-text-primary">
                  <Upload className="h-4 w-4 text-accent" />
                  Bulk Question Import Wizard
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-text-muted group-hover:text-accent transition" />
              </Link>

              <Link
                href="/student/exams/create"
                className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface hover:bg-hover-surface transition-colors group shadow-xs"
              >
                <span className="flex items-center gap-2 text-text-primary">
                  <Plus className="h-4 w-4 text-emerald-500" />
                  Create MCQ Examination
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-text-muted group-hover:text-emerald-500 transition" />
              </Link>

              <Link
                href="/student/practice/bookmarks"
                className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface hover:bg-hover-surface transition-colors group shadow-xs"
              >
                <span className="flex items-center gap-2 text-text-primary">
                  <Bookmark className="h-4 w-4 text-amber-500" />
                  Bookmarks &amp; Mistakes
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-text-muted group-hover:text-amber-500 transition" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
