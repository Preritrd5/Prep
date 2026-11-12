"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDatabaseError } from "@/lib/supabase/db-error";
import type { ExamEventType } from "@/lib/types";

export async function adminCreateExamEventAction(formData: FormData) {
  const { user } = await requireOwner();

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

  try {
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
      const err = formatDatabaseError(error, "exam_schedule_events");
      return { error: err.message };
    }
  } catch (err: any) {
    const errDetails = formatDatabaseError(err, "exam_schedule_events");
    return { error: errDetails.message };
  }

  revalidatePath("/calendar");
  return { success: true };
}

export async function adminToggleExamEventAction(eventId: string, currentStatus: boolean) {
  await requireOwner();

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("exam_schedule_events")
      .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
      .eq("id", eventId);

    if (error) {
      const err = formatDatabaseError(error, "exam_schedule_events");
      return { error: err.message };
    }
  } catch (err: any) {
    const errDetails = formatDatabaseError(err, "exam_schedule_events");
    return { error: errDetails.message };
  }

  revalidatePath("/calendar");
  return { success: true };
}
