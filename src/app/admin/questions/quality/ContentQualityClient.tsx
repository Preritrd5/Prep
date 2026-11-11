"use client";

import { PageHeader, Card, Badge, Button, StatCard, EmptyState } from "@/components/ui";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  FileQuestion,
  Layers,
  Sparkles,
} from "lucide-react";
import type { AdminContentQualityReport } from "@/lib/types";

interface ContentQualityClientProps {
  report: AdminContentQualityReport;
}

export default function ContentQualityClient({ report }: ContentQualityClientProps) {
  const publishedRatio =
    report.totalQuestions > 0
      ? Math.round((report.publishedQuestions / report.totalQuestions) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Question Bank Quality & Coverage Monitor"
        description="Automated pedagogical audit tracking explanation completeness, syllabus topic gaps, and duplicate questions."
        breadcrumbs={[
          { label: "Admin Console", href: "/admin/dashboard" },
          { label: "Questions", href: "/admin/questions" },
          { label: "Content Quality" },
        ]}
        actions={
          <Link href="/admin/questions/ai">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs">
              <Sparkles className="h-4 w-4" />
              Generate Topic MCQs
            </Button>
          </Link>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="No Explanations"
          value={report.questionsWithoutExplanation}
          icon={AlertTriangle}
          description="Questions lack pedagogical solutions"
        />
        <StatCard
          title="Topics Without Questions"
          value={report.syllabusTopicsWithoutQuestions.length}
          icon={Layers}
          description="Syllabus topics need MCQs authored"
        />
        <StatCard
          title="Potential Duplicates"
          value={report.duplicateQuestionsCount}
          icon={FileQuestion}
          description="Repeated question stems detected"
        />
        <StatCard
          title="Published Ratio"
          value={`${publishedRatio}%`}
          icon={CheckCircle2}
          description={`${report.publishedQuestions} of ${report.totalQuestions} live`}
        />
      </div>

      {/* Topics Without Questions List (Coverage Gaps) */}
      <Card className="overflow-hidden p-0">
        <div className="p-4 sm:p-5 border-b border-border bg-secondary-bg/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              Syllabus Coverage Gaps (Topics Without Practice Questions)
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              These topics are part of registered curricula but currently lack verified MCQs.
            </p>
          </div>
          <Badge variant="error">
            {report.syllabusTopicsWithoutQuestions.length} Gaps
          </Badge>
        </div>

        {report.syllabusTopicsWithoutQuestions.length > 0 ? (
          <div className="divide-y divide-border">
            {report.syllabusTopicsWithoutQuestions.map((gap) => (
              <div
                key={gap.topicId}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-secondary-bg/30 transition-colors"
              >
                <div>
                  <h4 className="text-sm font-bold text-text-primary">{gap.topicTitle}</h4>
                  <span className="text-xs text-text-muted">Subject: {gap.subjectName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/questions/create?topicId=${gap.topicId}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      Author MCQ
                    </Button>
                  </Link>
                  <Link href={`/admin/questions/ai?topicId=${gap.topicId}`}>
                    <Button variant="outline" size="sm" className="gap-1 text-xs text-primary border-primary/20 hover:bg-primary/10">
                      <Sparkles className="h-3 w-3" />
                      AI Generate
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CheckCircle2}
            title="Full Syllabus Coverage Achieved!"
            description="Every syllabus topic has at least one active MCQ."
          />
        )}
      </Card>
    </div>
  );
}
