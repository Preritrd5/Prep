"use client";

import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Play,
  Search,
} from "lucide-react";
import type { ExamTemplate, ExamAttempt } from "@/lib/types";

interface StudentExamsClientProps {
  availableExams: ExamTemplate[];
  studentAttempts: ExamAttempt[];
}

export default function StudentExamsClient({
  availableExams,
  studentAttempts,
}: StudentExamsClientProps) {
  const [activeTab, setActiveTab] = useState<"Available" | "Completed">("Available");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const completedTemplateIds = new Set(
    studentAttempts
      .filter((a) => ["Submitted", "Auto Submitted", "Evaluated", "Results Released"].includes(a.status))
      .map((a) => a.template_id)
  );

  const activeAttemptMap = new Map<string, ExamAttempt>();
  studentAttempts.forEach((a) => {
    if (a.status === "In Progress" && new Date() < new Date(a.expires_at)) {
      activeAttemptMap.set(a.template_id, a);
    }
  });

  const filteredExams = availableExams.filter((exam) => {
    if (searchQuery && !exam.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory !== "All" && exam.exam_category !== selectedCategory) return false;
    if (activeTab === "Completed" && !completedTemplateIds.has(exam.id)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Online CBT Mock Tests</h2>
          <p className="text-xs text-text-muted mt-1">
            Simulate real computer-based competitive examinations under timed, server-enforced conditions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/student/exams/online/history">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5" /> My Attempt History
            </Button>
          </Link>
        </div>
      </Card>

      {/* Tabs & Filters */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex p-0.5 bg-secondary-bg rounded-xl border border-border text-xs font-semibold">
            <button
              onClick={() => setActiveTab("Available")}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === "Available"
                  ? "bg-card text-primary font-bold shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Available Examinations ({availableExams.length})
            </button>
            <button
              onClick={() => setActiveTab("Completed")}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === "Completed"
                  ? "bg-card text-primary font-bold shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Completed Tests ({completedTemplateIds.size})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search mock exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 border border-border rounded-xl text-xs bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-border rounded-xl px-3 py-1.5 text-xs font-semibold bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Categories</option>
              <option value="UPSC">UPSC</option>
              <option value="KAS">KAS</option>
              <option value="GATE">GATE</option>
              <option value="Railway Examinations">Railway</option>
              <option value="KEA Examinations">KEA</option>
              <option value="AE Civil Engineering">AE Civil</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Examination Cards Grid */}
      {filteredExams.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Examinations Found"
          description="There are no examinations matching your current filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExams.map((exam) => {
            const activeAttempt = activeAttemptMap.get(exam.id);
            const userAttempts = studentAttempts.filter((a) => a.template_id === exam.id);
            const completedCount = userAttempts.filter((a) =>
              ["Submitted", "Auto Submitted", "Evaluated", "Results Released"].includes(a.status)
            ).length;
            const attemptsRemaining =
              exam.max_attempts > 0 ? Math.max(0, exam.max_attempts - completedCount) : "Unlimited";
            const latestCompleted = userAttempts.find((a) =>
              ["Submitted", "Auto Submitted", "Evaluated", "Results Released"].includes(a.status)
            );

            return (
              <Card
                key={exam.id}
                className="p-5 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="primary">
                      {exam.exam_category}
                    </Badge>
                    <span className="text-[11px] font-semibold text-text-muted">
                      {exam.exam_type}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text-primary leading-snug line-clamp-2">
                    {exam.title}
                  </h3>

                  <p className="text-xs text-text-muted line-clamp-2">{exam.description}</p>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-center border-t border-border">
                    <div className="p-2 rounded-xl bg-secondary-bg">
                      <span className="text-[10px] text-text-muted block font-bold uppercase">Duration</span>
                      <span className="text-xs font-bold text-text-primary">{exam.duration_minutes} M</span>
                    </div>
                    <div className="p-2 rounded-xl bg-secondary-bg">
                      <span className="text-[10px] text-text-muted block font-bold uppercase">Questions</span>
                      <span className="text-xs font-bold text-text-primary">{exam.total_questions}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-secondary-bg">
                      <span className="text-[10px] text-text-muted block font-bold uppercase">Marks</span>
                      <span className="text-xs font-bold text-text-primary">{exam.total_marks}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-text-muted flex items-center justify-between">
                    <span>
                      Attempts: <strong>{completedCount}</strong> / {exam.max_attempts || "∞"}
                    </span>
                    {exam.has_negative_marking && (
                      <span className="text-error font-semibold">
                        -{exam.negative_marks} Neg Marking
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  {activeAttempt ? (
                    <Link
                      href={`/student/exams/online/attempt/${activeAttempt.id}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-warning text-white font-semibold text-xs shadow-sm hover:bg-warning/90 transition-all animate-pulse"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Resume Active Attempt
                    </Link>
                  ) : attemptsRemaining === 0 ? (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-xs text-text-muted font-medium">Max attempts reached</span>
                      {latestCompleted && (
                        <Link
                          href={`/student/exams/online/result/${latestCompleted.id}`}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          View Results ({latestCompleted.score}m) →
                        </Link>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={`/student/exams/online/${exam.id}/instructions`}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-hover shadow-sm transition-all"
                    >
                      <Play className="w-3.5 h-3.5" /> Start Examination
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
