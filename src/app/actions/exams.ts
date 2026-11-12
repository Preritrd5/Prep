"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDatabaseError } from "@/lib/supabase/db-error";
import {
  isSchemaMissingError,
  readCloudData,
  writeCloudData,
} from "@/lib/supabase/cloud-store";
import type { StudentExam } from "@/lib/types";

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

  try {
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
      if (isSchemaMissingError(error)) {
        const list = await readCloudData<StudentExam[]>("student_exams.json", []);
        const filtered = list.filter((e) => !(e.student_id === user.id && e.exam_id === examId));
        filtered.push(enrollmentRecord);
        await writeCloudData("student_exams.json", filtered);
      } else {
        const err = formatDatabaseError(error, "student_exams");
        return { error: err.message };
      }
    }
  } catch (err: any) {
    if (isSchemaMissingError(err)) {
      const list = await readCloudData<StudentExam[]>("student_exams.json", []);
      const filtered = list.filter((e) => !(e.student_id === user.id && e.exam_id === examId));
      filtered.push(enrollmentRecord);
      await writeCloudData("student_exams.json", filtered);
    } else {
      const errDetails = formatDatabaseError(err, "student_exams");
      return { error: errDetails.message };
    }
  }

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

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("student_exams")
      .delete()
      .eq("student_id", user.id)
      .eq("exam_id", examId);

    if (error) {
      if (isSchemaMissingError(error)) {
        const list = await readCloudData<StudentExam[]>("student_exams.json", []);
        const filtered = list.filter((e) => !(e.student_id === user.id && e.exam_id === examId));
        await writeCloudData("student_exams.json", filtered);
      } else {
        const err = formatDatabaseError(error, "student_exams");
        return { error: err.message };
      }
    }
  } catch (err: any) {
    if (isSchemaMissingError(err)) {
      const list = await readCloudData<StudentExam[]>("student_exams.json", []);
      const filtered = list.filter((e) => !(e.student_id === user.id && e.exam_id === examId));
      await writeCloudData("student_exams.json", filtered);
    } else {
      const errDetails = formatDatabaseError(err, "student_exams");
      return { error: errDetails.message };
    }
  }

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

  try {
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
      const err = formatDatabaseError(error, "exams");
      return { error: err.message };
    }
  } catch (err: any) {
    const errDetails = formatDatabaseError(err, "exams");
    return { error: errDetails.message };
  }

  revalidatePath("/examinations");
  return { success: true };
}

export async function adminToggleExamStatusAction(formData: FormData) {
  await requireOwner();

  const examId = formData.get("examId") as string;
  const currentStatus = formData.get("currentStatus") === "true";

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("exams")
      .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
      .eq("id", examId);

    if (error) {
      const err = formatDatabaseError(error, "exams");
      return { error: err.message };
    }
  } catch (err: any) {
    const errDetails = formatDatabaseError(err, "exams");
    return { error: errDetails.message };
  }

  revalidatePath("/examinations");
  return { success: true };
}
