"use client";

import { Card, Button, PageHeader, Badge } from "@/components/ui";
import { useState } from "react";
import Link from "next/link";
import { Settings, Save, ArrowLeft, CheckCircle2, ShieldAlert, Moon, BellRing } from "lucide-react";
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
      setMessage("Notification preferences saved successfully!");
      setTimeout(() => setMessage(null), 3500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Notification Settings"
        description="Configure which study alerts you receive and customize quiet hours."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Notifications", href: "/notifications" },
          { label: "Preferences" },
        ]}
        actions={
          <Link href="/notifications">
            <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Center
            </Button>
          </Link>
        }
      />

      {message && (
        <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Toggles */}
        <Card variant="default">
          <div className="border-b border-border pb-3 mb-4 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Alert Categories
            </h2>
          </div>

          <div className="divide-y divide-border/60">
            <label className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-bg-secondary/30 px-2 rounded-lg transition-colors">
              <div>
                <span className="text-xs font-bold text-text-primary block">
                  Upcoming Study Tasks
                </span>
                <span className="text-[11px] text-text-muted">
                  Notify when scheduled study tasks are approaching.
                </span>
              </div>
              <input
                type="checkbox"
                name="upcoming_tasks"
                defaultChecked={prefs.upcoming_tasks}
                className="h-4 w-4 rounded border-input-border text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </label>

            <label className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-bg-secondary/30 px-2 rounded-lg transition-colors">
              <div>
                <span className="text-xs font-bold text-text-primary block">
                  Incomplete Task Reminders
                </span>
                <span className="text-[11px] text-text-muted">
                  Daily evening prompt for incomplete daily routine targets.
                </span>
              </div>
              <input
                type="checkbox"
                name="incomplete_tasks"
                defaultChecked={prefs.incomplete_tasks}
                className="h-4 w-4 rounded border-input-border text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </label>

            <label className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-bg-secondary/30 px-2 rounded-lg transition-colors">
              <div>
                <span className="text-xs font-bold text-text-primary block">
                  Spaced Revisions Due
                </span>
                <span className="text-[11px] text-text-muted">
                  Critical reminders when a syllabus topic reaches its review interval.
                </span>
              </div>
              <input
                type="checkbox"
                name="revisions_due"
                defaultChecked={prefs.revisions_due}
                className="h-4 w-4 rounded border-input-border text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </label>

            <label className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-bg-secondary/30 px-2 rounded-lg transition-colors">
              <div>
                <span className="text-xs font-bold text-text-primary block">
                  New Published Mock Examinations
                </span>
                <span className="text-[11px] text-text-muted">
                  Alert when an administrator publishes a new mock test.
                </span>
              </div>
              <input
                type="checkbox"
                name="new_published_exams"
                defaultChecked={prefs.new_published_exams}
                className="h-4 w-4 rounded border-input-border text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </label>

            <label className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-bg-secondary/30 px-2 rounded-lg transition-colors">
              <div>
                <span className="text-xs font-bold text-text-primary block">
                  Mock Test Results Released
                </span>
                <span className="text-[11px] text-text-muted">
                  Notify when delayed results or answer keys are published.
                </span>
              </div>
              <input
                type="checkbox"
                name="mock_results_ready"
                defaultChecked={prefs.mock_results_ready}
                className="h-4 w-4 rounded border-input-border text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </label>

            <label className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-bg-secondary/30 px-2 rounded-lg transition-colors">
              <div>
                <span className="text-xs font-bold text-text-primary block">
                  AI Study Recommendations
                </span>
                <span className="text-[11px] text-text-muted">
                  Adaptive study suggestions based on identified diagnostic weak areas.
                </span>
              </div>
              <input
                type="checkbox"
                name="study_recommendations"
                defaultChecked={prefs.study_recommendations}
                className="h-4 w-4 rounded border-input-border text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </label>
          </div>
        </Card>

        {/* Quiet Hours & Timezone */}
        <Card variant="default">
          <div className="border-b border-border pb-3 mb-4 flex items-center gap-2">
            <Moon className="w-4 h-4 text-secondary" />
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Quiet Hours & Timezone
            </h2>
          </div>

          <label className="flex items-center justify-between cursor-pointer py-2 hover:bg-bg-secondary/30 px-2 rounded-lg transition-colors">
            <div>
              <span className="text-xs font-bold text-text-primary block">
                Enable Quiet Hours
              </span>
              <span className="text-[11px] text-text-muted">
                Suppress non-critical notifications during sleep or focused study periods.
              </span>
            </div>
            <input
              type="checkbox"
              name="quiet_hours_enabled"
              defaultChecked={prefs.quiet_hours_enabled}
              className="h-4 w-4 rounded border-input-border text-primary focus:ring-primary accent-primary cursor-pointer"
            />
          </label>

          <div className="grid grid-cols-2 gap-4 pt-3">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                Quiet Hours Start:
              </label>
              <input
                type="time"
                name="quiet_hours_start"
                defaultValue={prefs.quiet_hours_start || "22:00"}
                className="w-full rounded-xl border border-input-border bg-card p-2 text-xs text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                Quiet Hours End:
              </label>
              <input
                type="time"
                name="quiet_hours_end"
                defaultValue={prefs.quiet_hours_end || "07:00"}
                className="w-full rounded-xl border border-input-border bg-card p-2 text-xs text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-3">
            <label className="text-xs font-semibold text-text-secondary block mb-1.5">
              Your Timezone:
            </label>
            <input
              type="text"
              name="timezone"
              defaultValue={prefs.timezone || "Asia/Kolkata"}
              className="w-full rounded-xl border border-input-border bg-card p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            icon={<Save className="h-4 w-4" />}
          >
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}
