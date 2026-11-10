"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function enrollStudentExamAction(formData: FormData) {
  const { user } = await requireAuth();
  const examId = formData.get("examId") as string;
  const targetDate = (formData.get("targetDate") as string) || null;
  const priority = parseInt((formData.get("priority") as string) || "1", 10) as 1 | 2 | 3;
  const notes = (formData.get("notes") as string) || null;

  if (!examId) {
    return { error: "Please select a valid examination." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("student_exams").upsert(
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

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/student/exams");
  revalidatePath("/student/dashboard");
  revalidatePath("/student/syllabus");
  return { success: true };
}

export async function removeStudentExamAction(formData: FormData) {
  const { user } = await requireAuth();
  const examId = formData.get("examId") as string;

  if (!examId) {
    return { error: "Exam ID missing." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("student_exams")
    .delete()
    .eq("student_id", user.id)
    .eq("exam_id", examId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/student/exams");
  revalidatePath("/student/dashboard");
  revalidatePath("/student/syllabus");
  return { success: true };
}

export async function adminCreateExamAction(formData: FormData) {
  await requireRole("admin");

  const name = (formData.get("name") as string)?.trim();
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const category = (formData.get("category") as string)?.trim();
  const subCategory = (formData.get("subCategory") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name || !code || !category) {
    return { error: "Name, Code and Category are required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("exams").insert({
    name,
    code,
    category,
    sub_category: subCategory,
    description,
    is_active: true,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/exams");
  return { success: true };
}

export async function adminToggleExamStatusAction(formData: FormData) {
  await requireRole("admin");

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

  revalidatePath("/admin/exams");
  return { success: true };
}
