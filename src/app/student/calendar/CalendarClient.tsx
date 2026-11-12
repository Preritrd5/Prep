"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  CalendarDays,
  Plus,
} from "lucide-react";
import { createStudyTaskAction } from "@/app/actions/tasks";
import type { StudyTask, ExamScheduleEvent, RoutineTemplate } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

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
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [selectedDateModal, setSelectedDateModal] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [priority, setPriority] = useState<number>(2);
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    if (!selectedDateModal || !taskTitle.trim()) return;

    setIsPending(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("title", taskTitle.trim());
    formData.append("scheduledDate", selectedDateModal);
    formData.append("durationMinutes", durationMinutes.toString());
    formData.append("priority", priority.toString());

    const res = await createStudyTaskAction(formData);
    setIsPending(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setSelectedDateModal(null);
      setTaskTitle("");
      setErrorMsg(null);
      router.refresh();
    }
  };

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Calendar Header Controls */}
      <Card>
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">{monthName}</h2>
              <p className="text-xs text-text-muted">Timezone: {timezone}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Toggles */}
            <div className="flex items-center rounded-xl bg-background-secondary p-1 border border-border">
              {(["month", "week", "day"] as CalendarView[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 capitalize text-xs font-semibold transition",
                    view === v
                      ? "bg-card text-primary shadow-xs font-bold"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1 border-l border-border pl-2.5">
              <Button variant="outline" size="sm" onClick={today}>
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={prevPeriod}
                aria-label="Previous period"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextPeriod}
                aria-label="Next period"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Calendar View */}
      {view === "month" && (
        <Card className="overflow-hidden">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 border-b border-border bg-background-secondary/70 text-center text-xs font-bold text-text-secondary py-3">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-border/60">
            {daysArray.map((day, idx) => {
              if (!day.isCurrentMonth) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[110px] bg-background-secondary/20 p-2 text-text-muted/30"
                  />
                );
              }

              const dayTasks = tasks.filter(
                (t) => t.scheduled_date === day.dateStr
              );
              const dayEvents = events.filter((e) =>
                e.start_date.startsWith(day.dateStr)
              );
              const isToday =
                day.dateStr === new Date().toISOString().split("T")[0];

              return (
                <div
                  key={day.dateStr}
                  onClick={() => setSelectedDateModal(day.dateStr)}
                  className={cn(
                    "min-h-[110px] p-2 hover:bg-primary-soft/30 transition cursor-pointer flex flex-col justify-between group",
                    isToday ? "bg-primary-soft/20" : "bg-card"
                  )}
                  title="Click to add a study task on this date"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center",
                        isToday
                          ? "bg-primary text-white"
                          : "text-text-primary group-hover:text-primary"
                      )}
                    >
                      {day.dayNum}
                    </span>
                    {(dayTasks.length > 0 || dayEvents.length > 0) && (
                      <span className="text-[10px] font-bold text-text-muted">
                        {dayTasks.length + dayEvents.length} items
                      </span>
                    )}
                  </div>

                  {/* Task / Event Pills */}
                  <div className="space-y-1 my-1 overflow-hidden">
                    {dayEvents.slice(0, 1).map((ev) => (
                      <div
                        key={ev.id}
                        className="truncate rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold text-accent border border-accent/20"
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}

                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className={cn(
                          "truncate rounded px-1.5 py-0.5 text-[10px] font-medium border",
                          t.status === "Completed"
                            ? "bg-success-soft text-success border-success-border line-through"
                            : "bg-background-secondary text-text-secondary border-border"
                        )}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}

                    {dayTasks.length > 2 && (
                      <div className="text-[9px] font-semibold text-text-muted pl-1">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-text-muted opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5 justify-end">
                    <Plus className="h-3 w-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Week / Day View Fallback list */}
      {view !== "month" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">
              {view === "week" ? "Current Week Schedule" : "Daily Agenda"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <div className="divide-y divide-border/60">
                {tasks.slice(0, 7).map((t) => (
                  <div
                    key={t.id}
                    className="py-3 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2
                        className={cn(
                          "h-4 w-4",
                          t.status === "Completed"
                            ? "text-success"
                            : "text-text-muted"
                        )}
                      />
                      <div>
                        <span className="font-semibold text-text-primary">
                          {t.title}
                        </span>
                        <span className="text-text-muted text-[11px] block">
                          {t.scheduled_date} • {t.duration_minutes}m
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={t.status === "Completed" ? "success" : "secondary"}
                      size="sm"
                    >
                      {t.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted py-4 text-center">
                No items scheduled for this period.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Add Task on Date Modal */}
      <Modal
        isOpen={Boolean(selectedDateModal)}
        onClose={() => {
          setSelectedDateModal(null);
          setErrorMsg(null);
        }}
        title={`Add Study Task for ${selectedDateModal}`}
        description="Quickly schedule a preparation session directly into your calendar."
      >
        {errorMsg && (
          <div className="mb-4">
            <Alert variant="error" title={errorMsg} onClose={() => setErrorMsg(null)} />
          </div>
        )}

        <form onSubmit={handleCreateTaskOnDate} className="space-y-4">
          <Input
            label="Task Title"
            required
            placeholder="e.g. Thermodynamics Solved Examples Review"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Duration"
              value={durationMinutes.toString()}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
              options={[
                { value: "30", label: "30 Minutes" },
                { value: "45", label: "45 Minutes" },
                { value: "60", label: "60 Minutes (1 Hour)" },
                { value: "90", label: "90 Minutes" },
                { value: "120", label: "120 Minutes (2 Hours)" },
              ]}
            />

            <Select
              label="Priority"
              value={priority.toString()}
              onChange={(e) => setPriority(parseInt(e.target.value, 10))}
              options={[
                { value: "1", label: "1 (High Priority)" },
                { value: "2", label: "2 (Medium Priority)" },
                { value: "3", label: "3 (Low Priority)" },
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/70">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setSelectedDateModal(null);
                setErrorMsg(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Schedule Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
