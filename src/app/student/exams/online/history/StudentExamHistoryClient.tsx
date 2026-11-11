"use client";

import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  ArrowLeft,
  Search,
  Calendar,
} from "lucide-react";
import type { ExamAttempt } from "@/lib/types";

interface StudentExamHistoryClientProps {
  attempts: ExamAttempt[];
}

export default function StudentExamHistoryClient({
  attempts,
}: StudentExamHistoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = attempts.filter((att) => {
    if (searchQuery && !att.template?.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== "All" && att.status !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <Link href="/student/exams/online">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-text-muted hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" /> Back to Available Examinations
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by examination title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-border rounded-xl text-xs bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-border rounded-xl px-3 py-1.5 text-xs font-semibold bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="All">All Statuses</option>
          <option value="Submitted">Submitted</option>
          <option value="Auto Submitted">Auto Submitted</option>
          <option value="In Progress">In Progress</option>
          <option value="Evaluated">Evaluated</option>
          <option value="Results Released">Results Released</option>
        </select>
      </Card>

      {/* Attempts List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No Examination Attempts Found"
          description="You have not attempted any examinations matching your filters yet."
          action={{
            label: "Browse Available Examinations",
            onClick: () => {
              window.location.href = "/student/exams/online";
            },
          }}
        />
      ) : (
        <Card className="overflow-hidden p-0 divide-y divide-border">
          {filtered.map((att) => {
            const isCompleted = ["Submitted", "Auto Submitted", "Evaluated", "Results Released"].includes(att.status);

            return (
              <div
                key={att.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary-bg/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary">
                      {att.template?.exam_category}
                    </Badge>
                    <span className="text-xs font-semibold text-text-muted">
                      Attempt #{att.attempt_number}
                    </span>
                    <Badge
                      variant={
                        att.status === "In Progress"
                          ? "warning"
                          : "success"
                      }
                    >
                      {att.status}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-text-primary leading-snug">
                    {att.template?.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-text-muted pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(att.started_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {att.time_taken_seconds > 0 ? `${Math.round(att.time_taken_seconds / 60)} mins` : "In Progress"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {isCompleted && (
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-text-muted block font-bold uppercase">Score</span>
                      <span className="text-base font-extrabold text-text-primary">
                        {att.score} <span className="text-xs text-text-muted">/ {att.max_marks}</span>
                      </span>
                      <span className="text-xs text-primary block font-semibold">
                        {att.percentage}%
                      </span>
                    </div>
                  )}

                  <div>
                    {att.status === "In Progress" ? (
                      <Link
                        href={`/student/exams/online/attempt/${att.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-warning text-white font-semibold text-xs hover:bg-warning/90 transition-all shadow-sm"
                      >
                        Resume Attempt
                      </Link>
                    ) : (
                      <Link
                        href={`/student/exams/online/result/${att.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-hover transition-all shadow-sm"
                      >
                        View Full Result →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
