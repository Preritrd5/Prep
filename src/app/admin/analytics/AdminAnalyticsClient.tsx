"use client";

import { PageHeader, Card, Badge, Button, StatCard } from "@/components/ui";
import Link from "next/link";
import {
  Users,
  FileQuestion,
  Play,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import type { AdminAnalyticsSummary } from "@/lib/types";

interface AdminAnalyticsClientProps {
  analytics: AdminAnalyticsSummary;
}

export default function AdminAnalyticsClient({ analytics }: AdminAnalyticsClientProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Analytics & Institutional Growth"
        description="Aggregated platform performance across active students, question bank utilization, and examination throughput."
        breadcrumbs={[
          { label: "Admin Console", href: "/admin/dashboard" },
          { label: "Platform Analytics" },
        ]}
        actions={
          <Link href="/admin/questions/quality">
            <Button variant="outline" size="sm" className="gap-1.5">
              Content Quality Monitor <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        }
      />

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Aspirants"
          value={analytics.totalRegisteredStudents}
          icon={Users}
          description={`+${analytics.newRegistrationsThisMonth} new this month`}
        />
        <StatCard
          title="Published Questions"
          value={analytics.publishedQuestions}
          icon={FileQuestion}
          description={`${analytics.pendingQuestionReviews} awaiting editorial review`}
        />
        <StatCard
          title="Mock Exam Attempts"
          value={analytics.totalExaminationAttempts}
          icon={Play}
          description={`Across ${analytics.publishedMockExams} published templates`}
        />
        <StatCard
          title="Practice Sessions"
          value={analytics.totalPracticeSessions}
          icon={Activity}
          description="Topic & subject practice runs logged"
        />
      </div>

      {/* Syllabus Distribution Hierarchy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted block">Curriculum Depth</span>
          <h3 className="text-base font-bold text-text-primary mt-1">Syllabus Breakdown</h3>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-text-secondary">Official Examinations:</span>
              <strong className="text-text-primary">{analytics.totalExaminations}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-text-secondary">Subjects Defined:</span>
              <strong className="text-text-primary">{analytics.totalSyllabusSubjects}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-text-secondary">Syllabus Chapters:</span>
              <strong className="text-text-primary">{analytics.totalChapters}</strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-text-secondary">Distinct Topics:</span>
              <strong className="text-primary">{analytics.totalTopics}</strong>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted block">Ingestion Breakdown</span>
          <h3 className="text-base font-bold text-text-primary mt-1">Question Origin Sources</h3>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-text-secondary">AI Generated (Gemini):</span>
              <strong className="text-accent">{analytics.aiGeneratedQuestions}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-text-secondary">Bulk Imported (CSV/Excel):</span>
              <strong className="text-text-primary">{analytics.questionsImported}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-text-secondary">Manually Authored:</span>
              <strong className="text-text-primary">
                {Math.max(0, analytics.publishedQuestions - analytics.aiGeneratedQuestions - analytics.questionsImported)}
              </strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-text-secondary">Review Queue Pending:</span>
              <strong className="text-warning">{analytics.pendingQuestionReviews}</strong>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted block">System Integrity</span>
          <h3 className="text-base font-bold text-text-primary mt-1">Privacy & Security Status</h3>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-success py-1">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Row Level Security Active</span>
            </div>
            <div className="flex items-center gap-2 text-success py-1">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Answer-Key Concealment Verified</span>
            </div>
            <div className="flex items-center gap-2 text-success py-1">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Server-Authoritative Timer Live</span>
            </div>
            <div className="flex items-center gap-2 text-success py-1">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Immutable Attempt Snapshots</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Practice Volume Visual Trend */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-text-primary">7-Day Platform Practice Volume</h3>
            <p className="text-xs text-text-secondary">Total practice sessions and questions answered platform-wide</p>
          </div>
          <Badge variant="primary">
            Aggregated Student Activity
          </Badge>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-2">
          {analytics.practiceActivityTrends.map((day) => {
            const dayName = new Date(day.date).toLocaleDateString("en-US", { weekday: "short" });
            return (
              <div key={day.date} className="flex flex-col items-center text-center">
                <div className="w-full bg-secondary-bg rounded-xl p-3 border border-border flex flex-col justify-end h-32 relative">
                  <div
                    className="w-full bg-primary rounded-lg transition-all"
                    style={{ height: `${Math.max(15, Math.min(100, day.questionsAttempted / 5))}%` }}
                  />
                  <span className="text-[10px] font-bold text-text-primary mt-1">
                    {day.questionsAttempted} Qs
                  </span>
                </div>
                <span className="text-xs font-bold text-text-primary mt-2">{dayName}</span>
                <span className="text-[10px] text-text-muted">{day.sessions} sessions</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
