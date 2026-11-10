import { requireRole } from "@/lib/auth";
import { getStudentRevisions, getStudentNotes } from "@/lib/data/syllabus";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { RotateCcw, CheckCircle2, Calendar, FileText, BookOpen } from "lucide-react";

export default async function StudentRevisionsPage() {
  const { profile, user } = await requireRole("student");

  const [revisions, notes] = await Promise.all([
    getStudentRevisions(user.id),
    getStudentNotes(user.id),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="student" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Revision & Notes Manager</h1>
            <p className="text-sm text-slate-600 mt-1">
              Spaced repetition review schedules and consolidated personal notes across your syllabus.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revision Cycles Left 2 Cols */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h2 className="text-base font-bold text-slate-900">
                    Scheduled Revisions ({revisions.length})
                  </h2>
                  <span className="text-xs text-slate-500">Spaced Review</span>
                </div>

                {revisions.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {revisions.map((rev) => (
                      <div key={rev.id} className="py-3.5 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-700 font-bold text-[10px]">
                              Rev #{rev.revision_number}
                            </span>
                            <span className="font-bold text-slate-900">
                              {rev.topic?.title || "Topic Revision"}
                            </span>
                          </div>
                          <p className="text-slate-500 mt-0.5">Due: {rev.scheduled_date}</p>
                        </div>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            rev.is_completed
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {rev.is_completed ? "Completed" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    <RotateCcw className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No revisions scheduled</p>
                    <p className="text-xs text-slate-400 mt-1">
                      As you complete syllabus topics, revision cycles will populate here.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Notes Right Col */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h2 className="text-base font-bold text-slate-900">
                    Topic Notes ({notes.length})
                  </h2>
                  <FileText className="h-4 w-4 text-slate-400" />
                </div>

                {notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.map((n) => (
                      <div
                        key={n.id}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-1 text-xs"
                      >
                        <h4 className="font-bold text-slate-900">{n.title}</h4>
                        <p className="text-slate-600 line-clamp-3">{n.content}</p>
                        {n.topic && (
                          <span className="text-[10px] text-indigo-600 font-semibold block pt-1">
                            Topic: {n.topic.title}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No personal notes saved yet. Click the note icon on any syllabus topic to attach notes.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
