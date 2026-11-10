"use client";

import { useState } from "react";
import {
  CalendarDays,
  Plus,
  ExternalLink,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { adminCreateExamEventAction, adminToggleExamEventAction } from "@/app/actions/events";
import type { ExamScheduleEvent, Exam, ExamEventType } from "@/lib/types";

interface AdminEventsClientProps {
  events: ExamScheduleEvent[];
  exams: Exam[];
}

const EVENT_TYPES: ExamEventType[] = [
  "Official Examination",
  "Application Opening",
  "Application Closing",
  "Admit Card Release",
  "Result Announcement",
  "Important Deadline",
  "Other",
];

export default function AdminEventsClient({ events, exams }: AdminEventsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [examId, setExamId] = useState(exams[0]?.id || "");
  const [eventType, setEventType] = useState<ExamEventType>("Official Examination");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [officialUrl, setOfficialUrl] = useState("");
  const [verificationDate, setVerificationDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("examId", examId);
    formData.append("eventType", eventType);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("officialSourceUrl", officialUrl);
    formData.append("verificationDate", verificationDate);

    const res = await adminCreateExamEventAction(formData);
    setIsPending(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setOfficialUrl("");
    }
  };

  const handleToggle = async (ev: ExamScheduleEvent) => {
    await adminToggleExamEventAction(ev.id, ev.is_active);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Published Examination Milestones ({events.length})
          </h2>
          <p className="text-xs text-slate-500">
            Publish verified official deadlines and exam schedules with official source URLs.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          Publish Exam Event
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {events.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {events.map((ev) => {
              const exam = ev.exam || exams.find((e) => e.id === ev.exam_id);

              return (
                <div
                  key={ev.id}
                  className="p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 border border-purple-200">
                        {ev.event_type}
                      </span>
                      {exam && (
                        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                          {exam.name}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 text-base font-bold text-slate-900">{ev.title}</h3>
                    {ev.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{ev.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(ev.start_date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>

                      {ev.verification_date && (
                        <span className="text-[11px] text-slate-400">
                          Verified: {ev.verification_date}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {ev.official_source_url && (
                      <a
                        href={ev.official_source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-slate-50"
                      >
                        Official Source
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    <button
                      onClick={() => handleToggle(ev)}
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition ${
                        ev.is_active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {ev.is_active ? "Active" : "Archived"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            No official exam events published yet. Click &quot;Publish Exam Event&quot; to post verified deadlines.
          </div>
        )}
      </div>

      {/* Publish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Publish Examination Milestone</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter official dates and verified source references for competitive exams.
            </p>

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Examination
                </label>
                <select
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                >
                  {exams.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Milestone Type
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as ExamEventType)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                >
                  {EVENT_TYPES.map((et) => (
                    <option key={et} value={et}>
                      {et}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GATE 2027 Examination Window"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Verification Date
                  </label>
                  <input
                    type="date"
                    value={verificationDate}
                    onChange={(e) => setVerificationDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Official Notification URL
                </label>
                <input
                  type="url"
                  placeholder="https://gate2027.iit.ac.in/notifications"
                  value={officialUrl}
                  onChange={(e) => setOfficialUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description / Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Specific candidate requirements or slot timings..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-60"
                >
                  {isPending ? "Publishing..." : "Publish Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
