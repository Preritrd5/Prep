"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  saveStoredEnrollment,
  removeStoredEnrollment,
  saveStoredCustomExam,
} from "@/lib/data/local-store";
import type { StudentExam, Exam } from "@/lib/types";

export async function enrollStudentExamAction(formData: FormData) {
  const { user } = await requireAuth();
  const examId = formData.get("examId") as string;
  const targetDate = (formData.get("targetDate") as string) || null;
  const priority = parseInt((formData.get("priority") as string) || "1", 10) as 1 | 2 | 3;
  const notes = (formData.get("notes") as string) || null;

  if (!examId) {
    return { error: "Please select a valid examination." };
  }

  const enrollmentRecord: StudentExam = {
    id: `se-${user.id}-${examId}`,
    student_id: user.id,
    exam_id: examId,
    target_date: targetDate,
    priority,
    notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await saveStoredEnrollment(enrollmentRecord);

  try {
    const supabase = await createClient();
    await supabase.from("student_exams").upsert(
      {
        student_id: user.id,
        exam_id: examId,
        target_date: targetDate,
        priority,
        notes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,exam_id" }
    );
  } catch {}

  revalidatePath("/examinations");
  revalidatePath("/dashboard");
  revalidatePath("/syllabus");
  return { success: true };
}

export async function removeStudentExamAction(formData: FormData) {
  const { user } = await requireAuth();
  const examId = formData.get("examId") as string;

  if (!examId) {
    return { error: "Exam ID missing." };
  }

  await removeStoredEnrollment(user.id, examId);

  try {
    const supabase = await createClient();
    await supabase
      .from("student_exams")
      .delete()
      .eq("student_id", user.id)
      .eq("exam_id", examId);
  } catch {}

  revalidatePath("/examinations");
  revalidatePath("/dashboard");
  revalidatePath("/syllabus");
  return { success: true };
}

export async function adminCreateExamAction(formData: FormData) {
  await requireOwner();

  const name = (formData.get("name") as string)?.trim();
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const category = (formData.get("category") as string)?.trim();
  const subCategory = (formData.get("subCategory") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name || !code || !category) {
    return { error: "Name, Code and Category are required." };
  }

  const customExam: Exam = {
    id: `exam-${Date.now().toString(36)}`,
    name,
    code,
    category,
    sub_category: subCategory,
    description,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await saveStoredCustomExam(customExam);

  try {
    const supabase = await createClient();
    await supabase.from("exams").insert({
      name,
      code,
      category,
      sub_category: subCategory,
      description,
      is_active: true,
    });
  } catch {}

  revalidatePath("/examinations");
  return { success: true };
}

export async function adminToggleExamStatusAction(formData: FormData) {
  await requireOwner();

  const examId = formData.get("examId") as string;
  const currentStatus = formData.get("currentStatus") === "true";

  const supabase = await createClient();

  const { error } = await supabase
    .from("exams")
    .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
    .eq("id", examId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/examinations");
  return { success: true };
}
