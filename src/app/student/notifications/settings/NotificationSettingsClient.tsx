"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, Save, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import type { StudentNotificationPreferences } from "@/lib/types";
import { studentUpdateNotificationPreferencesAction } from "@/app/actions/analytics";

interface NotificationSettingsClientProps {
  initialPrefs: StudentNotificationPreferences;
}

export default function NotificationSettingsClient({
  initialPrefs,
}: NotificationSettingsClientProps) {
  const [prefs, setPrefs] = useState<StudentNotificationPreferences>(initialPrefs);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await studentUpdateNotificationPreferencesAction(formData);
    setIsSaving(false);

    if (res.success) {
      setMessage("Preferences saved successfully!");
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/student/notifications"
              className="text-slate-400 hover:text-slate-600 transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Settings className="h-6 w-6 text-indigo-600" />
              Notification Settings
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Configure which preparation reminders you receive and configure quiet hours.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Toggles */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Alert Categories
          </h2>

          <div className="divide-y divide-slate-100">
            <label className="py-3 flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Upcoming Study Tasks
                </span>
                <span className="text-[11px] text-slate-500">
                  Notify when scheduled study tasks are approaching.
                </span>
              </div>
              <input
                type="checkbox"
                name="upcoming_tasks"
                defaultChecked={prefs.upcoming_tasks}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="py-3 flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Incomplete Task Reminders
                </span>
                <span className="text-[11px] text-slate-500">
                  Daily evening prompt for incomplete daily routine targets.
                </span>
              </div>
              <input
                type="checkbox"
                name="incomplete_tasks"
                defaultChecked={prefs.incomplete_tasks}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="py-3 flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Spaced Revisions Due
                </span>
                <span className="text-[11px] text-slate-500">
                  Critical reminders when a syllabus topic reaches its review interval.
                </span>
              </div>
              <input
                type="checkbox"
                name="revisions_due"
                defaultChecked={prefs.revisions_due}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="py-3 flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  New Published Mock Examinations
                </span>
                <span className="text-[11px] text-slate-500">
                  Alert when an admin publishes a new online examination.
                </span>
              </div>
              <input
                type="checkbox"
                name="new_published_exams"
                defaultChecked={prefs.new_published_exams}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="py-3 flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Mock Test Results Released
                </span>
                <span className="text-[11px] text-slate-500">
                  Notify when delayed results or answer keys are published.
                </span>
              </div>
              <input
                type="checkbox"
                name="mock_results_ready"
                defaultChecked={prefs.mock_results_ready}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="py-3 flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  AI Study Recommendations
                </span>
                <span className="text-[11px] text-slate-500">
                  Adaptive study suggestions based on weak areas.
                </span>
              </div>
              <input
                type="checkbox"
                name="study_recommendations"
                defaultChecked={prefs.study_recommendations}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        {/* Quiet Hours & Timezone */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Quiet Hours & Timezone
          </h2>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Enable Quiet Hours
              </span>
              <span className="text-[11px] text-slate-500">
                Suppress non-critical notifications during sleep or study silence hours.
              </span>
            </div>
            <input
              type="checkbox"
              name="quiet_hours_enabled"
              defaultChecked={prefs.quiet_hours_enabled}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Quiet Hours Start:
              </label>
              <input
                type="time"
                name="quiet_hours_start"
                defaultValue={prefs.quiet_hours_start || "22:00"}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Quiet Hours End:
              </label>
              <input
                type="time"
                name="quiet_hours_end"
                defaultValue={prefs.quiet_hours_end || "07:00"}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Your Timezone:
            </label>
            <input
              type="text"
              name="timezone"
              defaultValue={prefs.timezone || "Asia/Kolkata"}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving Settings..." : "Save Preferences"}
          </button>
        </div>
      </form>
    </div>
  );
}
