"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getExamSyllabus, getStudyPreferences } from "@/lib/data/syllabus";
import { formatDatabaseError } from "@/lib/supabase/db-error";
import {
  isSchemaMissingError,
  readCloudData,
  writeCloudData,
} from "@/lib/supabase/cloud-store";
import type { StudyTask } from "@/lib/types";

export interface GeneratedPlanItem {
  examId: string;
  examName: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicTitle: string;
  scheduledDate: string; // YYYY-MM-DD
  durationMinutes: number;
  priority: 1 | 2 | 3;
}

export interface PlanGenerationResult {
  success: boolean;
  error?: string;
  message?: string;
  plan?: GeneratedPlanItem[];
  totalTopicsAllocated?: number;
  totalHoursAllocated?: number;
  daysAnalyzed?: number;
  isRevisionPlan?: boolean;
}

export async function generateStudyPlanAction(formData: FormData): Promise<PlanGenerationResult> {
  const { user } = await requireAuth();

  const examId = formData.get("examId") as string;
  const targetDateStr = formData.get("targetDate") as string;
  const daysCount = parseInt((formData.get("planHorizonDays") as string) || "14", 10);
  const includeCompleted = formData.get("includeCompleted") === "true";

  if (!examId) {
    return { success: false, error: "Please select an examination to plan for." };
  }

  // 1. Get Student Preferences & Syllabus
  const prefs = await getStudyPreferences(user.id);
  const { exam, subjects } = await getExamSyllabus(examId, user.id);

  if (!exam) {
    return { success: false, error: "Exam details not found." };
  }

  // 2. Identify Pending Topics vs All Topics
  const pendingTopics: Array<{
    topicId: string;
    topicTitle: string;
    subjectId: string;
    subjectName: string;
    estimatedMinutes: number;
  }> = [];

  const allTopics: Array<{
    topicId: string;
    topicTitle: string;
    subjectId: string;
    subjectName: string;
    estimatedMinutes: number;
  }> = [];

  subjects.forEach((subj) => {
    (subj.chapters || []).forEach((chap) => {
      (chap.topics || []).forEach((top) => {
        const item = {
          topicId: top.id,
          topicTitle: top.title,
          subjectId: subj.id,
          subjectName: subj.name,
          estimatedMinutes: top.estimated_minutes || 60,
        };
        allTopics.push(item);
        const status = (top.progress?.status || "").toUpperCase();
        if (status !== "COMPLETED") {
          pendingTopics.push(item);
        }
      });
    });
  });

  if (allTopics.length === 0) {
    return {
      success: false,
      error: `No syllabus topics found for ${exam.name}. Please ensure curriculum topics are loaded.`,
    };
  }

  let isRevisionPlan = false;
  let targetTopicList = pendingTopics;

  // If user requested completed topics or all topics are already completed, automatically allocate a revision plan
  if (includeCompleted || pendingTopics.length === 0) {
    isRevisionPlan = true;
    targetTopicList = allTopics;
  }

  // 3. Generate Day Slots based on Available Days & Study Hours
  const dailySlotsCount = Math.max(
    1,
    Math.floor((prefs.daily_study_hours * 60) / prefs.preferred_slot_duration_minutes)
  );

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const plan: GeneratedPlanItem[] = [];

  let topicIndex = 0;
  const startDate = new Date();

  for (let i = 1; i <= daysCount; i++) {
    if (topicIndex >= targetTopicList.length) break;

    const slotDate = new Date(startDate);
    slotDate.setDate(startDate.getDate() + i);

    const dayName = dayNames[slotDate.getDay()];
    if (!prefs.available_days.includes(dayName)) {
      continue; // Skip non-study days
    }

    const dateStr = slotDate.toISOString().split("T")[0];

    // Allocate topics into daily slots
    for (let slot = 0; slot < dailySlotsCount; slot++) {
      if (topicIndex >= targetTopicList.length) break;

      const currentTopic = targetTopicList[topicIndex];
      plan.push({
        examId: exam.id,
        examName: exam.name,
        subjectId: currentTopic.subjectId,
        subjectName: currentTopic.subjectName,
        topicId: currentTopic.topicId,
        topicTitle: currentTopic.topicTitle,
        scheduledDate: dateStr,
        durationMinutes: prefs.preferred_slot_duration_minutes,
        priority: isRevisionPlan ? 2 : 1,
      });

      topicIndex++;
    }
  }

  const totalHours = Math.round(
    (plan.reduce((acc, curr) => acc + curr.durationMinutes, 0) / 60) * 10
  ) / 10;

  return {
    success: true,
    plan,
    totalTopicsAllocated: plan.length,
    totalHoursAllocated: totalHours,
    daysAnalyzed: daysCount,
    isRevisionPlan,
    message: isRevisionPlan
      ? `Generated a comprehensive Revision Schedule for ${plan.length} topics across ${exam.name}.`
      : undefined,
  };
}

export async function saveGeneratedPlanAction(planItemsJson: string) {
  const { user } = await requireAuth();

  let planItems: GeneratedPlanItem[] = [];
  try {
    planItems = JSON.parse(planItemsJson);
  } catch {
    return { error: "Invalid plan format." };
  }

  if (!planItems || planItems.length === 0) {
    return { error: "No items to schedule." };
  }

  const newTasks: StudyTask[] = planItems.map((item) => ({
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    student_id: user.id,
    exam_id: item.examId,
    subject_id: item.subjectId,
    topic_id: item.topicId,
    title: `Study: ${item.topicTitle}`,
    description: `Auto-planned study session for ${item.subjectName} (${item.examName})`,
    scheduled_date: item.scheduledDate,
    start_time: null,
    end_time: null,
    duration_minutes: item.durationMinutes,
    priority: item.priority,
    status: "Upcoming",
    completed_at: null,
    carried_from_task_id: null,
    is_carried_forward: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("study_tasks").insert(newTasks);
    if (error) {
      if (isSchemaMissingError(error)) {
        const tasks = await readCloudData<StudyTask[]>("study_tasks.json", []);
        tasks.push(...newTasks);
        await writeCloudData("study_tasks.json", tasks);
      } else {
        const err = formatDatabaseError(error, "study_tasks");
        return { error: err.message };
      }
    }
  } catch (err: any) {
    if (isSchemaMissingError(err)) {
      const tasks = await readCloudData<StudyTask[]>("study_tasks.json", []);
      tasks.push(...newTasks);
      await writeCloudData("study_tasks.json", tasks);
    } else {
      const errDetails = formatDatabaseError(err, "study_tasks");
      return { error: errDetails.message };
    }
  }

  revalidatePath("/tasks");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: true, count: newTasks.length };
}
