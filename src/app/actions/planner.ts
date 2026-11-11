"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getExamSyllabus, getStudyPreferences } from "@/lib/data/syllabus";
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
  plan?: GeneratedPlanItem[];
  totalTopicsAllocated?: number;
  totalHoursAllocated?: number;
  daysAnalyzed?: number;
}

export async function generateStudyPlanAction(formData: FormData): Promise<PlanGenerationResult> {
  const { user } = await requireAuth();

  const examId = formData.get("examId") as string;
  const targetDateStr = formData.get("targetDate") as string;
  const daysCount = parseInt((formData.get("planHorizonDays") as string) || "14", 10);

  if (!examId) {
    return { success: false, error: "Please select an examination to plan for." };
  }

  // 1. Get Student Preferences & Syllabus
  const prefs = await getStudyPreferences(user.id);
  const { exam, subjects } = await getExamSyllabus(examId, user.id);

  if (!exam) {
    return { success: false, error: "Exam details not found." };
  }

  // 2. Identify Pending Topics (status != 'Completed')
  const pendingTopics: Array<{
    topicId: string;
    topicTitle: string;
    subjectId: string;
    subjectName: string;
    estimatedMinutes: number;
  }> = [];

  subjects.forEach((subj) => {
    (subj.chapters || []).forEach((chap) => {
      (chap.topics || []).forEach((top) => {
        if (!top.progress || top.progress.status !== "Completed") {
          pendingTopics.push({
            topicId: top.id,
            topicTitle: top.title,
            subjectId: subj.id,
            subjectName: subj.name,
            estimatedMinutes: top.estimated_minutes || 60,
          });
        }
      });
    });
  });

  if (pendingTopics.length === 0) {
    return {
      success: false,
      error: "All topics for this examination are already marked as completed! No pending topics.",
    };
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
    if (topicIndex >= pendingTopics.length) break;

    const slotDate = new Date(startDate);
    slotDate.setDate(startDate.getDate() + i);

    const dayName = dayNames[slotDate.getDay()];
    if (!prefs.available_days.includes(dayName)) {
      continue; // Skip non-study days
    }

    const dateStr = slotDate.toISOString().split("T")[0];

    // Allocate topics into daily slots
    for (let slot = 0; slot < dailySlotsCount; slot++) {
      if (topicIndex >= pendingTopics.length) break;

      const currentTopic = pendingTopics[topicIndex];
      plan.push({
        examId: exam.id,
        examName: exam.name,
        subjectId: currentTopic.subjectId,
        subjectName: currentTopic.subjectName,
        topicId: currentTopic.topicId,
        topicTitle: currentTopic.topicTitle,
        scheduledDate: dateStr,
        durationMinutes: prefs.preferred_slot_duration_minutes,
        priority: 1,
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

  const supabase = await createClient();

  const newTasks = planItems.map((item) => ({
    student_id: user.id,
    exam_id: item.examId,
    subject_id: item.subjectId,
    topic_id: item.topicId,
    title: `Study: ${item.topicTitle}`,
    description: `Auto-planned study session for ${item.subjectName} (${item.examName})`,
    scheduled_date: item.scheduledDate,
    duration_minutes: item.durationMinutes,
    priority: item.priority,
    status: "Upcoming",
  }));

  const { error } = await supabase.from("study_tasks").insert(newTasks);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: true, count: newTasks.length };
}
