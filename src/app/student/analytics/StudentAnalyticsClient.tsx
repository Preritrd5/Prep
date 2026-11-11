"use client";

import { PageHeader, Card, Badge, Button, EmptyState, StatCard } from "@/components/ui";
import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Target,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Filter,
  Sparkles,
} from "lucide-react";
import type {
  StudentPerformanceAnalytics,
  SubjectAnalyticsSummary,
  TopicAnalyticsSummary,
  WeakAreaTopic,
} from "@/lib/types";
import { studentDismissWeakAreaAction } from "@/app/actions/analytics";

interface StudentAnalyticsClientProps {
  initialAnalytics: StudentPerformanceAnalytics;
  subjects: SubjectAnalyticsSummary[];
  topics: TopicAnalyticsSummary[];
  weakTopics: WeakAreaTopic[];
}

export default function StudentAnalyticsClient({
  initialAnalytics,
  subjects,
  topics,
  weakTopics: initialWeakTopics,
}: StudentAnalyticsClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "subjects" | "topics" | "weak">("overview");
  const [weakTopics, setWeakTopics] = useState(initialWeakTopics);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  const filteredTopics = topics.filter((t) => {
    if (subjectFilter === "all") return true;
    return t.subjectName === subjectFilter;
  });

  const uniqueSubjectNames = Array.from(new Set(topics.map((t) => t.subjectName)));

  const handleDismissWeakTopic = async (topicId: string) => {
    setDismissingId(topicId);
    const fd = new FormData();
    fd.append("topicId", topicId);
    await studentDismissWeakAreaAction(fd);
    setWeakTopics((prev) => prev.filter((w) => w.topicId !== topicId));
    setDismissingId(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance & Subject Analytics"
        description="Real-time syllabus completion, MCQ accuracy breakdowns, and AI-driven weak area diagnostics."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Analytics" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-secondary-bg p-1 border border-border text-xs font-semibold">
            <button
              onClick={() => setActiveTab("overview")}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                activeTab === "overview"
                  ? "bg-card text-primary font-bold shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("subjects")}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                activeTab === "subjects"
                  ? "bg-card text-primary font-bold shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Subjects ({subjects.length})
            </button>
            <button
              onClick={() => setActiveTab("topics")}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                activeTab === "topics"
                  ? "bg-card text-primary font-bold shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Topic Drilldown ({topics.length})
            </button>
            <button
              onClick={() => setActiveTab("weak")}
              className={`rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5 ${
                activeTab === "weak"
                  ? "bg-error text-white font-bold shadow-sm"
                  : "text-error hover:bg-error-light"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Weak Areas ({weakTopics.length})
            </button>
          </div>
        }
      />

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Top KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Syllabus Progress"
              value={`${initialAnalytics.syllabusCompletionPercentage}%`}
              icon={BookOpen}
              description={`${initialAnalytics.completedTopics} of ${initialAnalytics.totalSyllabusTopics} topics completed`}
            />
            <StatCard
              title="MCQ Accuracy"
              value={`${initialAnalytics.overallAccuracy}%`}
              icon={Target}
              description={`${initialAnalytics.correctAnswers} correct out of ${initialAnalytics.mcqsAttempted} attempts`}
            />
            <StatCard
              title="Study Time"
              value={`${initialAnalytics.totalStudyHours} hrs`}
              icon={Clock}
              description={`${initialAnalytics.tasksCompleted} tasks done · ${initialAnalytics.incompleteTasks} pending`}
            />
            <StatCard
              title="Mock Tests"
              value={`${initialAnalytics.bestMockScore}`}
              icon={TrendingUp}
              description={`Best Score · Avg: ${initialAnalytics.averageMockScore} (${initialAnalytics.totalMockExaminationsAttempted} attempts)`}
            />
          </div>

          {/* 7-Day Performance Trend */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-text-primary">Recent 7-Day Performance Trend</h3>
                <p className="text-xs text-text-secondary">Daily question practice count and accuracy rate</p>
              </div>
              <Badge variant="info">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Actual Activity
              </Badge>
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-2">
              {initialAnalytics.recentPerformanceTrend.map((day) => {
                const dayName = new Date(day.date).toLocaleDateString("en-US", { weekday: "short" });
                return (
                  <div key={day.date} className="flex flex-col items-center text-center">
                    <div className="w-full bg-secondary-bg rounded-xl p-3 border border-border flex flex-col justify-end h-32 relative">
                      <div
                        className="w-full bg-primary rounded-lg transition-all"
                        style={{ height: `${Math.max(12, Math.min(100, day.questionsAttempted * 8))}%` }}
                      />
                      <span className="text-[10px] font-bold text-text-primary mt-1">
                        {day.questionsAttempted} Qs
                      </span>
                    </div>
                    <span className="text-xs font-bold text-text-primary mt-2">{dayName}</span>
                    <span className="text-[10px] text-text-muted">
                      {day.accuracy > 0 ? `${day.accuracy}%` : "-"}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Subject Snapshot Cards */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-text-primary">Subject Coverage & Accuracy</h3>
                <p className="text-xs text-text-secondary">Breakdown of syllabus progress across key subjects</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("subjects")}
                className="text-primary hover:text-primary-hover flex items-center gap-1 text-xs"
              >
                View all subjects <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.slice(0, 6).map((sub) => (
                <div
                  key={sub.subjectId}
                  className="rounded-xl border border-border bg-secondary-bg/60 p-4 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-text-primary truncate">{sub.subjectName}</h4>
                    <Badge variant="primary">{sub.completionPercentage}%</Badge>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-text-secondary">
                    <div className="flex justify-between">
                      <span>Topics:</span>
                      <span className="font-semibold text-text-primary">
                        {sub.completedTopics} / {sub.totalTopics}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Practice Accuracy:</span>
                      <span className="font-semibold text-text-primary">
                        {sub.accuracyPercentage}% ({sub.questionsAttempted} Qs)
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/student/practice/subject`}
                      className="flex-1 text-center rounded-lg bg-card border border-border px-2.5 py-1 text-xs font-medium text-text-primary hover:bg-secondary-bg transition-colors"
                    >
                      Practice
                    </Link>
                    <Link
                      href={`/student/syllabus`}
                      className="flex-1 text-center rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                    >
                      Syllabus
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: SUBJECTS DETAIL */}
      {activeTab === "subjects" && (
        <div className="space-y-4">
          <Card className="overflow-hidden p-0">
            <div className="p-4 border-b border-border bg-secondary-bg flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary">All Syllabus Subjects ({subjects.length})</h3>
              <span className="text-xs text-text-muted">Filtered by your enrolled examinations</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary-bg/50 border-b border-border text-text-secondary font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Subject Name</th>
                    <th className="py-3 px-4">Topics Covered</th>
                    <th className="py-3 px-4">Completion %</th>
                    <th className="py-3 px-4">Questions Attempted</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4">Avg Speed</th>
                    <th className="py-3 px-4">Revisions</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-text-primary">
                  {subjects.map((sub) => (
                    <tr key={sub.subjectId} className="hover:bg-secondary-bg/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-text-primary">
                        {sub.subjectName}
                        {sub.examCategory && (
                          <span className="block text-[10px] font-normal text-text-muted">
                            {sub.examCategory}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-text-secondary">
                        {sub.completedTopics} / {sub.totalTopics}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{sub.completionPercentage}%</span>
                          <div className="h-1.5 w-16 bg-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${sub.completionPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">{sub.questionsAttempted}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            sub.accuracyPercentage >= 70
                              ? "success"
                              : sub.accuracyPercentage >= 50
                              ? "warning"
                              : "error"
                          }
                        >
                          {sub.accuracyPercentage}%
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">{sub.averageTimePerQuestionSeconds}s / Q</td>
                      <td className="py-3 px-4 text-text-secondary">{sub.revisionCount}</td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/student/practice/subject`}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                        >
                          Practice MCQs
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: TOPIC DRILLDOWN */}
      {activeTab === "topics" && (
        <div className="space-y-4">
          <Card className="p-4 flex items-center gap-3">
            <Filter className="h-4 w-4 text-text-muted" />
            <span className="text-xs font-bold text-text-primary">Filter by Subject:</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Subjects ({uniqueSubjectNames.length})</option>
              {uniqueSubjectNames.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="ml-auto text-xs text-text-muted font-medium">
              Showing {filteredTopics.length} topics
            </span>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary-bg/50 border-b border-border text-text-secondary font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Topic Hierarchy</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">MCQs Attempted</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4">Last Studied</th>
                    <th className="py-3 px-4">Next Revision</th>
                    <th className="py-3 px-4 text-right">Practice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-text-primary">
                  {filteredTopics.map((top) => (
                    <tr key={top.topicId} className="hover:bg-secondary-bg/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-text-primary block">{top.topicTitle}</span>
                        <span className="text-[10px] text-text-muted">
                          {top.subjectName} &rarr; {top.chapterTitle}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            top.completionStatus === "Completed"
                              ? "success"
                              : top.completionStatus === "In Progress"
                              ? "primary"
                              : "secondary"
                          }
                        >
                          {top.completionStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">
                        {top.questionsAttempted} ({top.correctAnswers} correct)
                      </td>
                      <td className="py-3 px-4">
                        {top.questionsAttempted > 0 ? (
                          <Badge
                            variant={
                              top.accuracyPercentage >= 70
                                ? "success"
                                : top.accuracyPercentage >= 50
                                ? "warning"
                                : "error"
                            }
                          >
                            {top.accuracyPercentage}%
                          </Badge>
                        ) : (
                          <span className="text-text-muted">No attempts</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-text-muted">{top.lastStudiedDate || "Not studied"}</td>
                      <td className="py-3 px-4 text-text-muted">{top.upcomingRevisionDate || "-"}</td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/student/practice/topic?topicId=${top.topicId}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                        >
                          Solve MCQs
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: WEAK AREAS IDENTIFICATION */}
      {activeTab === "weak" && (
        <div className="space-y-4">
          <Card className="border-error/30 bg-error-light/50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-error mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  Targeted Weak Areas & Intervention Strategy
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Topics are flagged strictly based on real question attempts (minimum sample size threshold applied),
                  repeated mistakes, or retention lapses.
                </p>
              </div>
            </div>
          </Card>

          {weakTopics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weakTopics.map((item) => (
                <Card key={item.topicId} className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                        {item.examName} &bull; {item.subjectName}
                      </span>
                      <h4 className="text-base font-bold text-text-primary mt-0.5">{item.topicTitle}</h4>
                      <p className="text-xs text-text-secondary">{item.chapterTitle}</p>
                    </div>

                    <Badge variant="error">
                      {item.accuracyPercentage}% Acc
                    </Badge>
                  </div>

                  <div className="rounded-xl bg-secondary-bg p-3 border border-border text-xs text-text-primary">
                    <span className="font-semibold text-text-primary block mb-0.5">Diagnostic Reason:</span>
                    {item.reason}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismissWeakTopic(item.topicId)}
                      disabled={dismissingId === item.topicId}
                      className="text-xs text-text-muted hover:text-text-primary"
                    >
                      {dismissingId === item.topicId ? "Dismissing..." : "Dismiss / Addressed"}
                    </Button>

                    <Link
                      href={`/student/practice/topic?topicId=${item.topicId}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {item.recommendedAction}
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="No Weak Topics Flagged!"
              description="Excellent consistency! All topics with sufficient question practice maintain healthy accuracy and regular spaced repetition intervals."
            />
          )}
        </div>
      )}
    </div>
  );
}
