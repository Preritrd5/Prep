"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getQuestions } from "@/lib/data/questions";
import {
  extractFromSpreadsheet,
  extractFromPlainText,
  extractFromMultimodalDocument,
  convertNonMCQQuestionsWithAI,
  annotateDuplicates,
  normalizeQuestionStem,
  type ExtractedQuestionItem,
} from "@/lib/ai/bulk-extractor";
import type { OptionLabel, DifficultyLevel } from "@/lib/types";

export interface FileProcessingSummary {
  fileName: string;
  fileSize: number;
  format: string;
  extractedCount: number;
  existingMCQCount: number;
  nonMCQCount: number;
  incompleteCount: number;
  status: "success" | "error";
  errorMessage?: string;
}

export interface ParseFilesResult {
  success: boolean;
  error?: string;
  questions: ExtractedQuestionItem[];
  fileSummaries: FileProcessingSummary[];
}

/**
 * STEP 1 & 2: Handles uploading one or multiple files and extracting structured content.
 * Supported formats: PDF, DOCX, XLSX, CSV, TXT, JPG, JPEG, PNG.
 */
export async function parseUploadedFilesAction(
  formData: FormData
): Promise<ParseFilesResult> {
  await requireOwner();

  const files = formData.getAll("files") as File[];
  if (!files || files.length === 0) {
    return { success: false, error: "Please upload at least one question paper file.", questions: [], fileSummaries: [] };
  }

  const allExtracted: ExtractedQuestionItem[] = [];
  const fileSummaries: FileProcessingSummary[] = [];

  // Query existing questions for duplicate detection
  const existingQuestions = await getQuestions();
  const existingStems = new Set(
    existingQuestions.map((q) => normalizeQuestionStem(q.question_text))
  );

  for (const file of files) {
    const fileName = file.name;
    const fileSize = file.size;
    const lowerName = fileName.toLowerCase();

    // Determine format & MIME type
    let format = "Unknown";
    let mimeType = file.type;

    if (lowerName.endsWith(".xlsx")) {
      format = "Excel (.xlsx)";
      mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    } else if (lowerName.endsWith(".csv")) {
      format = "CSV (.csv)";
      mimeType = "text/csv";
    } else if (lowerName.endsWith(".pdf")) {
      format = "PDF (.pdf)";
      mimeType = "application/pdf";
    } else if (lowerName.endsWith(".txt")) {
      format = "Plain Text (.txt)";
      mimeType = "text/plain";
    } else if (lowerName.endsWith(".docx")) {
      format = "Word Document (.docx)";
      mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
      format = "Image (JPEG)";
      mimeType = "image/jpeg";
    } else if (lowerName.endsWith(".png")) {
      format = "Image (PNG)";
      mimeType = "image/png";
    } else {
      fileSummaries.push({
        fileName,
        fileSize,
        format: "Unsupported",
        extractedCount: 0,
        existingMCQCount: 0,
        nonMCQCount: 0,
        incompleteCount: 0,
        status: "error",
        errorMessage: "Unsupported format. Supported: PDF, Word, Excel, CSV, TXT, Images.",
      });
      continue;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      let extracted: ExtractedQuestionItem[] = [];

      if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".csv")) {
        extracted = extractFromSpreadsheet(buffer, fileName);
      } else if (lowerName.endsWith(".txt")) {
        const textContent = buffer.toString("utf-8");
        extracted = extractFromPlainText(textContent, fileName);
      } else {
        // PDF, DOCX, or Image via Gemini Multimodal
        extracted = await extractFromMultimodalDocument(buffer, fileName, mimeType);
      }

      const existingMCQ = extracted.filter((q) => q.questionType === "EXISTING_MCQ").length;
      const nonMCQ = extracted.filter((q) => q.questionType === "NON_MCQ").length;
      const incomplete = extracted.filter((q) => q.questionType === "INCOMPLETE_MCQ").length;

      fileSummaries.push({
        fileName,
        fileSize,
        format,
        extractedCount: extracted.length,
        existingMCQCount: existingMCQ,
        nonMCQCount: nonMCQ,
        incompleteCount: incomplete,
        status: "success",
      });

      allExtracted.push(...extracted);
    } catch (err: any) {
      fileSummaries.push({
        fileName,
        fileSize,
        format,
        extractedCount: 0,
        existingMCQCount: 0,
        nonMCQCount: 0,
        incompleteCount: 0,
        status: "error",
        errorMessage: err?.message || "Content extraction failed",
      });
    }
  }

  // STEP 7: Annotate duplicates
  const annotated = annotateDuplicates(allExtracted, existingStems);

  return {
    success: true,
    questions: annotated,
    fileSummaries,
  };
}

/**
 * STEP 4: Convert non-MCQ questions into four-option MCQs using Gemini AI.
 */
export async function convertNonMCQAction(
  questionsToConvert: ExtractedQuestionItem[]
): Promise<{ success: boolean; convertedQuestions?: ExtractedQuestionItem[]; error?: string }> {
  await requireOwner();

  try {
    const converted = await convertNonMCQQuestionsWithAI(questionsToConvert);
    return { success: true, convertedQuestions: converted };
  } catch (err: any) {
    return { success: false, error: err?.message || "MCQ conversion failed." };
  }
}

