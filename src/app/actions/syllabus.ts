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
import type { TopicProgressStatus, TopicProgress, Topic, PersonalNote } from "@/lib/types";

export async function updateTopicProgressAction(formData: FormData) {
  const { user } = await requireAuth();

  const topicId = formData.get("topicId") as string;
  const examId = (formData.get("examId") as string) || null;
  const status = formData.get("status") as TopicProgressStatus;
  const actualMinutes = parseInt((formData.get("actualMinutes") as string) || "0", 10);
  const notes = (formData.get("notes") as string) || null;

  if (!topicId || !status) {
    return { error: "Missing required topic or status." };
  }

  const now = new Date().toISOString();
  const updatePayload: Record<string, any> = {
    id: `prog-${user.id}-${topicId}`,
    student_id: user.id,
    topic_id: topicId,
    exam_id: examId,
    status,
    actual_minutes: actualMinutes,
    notes,
    last_studied_date: now,
    updated_at: now,
  };

  if (status === "In Progress") {
    updatePayload.started_date = now;
  } else if (status === "Completed") {
    updatePayload.completed_date = now;
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("topic_progress")
      .upsert(updatePayload, { onConflict: "student_id,topic_id,exam_id" });

    if (error) {
      if (isSchemaMissingError(error)) {
        const list = await readCloudData<TopicProgress[]>("topic_progress.json", []);
        const filtered = list.filter(
          (p) => !(p.student_id === user.id && p.topic_id === topicId && p.exam_id === examId)
        );
        filtered.push(updatePayload as unknown as TopicProgress);
        await writeCloudData("topic_progress.json", filtered);
      } else {
        const err = formatDatabaseError(error, "topic_progress");
        return { error: err.message };
      }
    }
  } catch (err: any) {
    if (isSchemaMissingError(err)) {
      const list = await readCloudData<TopicProgress[]>("topic_progress.json", []);
      const filtered = list.filter(
        (p) => !(p.student_id === user.id && p.topic_id === topicId && p.exam_id === examId)
      );
      filtered.push(updatePayload as unknown as TopicProgress);
      await writeCloudData("topic_progress.json", filtered);
    } else {
      const errDetails = formatDatabaseError(err, "topic_progress");
      return { error: errDetails.message };
    }
  }

  revalidatePath("/syllabus");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function createPersonalTopicAction(formData: FormData) {
  const { user } = await requireAuth();

  const chapterId = (formData.get("chapterId") as string) || null;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const estimatedMinutes = parseInt((formData.get("estimatedMinutes") as string) || "60", 10);

  if (!title) {
    return { error: "Topic title is required." };
  }

  const newTopicRecord = {
    id: `topic-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    chapter_id: chapterId,
    title,
    description,
    estimated_minutes: estimatedMinutes,
    is_personal: true,
    is_published: false,
    created_by: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("topics").insert(newTopicRecord);

    if (error) {
      if (isSchemaMissingError(error)) {
        const list = await readCloudData<Topic[]>("personal_topics.json", []);
        list.push(newTopicRecord as unknown as Topic);
        await writeCloudData("personal_topics.json", list);
      } else {
        const err = formatDatabaseError(error, "topics");
        return { error: err.message };
      }
    }
  } catch (err: any) {
    if (isSchemaMissingError(err)) {
      const list = await readCloudData<Topic[]>("personal_topics.json", []);
      list.push(newTopicRecord as unknown as Topic);
      await writeCloudData("personal_topics.json", list);
    } else {
      const errDetails = formatDatabaseError(err, "topics");
      return { error: errDetails.message };
    }
  }

  revalidatePath("/syllabus");
  return { success: true };
}

export async function savePersonalNoteAction(formData: FormData) {
  const { user } = await requireAuth();

  const topicId = (formData.get("topicId") as string) || null;
  const examId = (formData.get("examId") as string) || null;
  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();

  if (!title || !content) {
    return { error: "Title and content cannot be empty." };
  }

  const notePayload = {
    id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    student_id: user.id,
    topic_id: topicId,
    exam_id: examId,
    title,
    content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("personal_notes").insert(notePayload);

    if (error) {
      if (isSchemaMissingError(error)) {
        const list = await readCloudData<PersonalNote[]>("personal_notes.json", []);
        list.push(notePayload as unknown as PersonalNote);
        await writeCloudData("personal_notes.json", list);
      } else {
        const err = formatDatabaseError(error, "personal_notes");
        return { error: err.message };
      }
    }
  } catch (err: any) {
    if (isSchemaMissingError(err)) {
      const list = await readCloudData<PersonalNote[]>("personal_notes.json", []);
      list.push(notePayload as unknown as PersonalNote);
      await writeCloudData("personal_notes.json", list);
    } else {
      const errDetails = formatDatabaseError(err, "personal_notes");
      return { error: errDetails.message };
    }
  }

  revalidatePath("/syllabus");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deletePersonalNoteAction(noteId: string) {
  const { user } = await requireAuth();

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("personal_notes")
      .delete()
      .eq("id", noteId)
      .eq("student_id", user.id);

    if (error) {
      if (isSchemaMissingError(error)) {
        const list = await readCloudData<PersonalNote[]>("personal_notes.json", []);
        const filtered = list.filter((n) => n.id !== noteId);
        await writeCloudData("personal_notes.json", filtered);
      } else {
        const err = formatDatabaseError(error, "personal_notes");
        return { error: err.message };
      }
    }
  } catch (err: any) {
    if (isSchemaMissingError(err)) {
      const list = await readCloudData<PersonalNote[]>("personal_notes.json", []);
      const filtered = list.filter((n) => n.id !== noteId);
      await writeCloudData("personal_notes.json", filtered);
    } else {
      const errDetails = formatDatabaseError(err, "personal_notes");
      return { error: errDetails.message };
    }
  }

  revalidatePath("/syllabus");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function adminCreateSubjectAction(formData: FormData) {
  await requireOwner();

  const name = (formData.get("name") as string)?.trim();
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const category = (formData.get("category") as string)?.trim() || "General Studies";
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name || !code) {
    return { error: "Subject Name and Code are required." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("subjects").insert({
      name,
      code,
      category,
      description,
      is_published: true,
    });

    if (error) {
      const err = formatDatabaseError(error, "subjects");
      return { error: err.message };
    }
  } catch (err: any) {
    const errDetails = formatDatabaseError(err, "subjects");
    return { error: errDetails.message };
  }

  revalidatePath("/syllabus");
  return { success: true };
}

export async function adminCreateChapterAction(formData: FormData) {
  await requireOwner();

  const subjectId = formData.get("subjectId") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!subjectId || !title) {
    return { error: "Subject and Chapter title are required." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("chapters").insert({
      subject_id: subjectId,
      title,
      description,
      is_published: true,
    });

    if (error) {
      const err = formatDatabaseError(error, "chapters");
      return { error: err.message };
    }
  } catch (err: any) {
    const errDetails = formatDatabaseError(err, "chapters");
    return { error: errDetails.message };
  }

  revalidatePath("/syllabus");
  return { success: true };
}

export async function adminCreateTopicAction(formData: FormData) {
  await requireOwner();

  const chapterId = formData.get("chapterId") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const estimatedMinutes = parseInt((formData.get("estimatedMinutes") as string) || "60", 10);
  const officialSyllabusRef = (formData.get("officialSyllabusRef") as string)?.trim() || null;
  const textbookRef = (formData.get("textbookRef") as string)?.trim() || null;
  const textbookPageStart = formData.get("textbookPageStart")
    ? parseInt(formData.get("textbookPageStart") as string, 10)
    : null;
  const textbookPageEnd = formData.get("textbookPageEnd")
    ? parseInt(formData.get("textbookPageEnd") as string, 10)
    : null;

  if (!chapterId || !title) {
    return { error: "Chapter and Topic title are required." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("topics").insert({
      chapter_id: chapterId,
      title,
      description,
      estimated_minutes: estimatedMinutes,
      official_syllabus_ref: officialSyllabusRef,
      textbook_ref: textbookRef,
      textbook_page_start: textbookPageStart,
      textbook_page_end: textbookPageEnd,
      is_published: true,
      is_personal: false,
    });

    if (error) {
      const err = formatDatabaseError(error, "topics");
      return { error: err.message };
    }
  } catch (err: any) {
    const errDetails = formatDatabaseError(err, "topics");
    return { error: errDetails.message };
  }

  revalidatePath("/syllabus");
  return { success: true };
}

export async function adminMapSubjectToExamAction(formData: FormData) {
  await requireOwner();

  const examId = formData.get("examId") as string;
  const subjectId = formData.get("subjectId") as string;
  const weightage = parseFloat((formData.get("weightage") as string) || "10");

  if (!examId || !subjectId) {
    return { error: "Exam and Subject are required." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("exam_subject_mappings").upsert(
      {
        exam_id: examId,
        subject_id: subjectId,
        weightage_percent: weightage,
      },
      { onConflict: "exam_id,subject_id" }
    );

    if (error) {
      const err = formatDatabaseError(error, "exam_subject_mappings");
      return { error: err.message };
    }
  } catch (err: any) {
    const errDetails = formatDatabaseError(err, "exam_subject_mappings");
    return { error: errDetails.message };
  }

  revalidatePath("/syllabus");
  revalidatePath("/examinations");
  return { success: true };
}
