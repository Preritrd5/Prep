import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAllExams, getAllSubjects, getExamScheduleEvents } from "@/lib/data/syllabus";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import type { Profile } from "@/lib/types";
import {
  Users,
  Layers,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  CalendarDays,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AdminDashboardPage() {
  const { profile } = await requireRole("admin");
  const supabase = await createClient();

  // Fetch real registered students count and recent student list
  const {
    data: rawStudents,
    count: studentCount,
  } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .eq("role", "student")
    .order("created_at", { ascending: false })
    .limit(10);

  const students = (rawStudents as Profile[] | null) || [];

  const [exams, subjects, events] = await Promise.all([
    getAllExams(),
    getAllSubjects(),
    getExamScheduleEvents(),
  ]);

  const totalRegisteredStudents = studentCount ?? 0;

  return (
    <AppLayout profile={profile}>
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary-subtle)] px-3 py-0.5 text-xs font-mono font-semibold text-primary border border-primary/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>PLATFORM GOVERNANCE & CONTROL PLANE</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Administration Overview
            </h1>
            <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
              Oversee registered students, author hierarchical syllabus content, manage
              reusable subject mappings, and publish verified examination schedules.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Badge variant="success" size="md">
              PostgreSQL Active
            </Badge>
          </div>
        </div>
      </div>

      {/* Real Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Students"
          value={totalRegisteredStudents}
          icon={<Users className="h-5 w-5" />}
          accentColor="primary"
          description="Active student enrollment records"
        />
        <StatCard
          title="Examinations"
          value={exams.length}
          icon={<BookOpen className="h-5 w-5" />}
          accentColor="accent"
          description="GATE, KAS, UPSC, Railway, KEA, AE"
        />
        <StatCard
          title="Curriculum Subjects"
          value={subjects.length}
          icon={<Layers className="h-5 w-5" />}
          accentColor="warning"
          description="Reusable across multiple exam syllabuses"
        />
        <StatCard
          title="Published Events"
          value={events.length}
          icon={<CalendarDays className="h-5 w-5" />}
          accentColor="success"
          description="Verified official exam calendar entries"
        />
      </div>

      {/* Quick Management Links Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/exams">
          <Card className="p-4 flex items-center justify-between h-full hover:border-primary/40 transition-colors shadow-xs">
            <div>
              <h4 className="font-heading font-bold text-sm text-text-primary">Exam Management</h4>
              <p className="text-xs text-text-secondary mt-0.5">Add & configure exams</p>
            </div>
            <ArrowRight className="h-4 w-4 text-primary shrink-0 ml-2" />
          </Card>
        </Link>

        <Link href="/admin/subjects">
          <Card className="p-4 flex items-center justify-between h-full hover:border-primary/40 transition-colors shadow-xs">
            <div>
              <h4 className="font-heading font-bold text-sm text-text-primary">Subject Directory</h4>
              <p className="text-xs text-text-secondary mt-0.5">Manage common subjects</p>
            </div>
            <ArrowRight className="h-4 w-4 text-primary shrink-0 ml-2" />
          </Card>
        </Link>

        <Link href="/admin/syllabus">
          <Card className="p-4 flex items-center justify-between h-full hover:border-primary/40 transition-colors shadow-xs">
            <div>
              <h4 className="font-heading font-bold text-sm text-text-primary">Syllabus & Topics</h4>
              <p className="text-xs text-text-secondary mt-0.5">Chapters, references & weights</p>
            </div>
            <ArrowRight className="h-4 w-4 text-primary shrink-0 ml-2" />
          </Card>
        </Link>

        <Link href="/admin/events">
          <Card className="p-4 flex items-center justify-between h-full hover:border-primary/40 transition-colors shadow-xs">
            <div>
              <h4 className="font-heading font-bold text-sm text-text-primary">Official Events</h4>
              <p className="text-xs text-text-secondary mt-0.5">Publish exam dates & links</p>
            </div>
            <ArrowRight className="h-4 w-4 text-primary shrink-0 ml-2" />
          </Card>
        </Link>
      </div>

      {/* Student Directory Table & Platform Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registered Students Management Preview */}
        <Card className="lg:col-span-2 overflow-hidden shadow-xs p-0" id="students">
          <div className="flex items-center justify-between border-b border-border p-5 sm:p-6 pb-4">
            <div>
              <h3 className="font-heading text-base font-bold text-text-primary">
                Registered Students Directory
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Live enrollment records fetched directly from Supabase PostgreSQL
              </p>
            </div>
            <Badge variant="primary" size="sm">
              {totalRegisteredStudents} Total
            </Badge>
          </div>

          <div>
            {students && students.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-semibold text-text-primary font-heading">
                        {student.full_name || "—"}
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {student.email}
                      </TableCell>
                      <TableCell className="font-mono text-text-muted text-xs">
                        {new Date(student.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="primary" size="sm">
                          student
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8">
                <EmptyState
                  icon={<Users className="h-6 w-6" />}
                  title="No students registered yet"
                  description="When students register via the public portal, their profile records will populate here."
                />
              </div>
            )}
          </div>
        </Card>

        {/* Platform Overview & Governance */}
        <div className="space-y-6">
          <Card className="p-6 shadow-xs">
            <div className="border-b border-border pb-3 mb-4">
              <h3 className="font-heading text-base font-bold text-text-primary">
                Platform Architecture Status
              </h3>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-border">
                <span className="text-text-secondary font-medium">Database Backend</span>
                <span className="font-semibold text-success flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Supabase PostgreSQL
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-border">
                <span className="text-text-secondary font-medium">Syllabus Hierarchy</span>
                <span className="font-semibold text-success flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Exam → Subj → Chap → Topic
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-border">
                <span className="text-text-secondary font-medium">Row Level Security</span>
                <span className="font-semibold text-success flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Protected RLS
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-border">
                <span className="text-text-secondary font-medium">Planner Engine</span>
                <span className="font-semibold text-primary font-mono text-[11px]">Deterministic Active</span>
              </div>
            </div>
          </Card>

          {/* Admin Profile & Security Card */}
          <Card className="p-6 shadow-xs">
            <div className="border-b border-border pb-3 mb-4">
              <h3 className="font-heading text-base font-bold text-text-primary">
                Admin Session
              </h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-secondary">Admin Email:</span>
                <span className="font-semibold text-text-primary truncate max-w-[150px]">
                  {profile.email}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-secondary">Authorization:</span>
                <Badge variant="primary" size="sm">
                  Full Platform Rights
                </Badge>
              </div>

              <div className="pt-2">
                <Link
                  href="/profile"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-text-primary hover:bg-hover-surface transition shadow-xs"
                >
                  <UserCheck className="h-3.5 w-3.5 text-primary" />
                  View Admin Profile
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
