"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  Calendar,
  RotateCcw,
} from "lucide-react";
import {
  createStudyTaskAction,
  toggleTaskStatusAction,
  deleteStudyTaskAction,
  carryForwardIncompleteTasksAction,
} from "@/app/actions/tasks";
import type { StudyTask, Exam, Subject, TaskStatus } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface TasksClientProps {
  tasks: StudyTask[];
  allExams: Exam[];
  allSubjects: Subject[];
}

const STATUS_FILTERS: Array<TaskStatus | "All"> = [
  "All",
  "Upcoming",
  "In Progress",
  "Completed",
  "Incomplete",
  "Missed",
];

export default function TasksClient({
  tasks,
  allExams,
  allSubjects,
}: TasksClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | "All">("All");
  const [selectedExamId, setSelectedExamId] = useState<string>("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [carryForwardNotice, setCarryForwardNotice] = useState<string | null>(null);

  // Add Task Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState("10:00");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [priority, setPriority] = useState(2);
  const [examId, setExamId] = useState("");
  const [subjectId, setSubjectId] = useState("");

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
  }, [allSubjects, examId, allExams]);

  useEffect(() => {
    if (examId && subjectId) {
      const exists = filteredSubjects.some((s) => s.id === subjectId);
      if (!exists) {
        setSubjectId("");
      }
    }
  }, [examId, filteredSubjects, subjectId]);

  const filteredTasks = tasks.filter((t) => {
    if (selectedStatus !== "All" && t.status !== selectedStatus) return false;
    if (selectedExamId !== "All" && t.exam_id !== selectedExamId) return false;
    return true;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("scheduledDate", scheduledDate);
    formData.append("startTime", startTime);
    formData.append("durationMinutes", durationMinutes.toString());
    formData.append("priority", priority.toString());
    formData.append("examId", examId);
    formData.append("subjectId", subjectId);

    await createStudyTaskAction(formData);
    setIsPending(false);
    setIsAddModalOpen(false);
    setTitle("");
    setDescription("");
  };

  const handleToggle = async (task: StudyTask) => {
    const nextStatus: TaskStatus =
      task.status === "Completed" ? "Upcoming" : "Completed";
    await toggleTaskStatusAction(task.id, nextStatus);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Delete this study task?")) return;
    await deleteStudyTaskAction(taskId);
  };

  const handleCarryForward = async () => {
    setIsPending(true);
    setCarryForwardNotice(null);

    const res = await carryForwardIncompleteTasksAction();
    setIsPending(false);

    if (res?.message) {
      setCarryForwardNotice(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Carry-Forward Notification */}
      {carryForwardNotice && (
        <Alert
          variant="info"
          onClose={() => setCarryForwardNotice(null)}
          title="Carry Forward Processed"
        >
          {carryForwardNotice}
        </Alert>
      )}

      {/* Filter and Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {STATUS_FILTERS.map((st) => {
            const count =
              st === "All"
                ? tasks.length
                : tasks.filter((t) => t.status === st).length;
            const isSelected = selectedStatus === st;

            return (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 border",
                  isSelected
                    ? "bg-primary text-white border-primary shadow-sm shadow-primary/25"
                    : "bg-card border-border text-text-secondary hover:bg-background-secondary"
                )}
              >
                <span>{st}</span>
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
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCarryForward}
            isLoading={isPending}
            leftIcon={<RotateCcw className="h-3.5 w-3.5 text-primary" />}
            title="Carry forward overdue incomplete tasks to today without duplicating"
          >
            Carry Forward Overdue
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Exam Filter Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-text-muted font-semibold">Filter by Exam:</span>
        <button
          type="button"
          onClick={() => setSelectedExamId("All")}
          className={cn(
            "px-2.5 py-1 rounded-lg border text-xs font-medium transition",
            selectedExamId === "All"
              ? "bg-primary text-white border-primary"
              : "bg-card text-text-secondary border-border hover:bg-background-secondary"
          )}
        >
          All Exams
        </button>
        {allExams.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setSelectedExamId(e.id)}
            className={cn(
              "px-2.5 py-1 rounded-lg border text-xs font-medium whitespace-nowrap transition",
              selectedExamId === e.id
                ? "bg-primary text-white border-primary"
                : "bg-card text-text-secondary border-border hover:bg-background-secondary"
            )}
          >
            {e.name}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <Card>
        <CardContent className="p-0">
          {filteredTasks.length > 0 ? (
            <div className="divide-y divide-border/60">
              {filteredTasks.map((task) => {
                const exam =
                  task.exam || allExams.find((e) => e.id === task.exam_id);
                const subject =
                  task.subject ||
                  allSubjects.find((s) => s.id === task.subject_id);

                return (
                  <div
                    key={task.id}
                    className="p-4 hover:bg-background-secondary/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggle(task)}
                        className="mt-0.5 sm:mt-0 focus:outline-none shrink-0"
                        title={
                          task.status === "Completed"
                            ? "Mark uncompleted"
                            : "Mark completed"
                        }
                      >
                        {task.status === "Completed" ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <Circle className="h-5 w-5 text-text-muted hover:text-text-primary" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <span
                          className={cn(
                            "text-sm font-semibold block",
                            task.status === "Completed"
                              ? "text-text-muted line-through"
                              : "text-text-primary"
                          )}
                        >
                          {task.title}
                        </span>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {task.scheduled_date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.duration_minutes}m
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

                    <div className="flex items-center gap-3 pl-8 sm:pl-0 shrink-0">
                      <Badge
                        variant={
                          task.priority === 1
                            ? "error"
                            : task.priority === 2
                            ? "warning"
                            : "secondary"
                        }
                        size="sm"
                      >
                        Priority {task.priority}
                      </Badge>

                      <Badge
                        variant={
                          task.status === "Completed"
                            ? "success"
                            : task.status === "In Progress"
                            ? "warning"
                            : "secondary"
                        }
                        size="sm"
                      >
                        {task.status}
                      </Badge>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(task.id)}
                        title="Delete task"
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
                title="No tasks match the active filters"
                description="Create study tasks manually or generate a preparation plan with the Study Planner."
                action={
                  <Button
                    size="sm"
                    onClick={() => setIsAddModalOpen(true)}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Add Task
                  </Button>
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Study Task"
        description="Add a specific preparation assignment to your schedule."
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            required
            placeholder="e.g. Solve 25 Gate PYQ questions on Soil Mechanics"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            label="Description (Optional)"
            rows={2}
            placeholder="Key concepts or textbook chapters covered..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Scheduled Date"
              type="date"
              required
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />

            <Input
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Duration (Minutes)"
              type="number"
              min={15}
              step={15}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
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
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
