"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  Calendar,
  Filter,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  Tag,
  CheckSquare,
} from "lucide-react";
import {
  createStudyTaskAction,
  toggleTaskStatusAction,
  deleteStudyTaskAction,
  carryForwardIncompleteTasksAction,
} from "@/app/actions/tasks";
import type { StudyTask, Exam, Subject, TaskStatus } from "@/lib/types";

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

export default function TasksClient({ tasks, allExams, allSubjects }: TasksClientProps) {
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
    const nextStatus: TaskStatus = task.status === "Completed" ? "Upcoming" : "Completed";
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
        <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-xs font-semibold text-indigo-900 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>{carryForwardNotice}</span>
          </div>
          <button
            onClick={() => setCarryForwardNotice(null)}
            className="text-indigo-600 hover:text-indigo-800 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {STATUS_FILTERS.map((st) => {
            const count = st === "All" ? tasks.length : tasks.filter((t) => t.status === st).length;
            const isSelected = selectedStatus === st;

            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{st}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCarryForward}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-60"
            title="Carry forward overdue incomplete tasks to today without duplicating"
          >
            <RotateCcw className="h-3.5 w-3.5 text-indigo-600" />
            Carry Forward Overdue
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Exam Filter Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-medium">Filter by Exam:</span>
        <button
          onClick={() => setSelectedExamId("All")}
          className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
            selectedExamId === "All"
              ? "bg-slate-800 text-white border-slate-800"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Exams
        </button>
        {allExams.map((e) => (
          <button
            key={e.id}
            onClick={() => setSelectedExamId(e.id)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium whitespace-nowrap transition ${
              selectedExamId === e.id
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {e.name}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {filteredTasks.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => {
              const isCompleted = task.status === "Completed";
              const exam = task.exam || allExams.find((e) => e.id === task.exam_id);
              const subject = task.subject || allSubjects.find((s) => s.id === task.subject_id);

              return (
                <div
                  key={task.id}
                  className="p-4 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(task)}
                      className="focus:outline-none shrink-0 mt-0.5 sm:mt-0"
                      title={`Click to mark ${isCompleted ? "Incomplete" : "Completed"}`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300 hover:text-indigo-600" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold ${
                            isCompleted ? "text-slate-400 line-through" : "text-slate-900"
                          }`}
                        >
                          {task.title}
                        </span>

                        {task.is_carried_forward && (
                          <span className="rounded bg-amber-50 px-1.5 py-0.2 text-[10px] font-bold text-amber-700 border border-amber-200">
                            Carried Forward
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {new Date(task.scheduled_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>

                        {task.start_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {task.start_time.slice(0, 5)} ({task.duration_minutes}m)
                          </span>
                        )}

                        {exam && (
                          <span className="rounded bg-indigo-50 px-1.5 py-0.2 text-indigo-700 font-semibold">
                            {exam.name}
                          </span>
                        )}

                        {subject && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-slate-600">
                            {subject.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pl-8 sm:pl-0">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        task.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : task.status === "In Progress"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : task.status === "Incomplete" || task.status === "Missed"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {task.status}
                    </span>

                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition"
                      title="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            <CheckSquare className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No tasks in this view</p>
            <p className="text-xs text-slate-400 mt-1">
              Add your daily preparation tasks or use the Automatic Study Planner to generate tasks.
            </p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Add Study Task</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Schedule focused preparation work for a specific topic or revision goal.
            </p>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solve 30 Questions on Soil Mechanics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Focus on Terzaghi bearing capacity equation"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(parseInt(e.target.value, 10))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                  >
                    <option value={1}>1 (High)</option>
                    <option value={2}>2 (Medium)</option>
                    <option value={3}>3 (Low)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Examination
                </label>
                <select
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                >
                  <option value="">None / Open Study</option>
                  {allExams.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                >
                  <option value="">None / General Topic</option>
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
                  {isPending ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
