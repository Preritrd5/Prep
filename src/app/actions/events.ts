"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ExamEventType } from "@/lib/types";

export async function adminCreateExamEventAction(formData: FormData) {
  const { user } = await requireRole("admin");

  const examId = formData.get("examId") as string;
  const eventType = formData.get("eventType") as ExamEventType;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const startDate = formData.get("startDate") as string;
  const endDate = (formData.get("endDate") as string) || null;
  const officialSourceUrl = (formData.get("officialSourceUrl") as string)?.trim() || null;
  const verificationDate = (formData.get("verificationDate") as string) || null;

  if (!examId || !eventType || !title || !startDate) {
    return { error: "Exam, Event Type, Title and Start Date are required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("exam_schedule_events").insert({
    exam_id: examId,
    event_type: eventType,
    title,
    description,
    start_date: startDate,
    end_date: endDate,
    official_source_url: officialSourceUrl,
    verification_date: verificationDate,
    is_active: true,
    created_by: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/events");
  revalidatePath("/student/schedule");
  return { success: true };
}

export async function adminToggleExamEventAction(eventId: string, currentStatus: boolean) {
  await requireRole("admin");

  const supabase = await createClient();

  const { error } = await supabase
    .from("exam_schedule_events")
    .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
    .eq("id", eventId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/events");
  revalidatePath("/student/schedule");
  return { success: true };
}
