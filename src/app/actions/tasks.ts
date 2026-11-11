"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { saveStoredRoutine, deleteStoredRoutine } from "@/lib/data/routine-store";
import {
  saveStoredTask,
  saveStoredTasks,
  updateStoredTask,
  deleteStoredTask,
  saveStoredPreferences,
  getStoredPreferences,
  getStoredTasks,
} from "@/lib/data/local-store";
import type { TaskStatus, DayOfWeek, RoutineTemplate, StudyTask, StudyPreferences } from "@/lib/types";

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

  const taskRecord: StudyTask = {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
    completed_at: null,
    carried_from_task_id: null,
    is_carried_forward: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("study_tasks")
      .insert({
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
      })
      .select("id")
      .single();

    if (error) {
      console.warn("[Tasks] Supabase insert failed, saving to local store:", error.message);
      await saveStoredTask(taskRecord);
    } else if (data?.id) {
      taskRecord.id = data.id;
      await saveStoredTask(taskRecord);
    }
  } catch (err: any) {
    console.warn("[Tasks] Database exception, saving to local store:", err?.message);
    await saveStoredTask(taskRecord);
  }

  revalidatePath("/tasks");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleTaskStatusAction(taskId: string, newStatus: TaskStatus) {
  const { user } = await requireAuth();

  const updateData: Record<string, any> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (newStatus === "Completed") {
    updateData.completed_at = new Date().toISOString();
  } else {
    updateData.completed_at = null;
  }

  try {
    const supabase = await createClient();
    await supabase
      .from("study_tasks")
      .update(updateData)
      .eq("id", taskId)
      .eq("student_id", user.id);
  } catch (err: any) {
    console.warn("[Tasks] Database update exception:", err?.message);
  }

  await updateStoredTask(taskId, user.id, updateData);

  revalidatePath("/tasks");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteStudyTaskAction(taskId: string) {
  const { user } = await requireAuth();

  try {
    const supabase = await createClient();
    await supabase
      .from("study_tasks")
      .delete()
      .eq("id", taskId)
      .eq("student_id", user.id);
  } catch (err: any) {
    console.warn("[Tasks] Database delete exception:", err?.message);
  }

  await deleteStoredTask(taskId, user.id);

  revalidatePath("/tasks");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Module 8: Carry-Forward Engine
 */
export async function carryForwardIncompleteTasksAction() {
  const { user } = await requireAuth();
  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Check student preference
  let autoCarry = true;
  try {
    const supabase = await createClient();
    const { data: pref } = await supabase
      .from("study_preferences")
      .select("auto_carry_forward")
      .eq("student_id", user.id)
      .single();

    if (pref) {
      autoCarry = pref.auto_carry_forward ?? true;
    } else {
      const localPref = await getStoredPreferences(user.id);
      if (localPref) autoCarry = localPref.auto_carry_forward;
    }
  } catch {
    const localPref = await getStoredPreferences(user.id);
    if (localPref) autoCarry = localPref.auto_carry_forward;
  }

  if (!autoCarry) {
    return { success: false, message: "Automatic carry-forward is disabled in your preferences." };
  }

  // 2. Find eligible overdue tasks
  let pastTasks: StudyTask[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("study_tasks")
      .select("*")
      .eq("student_id", user.id)
      .lt("scheduled_date", todayStr)
      .in("status", ["Incomplete", "Missed", "Upcoming", "In Progress"]);

    if (data && data.length > 0) {
      pastTasks = data as StudyTask[];
    }
  } catch {
    // fallback to local tasks
  }

  if (pastTasks.length === 0) {
    const localTasks = await getStoredTasks(user.id);
    pastTasks = localTasks.filter(
      (t) =>
        t.scheduled_date < todayStr &&
        ["Incomplete", "Missed", "Upcoming", "In Progress"].includes(t.status)
    );
  }

  if (pastTasks.length === 0) {
    return { success: true, count: 0, message: "No overdue tasks require carry-forward." };
  }

  // Filter tasks already carried forward
  const tasksToCarry = pastTasks.filter((t) => !t.is_carried_forward);
  if (tasksToCarry.length === 0) {
    return { success: true, count: 0, message: "All overdue tasks are already rescheduled." };
  }

  const newTasks: StudyTask[] = tasksToCarry.map((task) => ({
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    student_id: user.id,
    exam_id: task.exam_id,
    subject_id: task.subject_id,
    topic_id: task.topic_id,
    title: `[Carry-Forward] ${task.title.replace(/^\[Carry-Forward\]\s*/, "")}`,
    description: task.description
      ? `${task.description} (Rescheduled from ${task.scheduled_date})`
      : `Rescheduled from ${task.scheduled_date}`,
    scheduled_date: todayStr,
    start_time: task.start_time,
    end_time: task.end_time,
    duration_minutes: task.duration_minutes,
    priority: task.priority,
    status: "Upcoming",
    completed_at: null,
    carried_from_task_id: task.id,
    is_carried_forward: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  try {
    const supabase = await createClient();
    await supabase.from("study_tasks").insert(newTasks);
    await supabase
      .from("study_tasks")
      .update({ status: "Incomplete", updated_at: new Date().toISOString() })
      .in("id", tasksToCarry.map((t) => t.id))
      .eq("student_id", user.id);
  } catch (err: any) {
    console.warn("[Tasks] Database carry forward exception:", err?.message);
  }

  await saveStoredTasks(newTasks);
  for (const t of tasksToCarry) {
    await updateStoredTask(t.id, user.id, { status: "Incomplete" });
  }

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

  const routineRecord: RoutineTemplate = {
    id: `routine-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    student_id: user.id,
    title,
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime,
    duration_minutes: durationMinutes,
    priority,
    exam_id: examId,
    subject_id: subjectId,
    topic_id: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("routine_templates")
      .insert({
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
      })
      .select("id")
      .single();

    if (error) {
      console.warn("[Tasks] Supabase routine insert failed, saving to fallback store:", error.message);
      await saveStoredRoutine(routineRecord);
    } else if (data?.id) {
      routineRecord.id = data.id;
      await saveStoredRoutine(routineRecord);
    }
  } catch (err: any) {
    console.warn("[Tasks] Database operation exception, saving to fallback store:", err?.message);
    await saveStoredRoutine(routineRecord);
  }

  revalidatePath("/routine");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteDailyRoutineAction(routineId: string) {
  const { user } = await requireAuth();

  try {
    const supabase = await createClient();
    await supabase
      .from("routine_templates")
      .delete()
      .eq("id", routineId)
      .eq("student_id", user.id);
  } catch (err: any) {
    console.warn("[Tasks] Database delete exception:", err?.message);
  }

  await deleteStoredRoutine(routineId, user.id);

  revalidatePath("/routine");
  revalidatePath("/dashboard");
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

  const prefsPayload: StudyPreferences = {
    id: `pref-${user.id}`,
    student_id: user.id,
    daily_study_hours: dailyStudyHours,
    available_days: availableDays,
    preferred_slot_duration_minutes: preferredSlotMinutes,
    timezone,
    auto_carry_forward: autoCarryForward,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
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
      console.warn("[Tasks] Supabase preference upsert failed, saving to local store:", error.message);
    }
  } catch (err: any) {
    console.warn("[Tasks] Database preference exception, saving to local store:", err?.message);
  }

  await saveStoredPreferences(prefsPayload);

  revalidatePath("/routine");
  revalidatePath("/planner");
  revalidatePath("/study-planner");
  revalidatePath("/dashboard");
  return { success: true };
}
