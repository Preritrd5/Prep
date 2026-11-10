"use client";

import { useState } from "react";
import {
  Clock,
  Plus,
  Trash2,
  Calendar,
  Settings,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  createDailyRoutineAction,
  deleteDailyRoutineAction,
  updateStudyPreferencesAction,
} from "@/app/actions/tasks";
import type {
  RoutineTemplate,
  StudyPreferences,
  Exam,
  Subject,
  DayOfWeek,
} from "@/lib/types";

interface RoutineClientProps {
  routines: RoutineTemplate[];
  preferences: StudyPreferences;
  allExams: Exam[];
  allSubjects: Subject[];
}

const DAYS_OF_WEEK: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function RoutineClient({
  routines,
  preferences,
  allExams,
  allSubjects,
}: RoutineClientProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("Monday");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Routine Form State
  const [title, setTitle] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>("Monday");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:30");
  const [examId, setExamId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [priority, setPriority] = useState(2);

  // Preference Form State
  const [dailyHours, setDailyHours] = useState(preferences.daily_study_hours);
  const [slotDuration, setSlotDuration] = useState(preferences.preferred_slot_duration_minutes);
  const [timezone, setTimezone] = useState(preferences.timezone);
  const [autoCarry, setAutoCarry] = useState(preferences.auto_carry_forward);
  const [availableDays, setAvailableDays] = useState<string[]>(preferences.available_days || []);

  const dayRoutines = routines.filter((r) => r.day_of_week === selectedDay);

  const handleCreateRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("dayOfWeek", dayOfWeek);
    formData.append("startTime", startTime);
    formData.append("endTime", endTime);
    formData.append("durationMinutes", "90");
    formData.append("priority", priority.toString());
    formData.append("examId", examId);
    formData.append("subjectId", subjectId);

    const res = await createDailyRoutineAction(formData);
    setIsPending(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setIsAddModalOpen(false);
      setTitle("");
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    if (!confirm("Delete this recurring study routine slot?")) return;
    await deleteDailyRoutineAction(id);
  };

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData();
    formData.append("dailyStudyHours", dailyHours.toString());
    formData.append("slotMinutes", slotDuration.toString());
    formData.append("timezone", timezone);
    if (autoCarry) formData.append("autoCarryForward", "on");
    availableDays.forEach((d) => formData.append("availableDays", d));

    await updateStudyPreferencesAction(formData);
    setIsPending(false);
    setIsPrefModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Day Tabs & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Day of Week Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {DAYS_OF_WEEK.map((day) => {
            const count = routines.filter((r) => r.day_of_week === day).length;
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{day}</span>
                {count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPrefModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Settings className="h-4 w-4" />
            Preferences
          </button>
          <button
            onClick={() => {
              setDayOfWeek(selectedDay);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Routine Slot
          </button>
        </div>
      </div>

      {/* Routine Slots List for Selected Day */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {selectedDay} Schedule ({dayRoutines.length} slots)
            </h2>
            <p className="text-xs text-slate-500">
              Recurring study blocks for this day. Synchronized with your weekly calendar.
            </p>
          </div>
          <span className="text-xs text-slate-500">Timezone: {preferences.timezone}</span>
        </div>

        {dayRoutines.length > 0 ? (
          <div className="space-y-3">
            {dayRoutines.map((routine) => {
              const exam = routine.exam || allExams.find((e) => e.id === routine.exam_id);
              const subject =
                routine.subject || allSubjects.find((s) => s.id === routine.subject_id);

              return (
                <div
                  key={routine.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-mono text-xs font-bold">
                      {routine.start_time.slice(0, 5)}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{routine.title}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {routine.start_time.slice(0, 5)} - {routine.end_time.slice(0, 5)}
                        </span>
                        {exam && (
                          <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-700 font-medium">
                            {exam.name}
                          </span>
                        )}
                        {subject && (
                          <span className="rounded bg-slate-200/80 px-2 py-0.5 text-slate-700">
                            {subject.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        routine.priority === 1
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : routine.priority === 2
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      Priority {routine.priority}
                    </span>

                    <button
                      onClick={() => handleDeleteRoutine(routine.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition"
                      title="Delete routine"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
            <Clock className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              No routine slots scheduled for {selectedDay}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;Add Routine Slot&quot; above to create a recurring study session.
            </p>
          </div>
        )}
      </div>

      {/* Add Routine Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Add Daily Routine Slot</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set recurring study blocks for your weekly schedule.
            </p>

            {errorMsg && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateRoutine} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Routine Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning General Studies Revision"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(parseInt(e.target.value, 10))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value={1}>1 (High)</option>
                    <option value={2}>2 (Medium)</option>
                    <option value={3}>3 (Low)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Associated Exam (Optional)
                </label>
                <select
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                >
                  <option value="">None / General Study</option>
                  {allExams.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Subject (Optional)
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                >
                  <option value="">None / Open Topic</option>
                  {allSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isPending ? "Saving..." : "Add to Routine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Study Preferences Modal */}
      {isPrefModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Study Preferences & Engine Rules</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configures the Automatic Study Planner and Task Carry-Forward Engine.
            </p>

            <form onSubmit={handleUpdatePreferences} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Daily Available Study Hours: {dailyHours} hrs
                </label>
                <input
                  type="range"
                  min={1}
                  max={12}
                  step={0.5}
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Preferred Study Slot Duration
                </label>
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(parseInt(e.target.value, 10))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                >
                  <option value={45}>45 minutes (Pomodoro focus)</option>
                  <option value={60}>60 minutes (Standard block)</option>
                  <option value={90}>90 minutes (Deep work)</option>
                  <option value={120}>120 minutes (Mock / problem set)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Timezone Standard
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST - UTC+04:00)</option>
                  <option value="America/New_York">America/New_York (EST/EDT)</option>
                </select>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCarry}
                    onChange={(e) => setAutoCarry(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Enable Automatic Task Carry-Forward
                    </span>
                    <span className="text-[11px] text-slate-500 leading-snug block mt-0.5">
                      Incomplete or missed tasks are carried forward to the next available study
                      slot without duplicates or overwrites.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPrefModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isPending ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