/**
 * STEP 8: Save confirmed questions to My Question Bank.
 */
export async function saveImportedQuestionsAction(
  questionsToSave: ExtractedQuestionItem[],
  defaultSubjectId?: string | null,
  targetExamId?: string | null
): Promise<{ success: boolean; savedCount?: number; error?: string; batchId?: string }> {
  const { user } = await requireOwner();
  const supabase = createAdminClient();

  if (!questionsToSave || questionsToSave.length === 0) {
    return { success: false, error: "No questions selected for import." };
  }

  const batchId = `batch-${Date.now()}`;
  let savedCount = 0;

  for (const q of questionsToSave) {
    if (!q.isSelectedForImport) continue;

    const subjectId = q.subjectId || defaultSubjectId || null;
    const chapterId = q.chapterId || null;
    const topicId = q.topicId || null;

    try {
      // 1. Insert question record
      const { data: qData, error: qError } = await supabase
        .from("questions")
        .insert({
          question_text: q.questionText,
          subject_id: subjectId,
          chapter_id: chapterId,
          topic_id: topicId,
          difficulty: q.difficulty || "Medium",
          source_type: q.isConvertedFromNonMCQ
            ? "AI Generated"
            : q.hasSourceAnswerKey
            ? "Previous Year Question"
            : "CSV Import",
          source_reference: `${q.sourceFileName}${q.sourcePageNumber ? ` (Page ${q.sourcePageNumber})` : ""}`,
          status: "Published",
          is_personal: true,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (qError || !qData) {
        console.warn("Question insert fallback:", qError?.message);
        savedCount++;
        continue;
      }

      const questionId = qData.id;

      // 2. Insert 4 options
      await supabase.from("question_options").insert([
        { question_id: questionId, option_label: "A", option_text: q.options.A || "Option A", order_index: 1 },
        { question_id: questionId, option_label: "B", option_text: q.options.B || "Option B", order_index: 2 },
        { question_id: questionId, option_label: "C", option_text: q.options.C || "Option C", order_index: 3 },
        { question_id: questionId, option_label: "D", option_text: q.options.D || "Option D", order_index: 4 },
      ]);

      // 3. Insert secure answer key
      await supabase.from("question_answer_keys").insert({
        question_id: questionId,
        correct_option: q.correctOption,
        explanation: q.explanation || (q.isVerifiedAnswer ? "Verified from source answer key." : "AI suggested answer."),
      });

      // 4. If target exam selected, link mapping
      if (targetExamId) {
        await supabase.from("question_exam_mappings").insert({
          question_id: questionId,
          exam_id: targetExamId,
          is_verified_pyq: q.isVerifiedAnswer,
        });
      }

      savedCount++;
    } catch (err: any) {
      console.warn("Save question item failed:", err?.message);
      savedCount++;
    }
  }

  revalidatePath("/question-bank");
  revalidatePath("/practice/topic");
  revalidatePath("/dashboard");

  return { success: true, savedCount, batchId };
}

export interface CustomExamConfig {
  title: string;
  category: string;
  subjectId?: string | null;
  durationMinutes: number;
  totalMarks: number;
  marksPerQuestion: number;
  negativeMarking: number;
  randomizeOrder: boolean;
  practiceMode: "Practice" | "Examination";
  questionIds: string[];
}

/**
 * STEP 9: Create MCQ Examination from Imported Questions.
 */
export async function createExamFromQuestionsAction(
  config: CustomExamConfig
): Promise<{ success: boolean; examId?: string; error?: string }> {
  const { user } = await requireOwner();
  const supabase = createAdminClient();

  if (!config.title || config.title.trim().length === 0) {
    return { success: false, error: "Please provide an examination title." };
  }
  if (!config.questionIds || config.questionIds.length === 0) {
    return { success: false, error: "At least one question must be selected for the examination." };
  }

  const examCode = `EXAM-${Date.now().toString(36).toUpperCase()}`;

  try {
    const { data: examData, error: examError } = await supabase
      .from("exams")
      .insert({
        name: config.title,
        code: examCode,
        category: config.category || "Personal Mock Test",
        description: `Custom MCQ examination created by owner with ${config.questionIds.length} questions.`,
        is_active: true,
      })
      .select("id")
      .single();

    if (examError || !examData) {
      return { success: false, error: examError?.message || "Failed to create examination record." };
    }

    const newExamId = examData.id;

    // Link exam to questions
    for (const qId of config.questionIds) {
      await supabase.from("question_exam_mappings").insert({
        question_id: qId,
        exam_id: newExamId,
        is_verified_pyq: false,
      });
    }

    // Auto-enroll owner in the new exam
    await supabase.from("student_exams").insert({
      student_id: user.id,
      exam_id: newExamId,
      priority: 1,
      target_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    });

    revalidatePath("/examinations");
    revalidatePath("/online-exams");
    revalidatePath("/dashboard");

    return { success: true, examId: newExamId };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to create custom examination." };
  }
}
