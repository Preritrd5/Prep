"use client";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/exams/manage"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Examinations List
        </Link>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm ${
            msg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Real-time Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Tests</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{metrics.totalExams}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-semibold text-emerald-700 uppercase">Published</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{metrics.publishedExams}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-semibold text-indigo-700 uppercase">Ongoing Live</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{metrics.ongoingAttempts}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-semibold text-purple-700 uppercase">Completed</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{metrics.completedAttempts}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-semibold text-amber-700 uppercase">Awaiting Release</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{metrics.awaitingPublication}</p>
        </div>
      </div>

      {/* Recent Student Attempts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" /> Student Examination Attempts Log
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live audit and performance monitoring across all student examination sessions.
            </p>
          </div>
        </div>

        {attempts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-800">No Attempts Logged Yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Student mock exam attempts will populate here automatically in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <th className="p-3">Student</th>
                  <th className="p-3">Examination</th>
                  <th className="p-3">Attempt</th>
                  <th className="p-3">Started</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-medium">
                      {att.student?.full_name || att.student?.email || "Student"}
                    </td>
                    <td className="p-3 font-semibold max-w-[200px] truncate">
                      {att.template?.title || "Examination"}
                    </td>
                    <td className="p-3">#{att.attempt_number}</td>
                    <td className="p-3 text-slate-500">
                      {new Date(att.started_at).toLocaleString()}
                    </td>
                    <td className="p-3 font-bold">
                      {att.score} / {att.max_marks} ({att.percentage}%)
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold ${
                          att.status === "In Progress"
                            ? "bg-indigo-100 text-indigo-800"
                            : att.status === "Submitted" || att.status === "Evaluated"
                            ? "bg-emerald-100 text-emerald-800"
                            : att.status === "Auto Submitted"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Link
                        href={`/student/exams/online/result/${att.id}`}
                        className="text-indigo-600 font-semibold hover:underline"
                      >
                        Inspect Result
                      </Link>
                      {att.status === "In Progress" && (
                        <button
                          onClick={() => handleCancelAttempt(att.id)}
                          className="text-rose-600 font-semibold hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Log Strip */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-slate-600" /> Recent Administrative & Examination Audit Events
        </h3>

        {metrics.recentAudits.length === 0 ? (
          <p className="text-xs text-slate-400">No recent audit events logged.</p>
        ) : (
          <div className="space-y-1.5">
            {metrics.recentAudits.map((aud) => (
              <div
                key={aud.id}
                className="p-2 rounded bg-slate-50 border border-slate-100 text-xs flex items-center justify-between text-slate-700"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                    {aud.event_type}
                  </span>
                  <span>{JSON.stringify(aud.details_json || {})}</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(aud.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
