import { requireRole } from "@/lib/auth";
import { getStudentExams, getExamScheduleEvents, getAllExams } from "@/lib/data/syllabus";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  CalendarDays,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Clock,
  AlertCircle,
  Tag,
} from "lucide-react";

export default async function StudentSchedulePage() {
  const { profile, user } = await requireRole("student");

  const [enrolledExams, allExams] = await Promise.all([
    getStudentExams(user.id),
    getAllExams(),
  ]);

  const examIds = enrolledExams.map((se) => se.exam_id);
  const events = await getExamScheduleEvents(examIds.length > 0 ? examIds : undefined);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Official Examination Calendar</h1>
            <p className="text-sm text-slate-600 mt-1">
              Verified examination dates, application windows, and admit card release milestones
              managed directly by platform administrators.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {events.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {events.map((ev) => {
                  const exam = ev.exam || allExams.find((e) => e.id === ev.exam_id);

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
                            {ev.end_date && (
                              <span>
                                {" "}
                                -{" "}
                                {new Date(ev.end_date).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            )}
                          </span>

                          {ev.verification_date && (
                            <span className="text-[11px] text-slate-400">
                              Verified: {ev.verification_date}
                            </span>
                          )}
                        </div>
                      </div>

                      {ev.official_source_url && (
                        <a
                          href={ev.official_source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-slate-50 shrink-0"
                        >
                          Official Source
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <CalendarDays className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                <h4 className="text-sm font-semibold text-slate-800">
                  No Exam Schedule Events Published Yet
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Official notification schedules and application deadlines will appear here once
                  published by administrators.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
