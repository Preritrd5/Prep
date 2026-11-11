"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Plus,
  Trash2,
  Settings,
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

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
  const router = useRouter();
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

  // Filter subjects by selected examination
  const filteredSubjects = useMemo(() => {
    if (!examId) return allSubjects;
    const selectedExam = allExams.find((e) => e.id === examId);
    if (!selectedExam) return allSubjects;

    const examCode = selectedExam.code || "";
    let targetCodes: string[] = [];
    if (examCode === "GATE-CS") targetCodes = ["GATE-EM", "GK-COMP", "GK-APT", "GK-SCITECH"];
    else if (examCode === "GATE-CE") targetCodes = ["GATE-EM", "CE-STRUCT", "CE-GEO", "GK-APT"];
    else if (examCode === "KAS-GS" || selectedExam.category === "KAS") targetCodes = ["GK-HIST", "GK-GEOG", "GK-POLITY", "GK-ECON", "GK-ENV", "GK-APT"];
    else if (examCode === "UPSC-CSE" || selectedExam.category === "UPSC") targetCodes = ["GK-HIST", "GK-GEOG", "GK-POLITY", "GK-ECON", "GK-ENV", "GK-SCITECH", "GK-CA", "GK-APT"];
    else if (examCode === "RRB-NTPC" || selectedExam.category === "Railway") targetCodes = ["GK-STATIC", "GK-SCI", "GK-APT", "GK-CA"];
    else if (examCode === "KEA-LS") targetCodes = ["CE-GEO", "GATE-EM", "GK-POLITY", "GK-APT"];
    else if (examCode === "KEA-VAO" || examCode === "KEA-SDA") targetCodes = ["GK-POLITY", "GK-HIST", "GK-COMP", "GK-APT"];
    else if (examCode === "KEA-FDA") targetCodes = ["GK-POLITY", "GK-ECON", "GK-GEOG", "GK-APT"];
    else if (examCode === "AE-CIVIL") targetCodes = ["CE-STRUCT", "CE-GEO", "GATE-EM", "GK-POLITY"];
    else return allSubjects;

    return allSubjects.filter((s) => targetCodes.includes(s.code));
  }, [examId, allExams, allSubjects]);

  const openAddRoutineModal = () => {
    setErrorMsg(null);
    setTitle("");
    setDayOfWeek(selectedDay);
    setIsAddModalOpen(true);
  };

  // Preference Form State
  const [dailyHours, setDailyHours] = useState(preferences.daily_study_hours);
  const [slotDuration, setSlotDuration] = useState(
    preferences.preferred_slot_duration_minutes
  );
  const [timezone, setTimezone] = useState(preferences.timezone);
  const [autoCarry, setAutoCarry] = useState(preferences.auto_carry_forward);
  const [availableDays, setAvailableDays] = useState<string[]>(
    preferences.available_days || []
  );

  const dayRoutines = routines.filter((r) => r.day_of_week === selectedDay);

  const handleCreateRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMsg(null);

    // Compute dynamic duration
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (isNaN(diffMinutes) || diffMinutes <= 0) diffMinutes = 60;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("dayOfWeek", dayOfWeek);
    formData.append("startTime", startTime);
    formData.append("endTime", endTime);
    formData.append("durationMinutes", diffMinutes.toString());
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
      setErrorMsg(null);
      router.refresh();
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    if (!confirm("Delete this recurring study routine slot?")) return;
    await deleteDailyRoutineAction(id);
    router.refresh();
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

  const toggleAvailableDay = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
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
                type="button"
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 border",
                  isSelected
                    ? "bg-primary text-white border-primary shadow-sm shadow-primary/25"
                    : "bg-card border-border text-text-secondary hover:bg-background-secondary"
                )}
              >
                <span>{day}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-[10px]",
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-background-secondary text-text-primary border border-border"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPrefModalOpen(true)}
            leftIcon={<Settings className="h-4 w-4" />}
          >
            Preferences
          </Button>
          <Button
            size="sm"
            onClick={openAddRoutineModal}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Routine Slot
          </Button>
        </div>
      </div>

      {/* Routine Slots List for Selected Day */}
      <Card>
        <CardHeader className="border-b border-border/70 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold">
              {selectedDay} Schedule ({dayRoutines.length} slots)
            </CardTitle>
            <p className="text-xs text-text-secondary mt-0.5">
              Recurring study blocks for this day. Synchronized with your weekly calendar.
            </p>
          </div>
          <span className="text-xs text-text-muted">
            Timezone: {preferences.timezone}
          </span>
        </CardHeader>

        <CardContent className="pt-4 p-0">
          {dayRoutines.length > 0 ? (
            <div className="divide-y divide-border/60">
              {dayRoutines.map((routine) => {
                const exam =
                  routine.exam || allExams.find((e) => e.id === routine.exam_id);
                const subject =
                  routine.subject ||
                  allSubjects.find((s) => s.id === routine.subject_id);

                return (
                  <div
                    key={routine.id}
                    className="p-4 hover:bg-background-secondary/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary font-mono text-xs font-bold border border-primary/20">
                        {routine.start_time.slice(0, 5)}
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-text-primary">
                          {routine.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {routine.start_time.slice(0, 5)} -{" "}
                            {routine.end_time.slice(0, 5)}
                          </span>
                          {exam && (
                            <Badge variant="primary" size="sm">
                              {exam.name}
                            </Badge>
                          )}
                          {subject && (
                            <Badge variant="secondary" size="sm">
                              {subject.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          routine.priority === 1
                            ? "error"
                            : routine.priority === 2
                            ? "warning"
                            : "secondary"
                        }
                        size="sm"
                      >
                        Priority {routine.priority}
                      </Badge>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRoutine(routine.id)}
                        title="Delete routine"
                        className="text-text-muted hover:text-error"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                icon={<Clock className="h-6 w-6" />}
                title={`No routine slots scheduled for ${selectedDay}`}
                description="Click 'Add Routine Slot' above to create a recurring study session."
                action={
                  <Button
                    size="sm"
                    onClick={openAddRoutineModal}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Add Routine Slot
                  </Button>
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Routine Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Daily Routine Slot"
        description="Set recurring study blocks for your weekly schedule."
      >
        {errorMsg && (
          <Alert variant="error" className="mb-4">
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={handleCreateRoutine} className="space-y-4">
          <Input
            label="Routine Title"
            required
            placeholder="e.g. Morning General Studies Revision"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Day of Week"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
              options={DAYS_OF_WEEK.map((d) => ({ label: d, value: d }))}
            />

            <Select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value, 10))}
              options={[
                { label: "1 (High Priority)", value: 1 },
                { label: "2 (Medium Priority)", value: 2 },
                { label: "3 (Low Priority)", value: 3 },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />

            <Input
              label="End Time"
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Associated Examination (Optional)"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              options={[
                { label: "None", value: "" },
                ...allExams.map((e) => ({ label: e.name, value: e.id })),
              ]}
            />

            <Select
              label="Subject (Optional)"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              options={[
                { label: "None", value: "" },
                ...filteredSubjects.map((s) => ({ label: s.name, value: s.id })),
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/70">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Create Routine Slot
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Preferences Modal */}
      <Modal
        isOpen={isPrefModalOpen}
        onClose={() => setIsPrefModalOpen(false)}
        title="Study Preference Rules"
        description="Configure rules used by the deterministic study planning and auto carry-forward engines."
      >
        <form onSubmit={handleUpdatePreferences} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Daily Study Hours"
              type="number"
              min={1}
              max={16}
              value={dailyHours}
              onChange={(e) => setDailyHours(parseFloat(e.target.value))}
            />

            <Input
              label="Preferred Slot Duration (mins)"
              type="number"
              min={15}
              step={15}
              max={240}
              value={slotDuration}
              onChange={(e) => setSlotDuration(parseInt(e.target.value, 10))}
            />
          </div>

          <Input
            label="Timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-2">
              Available Study Days
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = availableDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleAvailableDay(d)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold border transition",
                      isSelected
                        ? "bg-primary text-white border-primary"
                        : "bg-card text-text-secondary border-border hover:bg-background-secondary"
                    )}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="autoCarry"
              checked={autoCarry}
              onChange={(e) => setAutoCarry(e.target.checked)}
              className="h-4 w-4 rounded border-input-border text-primary focus:ring-primary"
            />
            <label htmlFor="autoCarry" className="text-xs font-medium text-text-primary">
              Auto carry-forward uncompleted tasks to the next available day
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/70">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsPrefModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Save Preferences
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
