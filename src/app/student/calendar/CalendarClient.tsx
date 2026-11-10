"use client";

import { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Plus,
  BookOpen,
  CalendarDays,
} from "lucide-react";
import { createStudyTaskAction } from "@/app/actions/tasks";
import type { StudyTask, ExamScheduleEvent, RoutineTemplate } from "@/lib/types";

interface CalendarClientProps {
  tasks: StudyTask[];
  events: ExamScheduleEvent[];
  routines: RoutineTemplate[];
  timezone: string;
}

type CalendarView = "month" | "week" | "day";

export default function CalendarClient({
  tasks,
  events,
  routines,
  timezone,
}: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [selectedDateModal, setSelectedDateModal] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [isPending, setIsPending] = useState(false);

  // Helper date functions
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevPeriod = () => {
    if (view === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (view === "week") {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const nextPeriod = () => {
    if (view === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (view === "week") {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const today = () => setCurrentDate(new Date());

  // Generate Month Grid Days
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean }> = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push({ dateStr: "", dayNum: 0, isCurrentMonth: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    daysArray.push({ dateStr: dStr, dayNum: d, isCurrentMonth: true });
  }

  const handleCreateTaskOnDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDateModal || !taskTitle) return;

    setIsPending(true);
    const formData = new FormData();
    formData.append("title", taskTitle);
    formData.append("scheduledDate", selectedDateModal);
    formData.append("durationMinutes", "60");
    formData.append("priority", "2");

    await createStudyTaskAction(formData);
    setIsPending(false);
    setSelectedDateModal(null);
    setTaskTitle("");
  };

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{monthName}</h2>
            <p className="text-xs text-slate-400">Timezone: {timezone}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggles */}
          <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
            {(["month", "week", "day"] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-md px-3 py-1.5 capitalize transition ${
                  view === v
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <button
              onClick={today}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Today
            </button>
            <button
              onClick={prevPeriod}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextPeriod}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Calendar View */}
      {view === "month" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-500 py-3">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {daysArray.map((day, idx) => {
              if (!day.isCurrentMonth) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[110px] bg-slate-50/40 p-2 text-slate-300"
                  />
                );
              }

              const dayTasks = tasks.filter((t) => t.scheduled_date === day.dateStr);
              const dayEvents = events.filter((e) => e.start_date.startsWith(day.dateStr));
              const isToday =
                day.dateStr === new Date().toISOString().split("T")[0];

              return (
                <div
                  key={day.dateStr}
                  onClick={() => setSelectedDateModal(day.dateStr)}
                  className={`min-h-[110px] p-2 hover:bg-indigo-50/30 transition cursor-pointer flex flex-col justify-between ${
                    isToday ? "bg-indigo-50/40" : "bg-white"
                  }`}
                  title="Click to add a study task on this date"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isToday
                          ? "bg-indigo-600 text-white"
                          : "text-slate-700"
                      }`}
                    >
                      {day.dayNum}
                    </span>

                    <button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Badges / Items for Day */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {/* Official Exam Event Badge */}
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="truncate rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200"
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}

                    {/* Study Tasks */}
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium flex items-center gap-1 ${
                          t.status === "Completed"
                            ? "bg-slate-100 text-slate-500 line-through"
                            : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                        }`}
                        title={t.title}
                      >
                        {t.status === "Completed" && <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />}
                        <span className="truncate">{t.title}</span>
                      </div>
                    ))}

                    {dayTasks.length > 2 && (
                      <div className="text-[10px] font-semibold text-slate-400 pl-1">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekly & Daily Views */}
      {view !== "month" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-indigo-600 mb-2" />
          <h3 className="text-base font-bold text-slate-900">
            {view === "week" ? "Week View Agenda" : "Day View Agenda"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Detailed chronological schedule view synchronized with your daily routines and deadlines.
          </p>

          <div className="divide-y divide-slate-100 text-left max-w-2xl mx-auto border border-slate-200 rounded-xl overflow-hidden">
            {tasks.slice(0, 5).map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>{t.scheduled_date}</span>
                    {t.start_time && <span>{t.start_time.slice(0, 5)}</span>}
                    <span className="rounded bg-indigo-50 px-1.5 py-0.2 text-indigo-700 font-semibold">
                      {t.status}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  Priority {t.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Click-to-Create Task Modal */}
      {selectedDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Schedule Task on {selectedDateModal}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly create a study task directly on this calendar date.
            </p>

            <form onSubmit={handleCreateTaskOnDate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Revise Modern Indian History"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDateModal(null)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isPending ? "Adding..." : "Add to Calendar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
