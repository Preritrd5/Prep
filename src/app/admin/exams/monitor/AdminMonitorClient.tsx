"use client";

import { Card, Badge, Button, PageHeader, StatCard, EmptyState } from "@/components/ui";
import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowLeft,
  Share2,
  Trash2,
  Shield,
  Activity,
  Award,
  BookOpen,
  FileText,
  Users,
  Eye,
  RefreshCw,
} from "lucide-react";
import type { ExamAttempt, ExamAuditEvent } from "@/lib/types";
import {
  adminReleaseExamResultsAction,
  adminCancelAttemptAction,
} from "@/app/actions/exams-online";

interface AdminMonitorClientProps {
  metrics: {
    totalExams: number;
    publishedExams: number;
    ongoingAttempts: number;
    completedAttempts: number;
    awaitingPublication: number;
    recentAttempts: ExamAttempt[];
    recentAudits: ExamAuditEvent[];
  };
}

export default function AdminMonitorClient({ metrics }: AdminMonitorClientProps) {
  const [attempts, setAttempts] = useState<ExamAttempt[]>(metrics.recentAttempts);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleReleaseResults = (templateId: string) => {
    if (!confirm("Release results for this examination to all students?")) return;
    startTransition(async () => {
      const res = await adminReleaseExamResultsAction(templateId);
      if (res.error) {
        setMsg({ type: "error", text: res.error });
      } else {
        setMsg({ type: "success", text: "Examination results released successfully." });
        window.location.reload();
      }
    });
  };

  const handleCancelAttempt = (attemptId: string) => {
    const reason = prompt("Enter administrative cancellation reason:");
    if (!reason) return;

    startTransition(async () => {
      const res = await adminCancelAttemptAction(attemptId, reason);
      if (res.error) {
        setMsg({ type: "error", text: res.error });
      } else {
        setAttempts((prev) =>
          prev.map((a) => (a.id === attemptId ? { ...a, status: "Cancelled" } : a))
        );
        setMsg({ type: "success", text: "Examination attempt cancelled." });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Progress":
        return <Badge variant="primary" dot pulse>Live In Progress</Badge>;
      case "Submitted":
      case "Evaluated":
        return <Badge variant="success">Completed</Badge>;
      case "Auto Submitted":
        return <Badge variant="warning">Auto-Submitted</Badge>;
      case "Cancelled":
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Exam Monitor & Audits"
        description="Real-time oversight across active examination sessions, attempt progress, and security audit logs."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Online Exams", href: "/admin/exams/manage" },
          { label: "Monitor" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/exams/manage">
              <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
                Back to Exams
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />}
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {msg && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm border ${
            msg.type === "success"
              ? "bg-success/10 text-success border-success/20"
              : "bg-error/10 text-error border-error/20"
          }`}
        >
          <span>{msg.text}</span>
          <button
            onClick={() => setMsg(null)}
            className="text-xs font-semibold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Real-time Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard
          title="Total Tests"
          value={metrics.totalExams}
          icon={<FileText className="w-5 h-5" />}
          accentColor="primary"
        />
        <StatCard
          title="Published"
          value={metrics.publishedExams}
          icon={<CheckCircle className="w-5 h-5" />}
          accentColor="success"
        />
        <StatCard
          title="Ongoing Live"
          value={metrics.ongoingAttempts}
          icon={<Activity className="w-5 h-5" />}
          accentColor="accent"
        />
        <StatCard
          title="Completed"
          value={metrics.completedAttempts}
          icon={<Award className="w-5 h-5" />}
          accentColor="secondary"
        />
        <StatCard
          title="Awaiting Release"
          value={metrics.awaitingPublication}
          icon={<Clock className="w-5 h-5" />}
          accentColor="warning"
        />
      </div>

      {/* Recent Student Attempts Table */}
      <Card variant="default" padding="none">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Student Examination Attempts Log
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Live monitoring and status audit across candidate test sessions.
              </p>
            </div>
          </div>
          <Badge variant="neutral">{attempts.length} attempts recorded</Badge>
        </div>

        {attempts.length === 0 ? (
          <EmptyState
            title="No Attempts Logged Yet"
            description="Student mock exam attempts will populate here automatically in real time as candidates begin tests."
            icon={<BookOpen className="w-10 h-10 text-text-muted" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-bg-secondary/60 border-b border-border text-text-secondary uppercase font-semibold text-[11px] tracking-wider">
                  <th className="p-3.5 pl-5">Student</th>
                  <th className="p-3.5">Examination</th>
                  <th className="p-3.5">Attempt</th>
                  <th className="p-3.5">Started At</th>
                  <th className="p-3.5">Score</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-text-primary">
                {attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-bg-secondary/40 transition-colors">
                    <td className="p-3.5 pl-5 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                          {(att.student?.full_name || att.student?.email || "S")[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary">
                            {att.student?.full_name || "Student"}
                          </div>
                          <div className="text-[10px] text-text-muted">{att.student?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-medium max-w-[200px] truncate">
                      {att.template?.title || "Examination"}
                    </td>
                    <td className="p-3.5 text-text-secondary font-mono">
                      #{att.attempt_number}
                    </td>
                    <td className="p-3.5 text-text-secondary">
                      {new Date(att.started_at).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3.5 font-bold">
                      {att.score} / {att.max_marks}{" "}
                      <span className="text-[10px] font-normal text-text-muted">
                        ({att.percentage}%)
                      </span>
                    </td>
                    <td className="p-3.5">{getStatusBadge(att.status)}</td>
                    <td className="p-3.5 pr-5 text-right space-x-2">
                      <Link href={`/student/exams/online/result/${att.id}`}>
                        <Button variant="ghost" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
                          Inspect
                        </Button>
                      </Link>
                      {att.status === "In Progress" && (
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<XCircle className="w-3.5 h-3.5" />}
                          onClick={() => handleCancelAttempt(att.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Audit Log Strip */}
      <Card variant="default">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Examination & Security Audit Events
            </h3>
            <Badge variant="neutral">{metrics.recentAudits.length} events</Badge>
          </div>

          {metrics.recentAudits.length === 0 ? (
            <p className="text-xs text-text-muted py-4 text-center">No recent audit events logged.</p>
          ) : (
            <div className="space-y-2">
              {metrics.recentAudits.map((aud) => (
                <div
                  key={aud.id}
                  className="p-3 rounded-lg bg-bg-secondary/60 border border-border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-text-secondary"
                >
                  <div className="flex items-center gap-2.5">
                    <Badge variant="outline" size="sm">
                      {aud.event_type}
                    </Badge>
                    <span className="font-mono text-[11px] text-text-primary truncate max-w-xl">
                      {JSON.stringify(aud.details_json || {})}
                    </span>
                  </div>
                  <span className="text-[11px] text-text-muted whitespace-nowrap">
                    {new Date(aud.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
