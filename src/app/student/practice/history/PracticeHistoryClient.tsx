"use client";

import { Card, Badge, Button, StatCard, EmptyState } from "@/components/ui";
import Link from "next/link";
import {
  BarChart2,
  CheckCircle2,
  XCircle,
  BookOpen,
} from "lucide-react";
import type { PracticeSession } from "@/lib/types";

interface PracticeHistoryClientProps {
  sessions: PracticeSession[];
  stats: {
    totalAttempts: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracyPercent: number;
  };
}

export default function PracticeHistoryClient({
  sessions,
  stats,
}: PracticeHistoryClientProps) {
  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Questions Attempted"
          value={stats.totalAttempts}
          icon={BarChart2}
          description="Total attempts logged"
        />
        <StatCard
          title="Correct Answers"
          value={stats.correctAnswers}
          icon={CheckCircle2}
          description="Accurately solved"
        />
        <StatCard
          title="Incorrect Answers"
          value={stats.incorrectAnswers}
          icon={XCircle}
          description="Missed attempts"
        />
        <StatCard
          title="Overall Accuracy"
          value={`${stats.accuracyPercent}%`}
          icon={BarChart2}
          description="Practice session rate"
        />
      </div>

      {/* Sessions History Table */}
      <Card className="overflow-hidden p-0">
        <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-text-primary">Recent Practice Sessions</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Log of your evaluated test and learn mode sessions.
            </p>
          </div>
          <Link href="/student/practice/topic">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs">
              <BookOpen className="w-3.5 h-3.5" /> Start New Practice
            </Button>
          </Link>
        </div>

        {sessions.length === 0 ? (
          <EmptyState
            icon={BarChart2}
            title="No Practice Sessions Yet"
            description="Start practicing topics or exams in Learn or Test mode to build your performance log."
            action={{
              label: "Start Topic Practice",
              onClick: () => {
                window.location.href = "/student/practice/topic";
              },
            }}
          />
        ) : (
          <div className="divide-y divide-border">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary-bg/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={sess.mode === "Test" ? "primary" : "info"}>
                      {sess.mode} Mode
                    </Badge>

                    <span className="text-xs text-text-muted">
                      {new Date(sess.started_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-text-primary">
                    {sess.exam?.name || sess.subject?.name || "General Question Practice"}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-text-muted block">Score</span>
                    <span className="text-sm font-bold text-text-primary">
                      {sess.correct_answers} / {sess.total_questions} ({sess.score_percent}%)
                    </span>
                  </div>

                  <Badge variant={sess.status === "Completed" ? "success" : "warning"}>
                    {sess.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
