"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDatabaseError } from "@/lib/supabase/db-error";
import {
  isSchemaMissingError,
  readCloudData,
  writeCloudData,
} from "@/lib/supabase/cloud-store";
import type { TaskStatus, DayOfWeek, StudyTask, RoutineTemplate, StudyPreferences } from "@/lib/types";

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

  const newTaskPayload = {
    id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    student_id: user.id,
    title,
    description,
    scheduled_date: scheduledDate,
    start_time: startTime,
    end_time: endTime,
    duration_minutes: durationMinutes,
    priority,
    status: "Upcoming" as TaskStatus,
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
    const { error } = await supabase.from("study_tasks").insert(newTaskPayload);

    if (error) {
      if (isSchemaMissingError(error)) {
        // Fallback directly to Supabase cloud storage bucket
        const tasks = await readCloudData<StudyTask[]>("study_tasks.json", []);
        tasks.push(newTaskPayload as unknown as StudyTask);
        await writeCloudData("study_tasks.json", tasks);
      } else {
        const err = formatDatabaseError(error, "study_tasks");
        return { error: err.message };
      }
    }
  } catch (err: any) {
    if (isSchemaMissingError(err)) {
      const tasks = await readCloudData<StudyTask[]>("study_tasks.json", []);
      tasks.push(newTaskPayload as unknown as StudyTask);
      await writeCloudData("study_tasks.json", tasks);
    } else {
      const errorDetails = formatDatabaseError(err, "study_tasks");
      return { error: errorDetails.message };
    }
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
    const { error } = await supabase
      .from("study_tasks")
      .update(updateData)
      .eq("id", taskId)
      .eq("student_id", user.id);

    if (error) {
      if (isSchemaMissingError(error)) {
        const tasks = await readCloudData<StudyTask[]>("study_tasks.json", []);
        const idx = tasks.findIndex((t) => t.id === taskId);
        if (idx >= 0) {
          tasks[idx] = { ...tasks[idx], ...updateData };
          await writeCloudData("study_tasks.json", tasks);
        }
      } else {
        const err = formatDatabaseError(error, "study_tasks");
        return { error: err.message };
      }
    }
  } catch (err: any) {
    if (isSchemaMissingError(err)) {
      const tasks = await readCloudData<StudyTask[]>("study_tasks.json", []);
      const idx = tasks.findIndex((t) => t.id === taskId);
      if (idx >= 0) {
        tasks[idx] = { ...tasks[idx], ...updateData };
        await writeCloudData("study_tasks.json", tasks);
      }
    } else {
      const errorDetails = formatDatabaseError(err, "study_tasks");
      return { error: errorDetails.message };
    }
  }

  revalidatePath("/tasks");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteStudyTaskAction(taskId: string) {
  const { user } = await requireAuth();

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("study_tasks")
      .delete()
      .eq("id", taskId)
      .eq("student_id", user.id);

    if (error) {
      if (isSchemaMissingError(error)) {
        const tasks = await readCloudData<StudyTask[]>("study_tasks.json", []);
        const filtered = tasks.filter((t) => t.id !== taskId);
        await writeCloudData("study_tasks.json", filtered);
      } else {
        const err = formatDatabaseError(error, "study_tasks");
        return { error: err.message };
      }
    }
  } catch (err: any) {
    if (isSchemaMissingError(err)) {
      const tasks = await readCloudData<StudyTask[]>("study_tasks.json", []);
      const filtered = tasks.filter((t) => t.id !== taskId);
      await writeCloudData("study_tasks.json", filtered);
    } else {
      const errorDetails = formatDatabaseError(err, "study_tasks");
      return { error: errorDetails.message };
    }
  }

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

  try {
    const supabase = await createClient();

    // 1. Check student preference
    const { data: pref, error: prefError } = await supabase
      .from("study_preferences")
      .select("auto_carry_forward")
      .eq("student_id", user.id)
      .maybeSingle();

    let autoCarry = true;
    if (prefError && isSchemaMissingError(prefError)) {
      const cloudPrefs = await readCloudData<StudyPreferences | null>("study_preferences.json", null);
      autoCarry = cloudPrefs?.auto_carry_forward ?? true;
    } else if (pref) {
      autoCarry = pref.auto_carry_forward ?? true;
    }

    if (!autoCarry) {
      return { success: false, message: "Automatic carry-forward is disabled in your preferences." };
    }

    // 2. Find eligible overdue tasks
    const { data: pastTasks, error: tasksError } = await supabase
      .from("study_tasks")
      .select("*")
      .eq("student_id", user.id)
      .lt("scheduled_date", todayStr)
      .in("status", ["Incomplete", "Missed", "Upcoming", "In Progress"]);

    let eligibleList: StudyTask[] = [];

    if (tasksError && isSchemaMissingError(tasksError)) {
      const cloudTasks = await readCloudData<StudyTask[]>("study_tasks.json", []);
      eligibleList = cloudTasks.filter(
        (t) =>
          t.student_id === user.id &&
          t.scheduled_date < todayStr &&
          ["Incomplete", "Missed", "Upcoming", "In Progress"].includes(t.status)
      );
    } else if (pastTasks) {
      eligibleList = pastTasks as StudyTask[];
    }

    if (!eligibleList || eligibleList.length === 0) {
      return { success: true, count: 0, message: "No overdue tasks require carry-forward." };
    }

    // Filter tasks already carried forward
    const tasksToCarry = eligibleList.filter((t) => !t.is_carried_forward);
    if (tasksToCarry.length === 0) {
      return { success: true, count: 0, message: "All overdue tasks are already rescheduled." };
    }

    const newTasks: StudyTask[] = tasksToCarry.map((task) => ({
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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

    const { error: insertError } = await supabase.from("study_tasks").insert(newTasks);
    if (insertError && isSchemaMissingError(insertError)) {
      const cloudTasks = await readCloudData<StudyTask[]>("study_tasks.json", []);
      // Mark old ones incomplete
      const carriedIds = new Set(tasksToCarry.map((t) => t.id));
      const updated = cloudTasks.map((t) =>
        carriedIds.has(t.id) ? { ...t, status: "Incomplete" as TaskStatus } : t
      );
      updated.push(...newTasks);
      await writeCloudData("study_tasks.json", updated);
    } else if (insertError) {
      const err = formatDatabaseError(insertError, "study_tasks");
      return { success: false, message: err.message };
    } else {
      await supabase
        .from("study_tasks")
        .update({ status: "Incomplete", updated_at: new Date().toISOString() })
        .in("id", tasksToCarry.map((t) => t.id))
        .eq("student_id", user.id);
    }

    revalidatePath("/tasks");
    revalidatePath("/calendar");
    revalidatePath("/dashboard");

    return {
      success: true,
      count: newTasks.length,
      message: `Successfully carried forward ${newTasks.length} task(s) to today.`,
    };
  } catch (err: any) {
    const errDetails = formatDatabaseError(err, "study_tasks");
    return { success: false, error: errDetails.message, message: errDetails.message };
  }
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

  const newRoutinePayload = {
    id: `routine-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("routine_templates").insert(newRoutinePayload);

    if (error) {
      if (isSchemaMissingError(error)) {
        const routines = await readCloudData<RoutineTemplate[]>("routine_templates.json", []);
        routines.push(newRoutinePayload as unknown as RoutineTemplate);
        await writeCloudData("routine_templates.json", routines);
      } else {
        const err = formatDatabaseError(error, "routine_templates");
        return { error: err.message };
      }
    }
  } catch (err: any) {
    if (isSchemaMissingError(err)) {
      const routines = await readCloudData<RoutineTemplate[]>("routine_templates.json", []);
      routines.push(newRoutinePayload as unknown as RoutineTemplate);
      await writeCloudData("routine_templates.json", routines);
    } else {
      const errDetails = formatDatabaseError(err, "routine_templates");
      return { error: errDetails.message };
    }
  }

  revalidatePath("/routine");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteDailyRoutineAction(routineId: string) {
  const { user } = await requireAuth();

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("routine_templates")
      .delete()
      .eq("id", routineId)
      .eq("student_id", user.id);

    if (error) {
      if (isSchemaMissingError(error)) {
        const routines = await readCloudData<RoutineTemplate[]>("routine_templates.json", []);
        const filtered = routines.filter((r) => r.id !== routineId);
        await writeCloudData("routine_templates.json", filtered);
      } else {
        const err = formatDatabaseError(error, "routine_templates");
        return { error: err.message };
      }
    }
  } catch (err: any) {
    if (isSchemaMissingError(err)) {
      const routines = await readCloudData<RoutineTemplate[]>("routine_templates.json", []);
      const filtered = routines.filter((r) => r.id !== routineId);
      await writeCloudData("routine_templates.json", filtered);
    } else {
      const errDetails = formatDatabaseError(err, "routine_templates");
      return { error: errDetails.message };
    }
  }

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
      prefsPayload,
      { onConflict: "student_id" }
    );

    if (error) {
      if (isSchemaMissingError(error)) {
        await writeCloudData("study_preferences.json", prefsPayload);
      } else {
        const err = formatDatabaseError(error, "study_preferences");
        return { error: err.message };
      }
    }
  } catch (err: any) {
    if (isSchemaMissingError(err)) {
      await writeCloudData("study_preferences.json", prefsPayload);
    } else {
      const errDetails = formatDatabaseError(err, "study_preferences");
      return { error: errDetails.message };
    }
  }

  revalidatePath("/routine");
  revalidatePath("/planner");
  revalidatePath("/study-planner");
  revalidatePath("/dashboard");
  return { success: true };
}
