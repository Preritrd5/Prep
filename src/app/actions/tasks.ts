"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { TaskStatus, DayOfWeek } from "@/lib/types";

export async function createStudyTaskAction(formData: FormData) {
  const { user } = await requireAuth();

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const scheduledDate = formData.get("scheduledDate") as string;
  const startTime = (formData.get("startTime") as string) || null;
  const endTime = (formData.get("endTime") as string) || null;
  const durationMinutes = parseInt((formData.get("durationMinutes") as string) || "60", 10);
  const priority = parseInt((formData.get("priority") as string) || "2", 10) as 1 | 2 | 3;
  const examId = (formData.get("examId") as string) || null;
  const subjectId = (formData.get("subjectId") as string) || null;
  const topicId = (formData.get("topicId") as string) || null;

  if (!title || !scheduledDate) {
    return { error: "Title and scheduled date are required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("study_tasks").insert({
    student_id: user.id,
    title,
    description,
    scheduled_date: scheduledDate,
    start_time: startTime,
    end_time: endTime,
    duration_minutes: durationMinutes,
    priority,
    status: "Upcoming",
    exam_id: examId,
    subject_id: subjectId,
    topic_id: topicId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleTaskStatusAction(taskId: string, newStatus: TaskStatus) {
  const { user } = await requireAuth();

  const supabase = await createClient();

  const updateData: Record<string, any> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (newStatus === "Completed") {
    updateData.completed_at = new Date().toISOString();
  } else {
    updateData.completed_at = null;
  }

  const { error } = await supabase
    .from("study_tasks")
    .update(updateData)
    .eq("id", taskId)
    .eq("student_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteStudyTaskAction(taskId: string) {
  const { user } = await requireAuth();

  const supabase = await createClient();

  const { error } = await supabase
    .from("study_tasks")
    .delete()
    .eq("id", taskId)
    .eq("student_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/calendar");
  return { success: true };
}

/**
 * Module 8: Carry-Forward Engine
 * Automatically carries forward incomplete/missed tasks from past dates to the next available date.
 * Rules:
 * - Never create duplicate tasks (checks existing carried_from_task_id)
 * - Never overwrite existing tasks
 * - Preserves original task reference (carried_from_task_id)
 * - Checks student auto_carry_forward preference
 */
export async function carryForwardIncompleteTasksAction() {
  const { user } = await requireAuth();
  const supabase = await createClient();

  // 1. Check student preference
  const { data: pref } = await supabase
    .from("study_preferences")
    .select("auto_carry_forward")
    .eq("student_id", user.id)
    .single();

  if (pref && !pref.auto_carry_forward) {
    return { success: false, message: "Automatic carry-forward is disabled in your preferences." };
  }

  const todayStr = new Date().toISOString().split("T")[0];

  // 2. Find incomplete or missed tasks before today that haven't been carried forward yet
  const { data: pastIncompleteTasks } = await supabase
    .from("study_tasks")
    .select("*")
    .eq("student_id", user.id)
    .lt("scheduled_date", todayStr)
    .in("status", ["Incomplete", "Missed", "Upcoming", "In Progress"]);

  if (!pastIncompleteTasks || pastIncompleteTasks.length === 0) {
    return { success: true, count: 0, message: "No overdue tasks require carry-forward." };
  }

  // Find already carried-from IDs to prevent duplicates
  const { data: existingCarried } = await supabase
    .from("study_tasks")
    .select("carried_from_task_id")
    .eq("student_id", user.id)
    .not("carried_from_task_id", "is", null);

  const carriedSet = new Set((existingCarried || []).map((t: any) => t.carried_from_task_id));

  // Eligible tasks to carry forward
  const tasksToCarry = pastIncompleteTasks.filter((t: any) => !carriedSet.has(t.id));

  if (tasksToCarry.length === 0) {
    return { success: true, count: 0, message: "All overdue tasks are already rescheduled." };
  }

  // Create new task entries scheduled for today
  const newTasks = tasksToCarry.map((task: any) => ({
    student_id: user.id,
    exam_id: task.exam_id,
    subject_id: task.subject_id,
    topic_id: task.topic_id,
    title: `[Carry-Forward] ${task.title.replace(/^\[Carry-Forward\]\s*/, "")}`,
    description: task.description ? `${task.description} (Rescheduled from ${task.scheduled_date})` : `Rescheduled from ${task.scheduled_date}`,
    scheduled_date: todayStr,
    start_time: task.start_time,
    end_time: task.end_time,
    duration_minutes: task.duration_minutes,
    priority: task.priority,
    status: "Upcoming",
    carried_from_task_id: task.id,
    is_carried_forward: true,
  }));

  const { error: insertError } = await supabase.from("study_tasks").insert(newTasks);

  if (insertError) {
    return { error: insertError.message };
  }

  // Mark original past tasks as 'Incomplete'
  const taskIdsToMark = tasksToCarry.map((t: any) => t.id);
  await supabase
    .from("study_tasks")
    .update({ status: "Incomplete", updated_at: new Date().toISOString() })
    .in("id", taskIdsToMark)
    .eq("student_id", user.id);

  revalidatePath("/tasks");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");

  return {
    success: true,
    count: newTasks.length,
    message: `Successfully carried forward ${newTasks.length} task(s) to today without duplicate creation.`,
  };
}

export async function createDailyRoutineAction(formData: FormData) {
  const { user } = await requireAuth();

  const title = (formData.get("title") as string)?.trim();
  const dayOfWeek = formData.get("dayOfWeek") as DayOfWeek;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const durationMinutes = parseInt((formData.get("durationMinutes") as string) || "60", 10);
  const priority = parseInt((formData.get("priority") as string) || "2", 10) as 1 | 2 | 3;
  const examId = (formData.get("examId") as string) || null;
  const subjectId = (formData.get("subjectId") as string) || null;

  if (!title || !dayOfWeek || !startTime || !endTime) {
    return { error: "Title, Day, Start Time and End Time are required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("routine_templates").insert({
    student_id: user.id,
    title,
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime,
    duration_minutes: durationMinutes,
    priority,
    exam_id: examId,
    subject_id: subjectId,
    is_active: true,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/routine");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteDailyRoutineAction(routineId: string) {
  const { user } = await requireAuth();

  const supabase = await createClient();

  const { error } = await supabase
    .from("routine_templates")
    .delete()
    .eq("id", routineId)
    .eq("student_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/routine");
  return { success: true };
}

export async function updateStudyPreferencesAction(formData: FormData) {
  const { user } = await requireAuth();

  const dailyStudyHours = parseFloat((formData.get("dailyStudyHours") as string) || "4.0");
  const preferredSlotMinutes = parseInt((formData.get("slotMinutes") as string) || "60", 10);
  const timezone = (formData.get("timezone") as string) || "Asia/Kolkata";
  const autoCarryForward = formData.get("autoCarryForward") === "on";

  const rawDays = formData.getAll("availableDays") as string[];
  const availableDays = rawDays.length > 0 ? rawDays : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const supabase = await createClient();

  const { error } = await supabase.from("study_preferences").upsert(
    {
      student_id: user.id,
      daily_study_hours: dailyStudyHours,
      available_days: availableDays,
      preferred_slot_duration_minutes: preferredSlotMinutes,
      timezone,
      auto_carry_forward: autoCarryForward,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id" }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/routine");
  revalidatePath("/study-planner");
  return { success: true };
}
