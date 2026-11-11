"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import * as XLSX from "xlsx";
import { generateMCQBatch } from "@/lib/ai/question-generator";
import { FALLBACK_ANSWER_KEYS } from "@/lib/data/questions";
import { toggleStoredBookmark, saveStoredPersonalQuestion } from "@/lib/data/local-store";
import type {
  DifficultyLevel,
  OptionLabel,
  QuestionSource,
  QuestionStatus,
  PracticeMode,
  Question,
} from "@/lib/types";

// ===========================================================================
// MODULE 3: MANUAL ADMIN QUESTION CREATION & MANAGEMENT
// ===========================================================================

export async function adminCreateQuestionAction(formData: FormData) {
  const { user } = await requireOwner();

  const questionText = ((formData.get("question_text") as string) || "").trim();
  const subjectId = (formData.get("subject_id") as string) || null;
  const chapterId = (formData.get("chapter_id") as string) || null;
  const topicId = (formData.get("topic_id") as string) || null;
  const difficulty = ((formData.get("difficulty") as DifficultyLevel) || "Medium");
  const sourceType = ((formData.get("source_type") as QuestionSource) || "Manual");
  const pyqExamName = (formData.get("pyq_exam_name") as string) || null;
  const pyqYearStr = formData.get("pyq_year") as string;
  const pyqYear = pyqYearStr ? parseInt(pyqYearStr, 10) : null;
  const sourceReference = (formData.get("source_reference") as string) || null;
  const status = ((formData.get("status") as QuestionStatus) || "Published");

  const optionA = ((formData.get("option_a") as string) || "").trim();
  const optionB = ((formData.get("option_b") as string) || "").trim();
  const optionC = ((formData.get("option_c") as string) || "").trim();
  const optionD = ((formData.get("option_d") as string) || "").trim();
  const correctOption = ((formData.get("correct_option") as OptionLabel) || "A");
  const explanation = ((formData.get("explanation") as string) || "").trim();
  const applicableExamsJson = formData.get("applicable_exams") as string;

  if (!questionText) {
    return { error: "Question text is required." };
  }
  if (!optionA || !optionB || !optionC || !optionD) {
    return { error: "All four options (A, B, C, D) must be provided." };
  }
  if (!["A", "B", "C", "D"].includes(correctOption)) {
    return { error: "A valid correct option (A, B, C, or D) must be selected." };
  }

  const supabase = createAdminClient();
  let questionId = `q-manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  try {
    // 1. Insert question into database if tables exist
    const { data: qData, error: qError } = await supabase
      .from("questions")
      .insert({
        question_text: questionText,
        subject_id: subjectId || null,
        chapter_id: chapterId || null,
        topic_id: topicId || null,
        difficulty,
        source_type: sourceType,
        pyq_exam_name: pyqExamName,
        pyq_year: pyqYear,
        source_reference: sourceReference,
        status,
        is_personal: false,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (!qError && qData?.id) {
      questionId = qData.id;

      // 2. Insert 4 options
      const optionsPayload = [
        { question_id: questionId, option_label: "A", option_text: optionA, order_index: 1 },
        { question_id: questionId, option_label: "B", option_text: optionB, order_index: 2 },
        { question_id: questionId, option_label: "C", option_text: optionC, order_index: 3 },
        { question_id: questionId, option_label: "D", option_text: optionD, order_index: 4 },
      ];
      await supabase.from("question_options").insert(optionsPayload);

      // 3. Insert secure answer key
      await supabase.from("question_answer_keys").insert({
        question_id: questionId,
        correct_option: correctOption,
        explanation: explanation || null,
      });

      // 4. Insert exam mappings if provided
      if (applicableExamsJson) {
        try {
          const examIds: string[] = JSON.parse(applicableExamsJson);
          if (Array.isArray(examIds) && examIds.length > 0) {
            const mappingPayload = examIds.map((examId) => ({
              question_id: questionId,
              exam_id: examId,
              is_verified_pyq: sourceType === "Previous Year Question",
            }));
            await supabase.from("question_exam_mappings").insert(mappingPayload);
          }
        } catch {}
      }
    } else {
      console.warn("[Questions] Supabase question insert failed, saving to local store:", qError?.message);
    }
  } catch (err: any) {
    console.warn("[Questions] Database exception, saving to local store:", err?.message);
  }

  // Always save to resilient local question store
  const localQ: Question = {
    id: questionId,
    bank_id: null,
    question_text: questionText,
    subject_id: subjectId,
    chapter_id: chapterId,
    topic_id: topicId,
    difficulty,
    source_type: sourceType,
    pyq_exam_name: pyqExamName,
    pyq_year: pyqYear,
    source_reference: sourceReference,
    status,
    is_personal: false,
    created_by: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    options: [
      { id: `opt-${questionId}-A`, question_id: questionId, option_label: "A", option_text: optionA, order_index: 1, created_at: new Date().toISOString() },
      { id: `opt-${questionId}-B`, question_id: questionId, option_label: "B", option_text: optionB, order_index: 2, created_at: new Date().toISOString() },
      { id: `opt-${questionId}-C`, question_id: questionId, option_label: "C", option_text: optionC, order_index: 3, created_at: new Date().toISOString() },
      { id: `opt-${questionId}-D`, question_id: questionId, option_label: "D", option_text: optionD, order_index: 4, created_at: new Date().toISOString() },
    ],
    answer_key: {
      id: `key-${questionId}`,
      question_id: questionId,
      correct_option: correctOption,
      explanation: explanation || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
  await saveStoredPersonalQuestion(localQ);

  revalidatePath("/question-bank");
  revalidatePath("/practice/topic");
  revalidatePath("/practice/exam");
  revalidatePath("/practice/pyq");

  return { success: true, questionId };
}

export async function adminUpdateQuestionStatusAction(
  questionId: string,
  status: QuestionStatus
) {
  await requireOwner();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("questions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", questionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/question-bank");
  revalidatePath("/question-bank");
  return { success: true };
}

export async function adminBulkUpdateQuestionStatusAction(
  questionIds: string[],
  status: QuestionStatus
) {
  await requireOwner();
  if (!questionIds || questionIds.length === 0) {
    return { error: "No questions selected." };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("questions")
    .update({ status, updated_at: new Date().toISOString() })
    .in("id", questionIds);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/question-bank");
  revalidatePath("/question-bank");
  return { success: true, count: questionIds.length };
}

export async function adminDeleteQuestionAction(questionId: string) {
  await requireOwner();
  const supabase = createAdminClient();

  const { error } = await supabase.from("questions").delete().eq("id", questionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/question-bank");
  revalidatePath("/question-bank");
  return { success: true };
}

// ===========================================================================
// MODULE 4: EXCEL (.xlsx) & CSV BULK IMPORT WIZARD
// ===========================================================================

export async function importQuestionsBatchAction(formData: FormData) {
  const { user } = await requireOwner();
  const file = formData.get("file") as File | null;
  const defaultSubjectId = (formData.get("default_subject_id") as string) || null;
  const defaultExamId = (formData.get("default_exam_id") as string) || null;

  if (!file) {
    return { error: "No file uploaded. Please upload a valid .xlsx or .csv file." };
  }

  const fileName = file.name;
  const isXLSX = fileName.endsWith(".xlsx");
  const isCSV = fileName.endsWith(".csv");

  if (!isXLSX && !isCSV) {
    return { error: "Unsupported file format. Please upload an Excel (.xlsx) or CSV (.csv) file." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Disable formula calculation to guard against CSV injection
    const workbook = XLSX.read(buffer, { type: "buffer", cellFormula: false });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return { error: "The uploaded spreadsheet does not contain any sheets." };
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

    if (!rows || rows.length === 0) {
      return { error: "The spreadsheet is empty. Please provide questions data." };
    }

    const supabase = createAdminClient();

    // Query existing question texts to perform duplicate detection
    const { data: existingQData } = await supabase
      .from("questions")
      .select("question_text");
    const existingTexts = new Set(
      (existingQData || []).map((q: any) => q.question_text.trim().toLowerCase())
    );

    let validCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // header is row 1

      // Normalize column names
      const qText = (
        row["Question"] ||
        row["question"] ||
        row["Question Text"] ||
        row["question_text"] ||
        ""
      ).toString().trim();

      const optA = (row["Option A"] || row["option_a"] || row["OptionA"] || row["A"] || "").toString().trim();
      const optB = (row["Option B"] || row["option_b"] || row["OptionB"] || row["B"] || "").toString().trim();
      const optC = (row["Option C"] || row["option_c"] || row["OptionC"] || row["C"] || "").toString().trim();
      const optD = (row["Option D"] || row["option_d"] || row["OptionD"] || row["D"] || "").toString().trim();

      let ansKey = (row["Correct Option"] || row["correct_option"] || row["Answer"] || row["answer"] || "A")
        .toString()
        .trim()
        .toUpperCase();
      if (!["A", "B", "C", "D"].includes(ansKey)) {
        ansKey = "A";
      }

      const exp = (row["Explanation"] || row["explanation"] || "").toString().trim();
      let diff = (row["Difficulty"] || row["difficulty"] || "Medium").toString().trim();
      if (!["Easy", "Medium", "Hard"].includes(diff)) {
        diff = "Medium";
      }

      const pyqExam = (row["PYQ Exam"] || row["pyq_exam_name"] || row["Exam"] || "").toString().trim() || null;
      const pyqYearRaw = parseInt((row["PYQ Year"] || row["pyq_year"] || row["Year"] || "").toString(), 10);
      const pyqYear = isNaN(pyqYearRaw) ? null : pyqYearRaw;

      // Validation
      if (!qText || qText.length < 5) {
        invalidCount++;
        errors.push(`Row ${rowNum}: Question text is empty or too short.`);
        continue;
      }

      if (!optA || !optB || !optC || !optD) {
        invalidCount++;
        errors.push(`Row ${rowNum}: Missing one or more of Options A, B, C, D.`);
        continue;
      }

      // Duplicate check
      if (existingTexts.has(qText.toLowerCase())) {
        duplicateCount++;
        continue;
      }

      // Insert question as 'Draft' / 'Pending Review' for safety
      const { data: insertedQ, error: insError } = await supabase
        .from("questions")
        .insert({
          question_text: qText,
          subject_id: defaultSubjectId || null,
          difficulty: diff,
          source_type: isXLSX ? "Excel Import" : "CSV Import",
          pyq_exam_name: pyqExam,
          pyq_year: pyqYear,
          source_reference: `Imported from ${fileName}`,
          status: "Draft",
          is_personal: false,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (insError || !insertedQ) {
        invalidCount++;
        errors.push(`Row ${rowNum}: Database insert failed - ${insError?.message}`);
        continue;
      }

      const qId = insertedQ.id;

      // Insert options
      await supabase.from("question_options").insert([
        { question_id: qId, option_label: "A", option_text: optA, order_index: 1 },
        { question_id: qId, option_label: "B", option_text: optB, order_index: 2 },
        { question_id: qId, option_label: "C", option_text: optC, order_index: 3 },
        { question_id: qId, option_label: "D", option_text: optD, order_index: 4 },
      ]);

      // Insert answer key
      await supabase.from("question_answer_keys").insert({
        question_id: qId,
        correct_option: ansKey as OptionLabel,
        explanation: exp || null,
      });

      // Insert exam mapping if default provided
      if (defaultExamId) {
        await supabase.from("question_exam_mappings").insert({
          question_id: qId,
          exam_id: defaultExamId,
          is_verified_pyq: !!pyqExam,
        });
      }

      existingTexts.add(qText.toLowerCase());
      validCount++;
    }

    // Log batch record
    await supabase.from("question_import_batches").insert({
      file_name: fileName,
      file_type: isXLSX ? "XLSX" : "CSV",
      total_rows: rows.length,
      valid_rows: validCount,
      invalid_rows: invalidCount,
      duplicate_rows: duplicateCount,
      imported_by: user.id,
    });

    revalidatePath("/question-bank");
    revalidatePath("/question-bank");

    return {
      success: true,
      totalRows: rows.length,
      importedCount: validCount,
      duplicateCount,
      invalidCount,
      errors: errors.slice(0, 5), // Return first few errors if any
    };
  } catch (err: any) {
    return { error: err.message || "Failed to parse and import spreadsheet." };
  }
}

// ===========================================================================
// MODULE 5: GEMINI AI QUESTION GENERATION
// ===========================================================================

export async function generateAIQuestionsAction(formData: FormData) {
  const { user } = await requireOwner();

  const examId = (formData.get("exam_id") as string) || null;
  const examName = (formData.get("exam_name") as string) || undefined;
  const subjectId = (formData.get("subject_id") as string) || null;
  const subjectName = ((formData.get("subject_name") as string) || "General Knowledge").trim();
  const chapterId = (formData.get("chapter_id") as string) || null;
  const chapterName = (formData.get("chapter_name") as string) || undefined;
  const topicId = (formData.get("topic_id") as string) || null;
  const topicName = (formData.get("topic_name") as string) || undefined;

  const countStr = (formData.get("count") as string) || "5";
  const count = parseInt(countStr, 10) || 5;
  const difficulty = ((formData.get("difficulty") as any) || "Medium");
  const language = (formData.get("language") as string) || "English";
  const instructions = (formData.get("instructions") as string) || undefined;
  const sourceText = (formData.get("source_text") as string) || undefined;
  const useMock = formData.get("use_mock") === "true";

  const supabase = createAdminClient();

  // 1. Create generation job entry
  const { data: jobData } = await supabase
    .from("ai_question_generation_jobs")
    .insert({
      exam_id: examId,
      subject_id: subjectId,
      chapter_id: chapterId,
      topic_id: topicId,
      prompt: instructions || `Generate ${count} questions for ${subjectName}`,
      requested_count: count,
      difficulty,
      language,
      status: "Processing",
      created_by: user.id,
    })
    .select("id")
    .single();

  const jobId = jobData?.id;

  // 2. Call Gemini API
  const genResult = await generateMCQBatch({
    examName,
    subjectName,
    chapterName,
    topicName,
    count,
    difficulty,
    language,
    instructions,
    sourceText,
    useMock,
  });

  if (!genResult.success || !genResult.questions) {
    if (jobId) {
      await supabase
        .from("ai_question_generation_jobs")
        .update({
          status: "Failed",
          error_message: genResult.error || "Unknown error occurred.",
        })
        .eq("id", jobId);
    }
    return { error: genResult.error || "Failed to generate questions with AI." };
  }

  // 3. Save questions strictly with status = 'Pending Review'
  let insertedCount = 0;
  for (const q of genResult.questions) {
    let qId = `q-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    try {
      const { data: insertedQ, error: qErr } = await supabase
        .from("questions")
        .insert({
          question_text: q.question,
          subject_id: subjectId,
          chapter_id: chapterId,
          topic_id: topicId,
          difficulty: q.difficulty,
          source_type: "AI Generated",
          source_reference: `Gemini 2.5 Flash (${language})`,
          status: "Pending Review", // MODULE 5: Draft/Pending Review approval flow
          is_personal: false,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (!qErr && insertedQ?.id) {
        qId = insertedQ.id;

        // Insert options
        const optionsPayload = q.options.map((optText, idx) => ({
          question_id: qId,
          option_label: (["A", "B", "C", "D"][idx] as OptionLabel),
          option_text: optText,
          order_index: idx + 1,
        }));
        await supabase.from("question_options").insert(optionsPayload);

        // Insert answer key
        await supabase.from("question_answer_keys").insert({
          question_id: qId,
          correct_option: q.correctAnswer,
          explanation: q.explanation,
        });

        // Optional exam mapping
        if (examId) {
          await supabase.from("question_exam_mappings").insert({
            question_id: qId,
            exam_id: examId,
            is_verified_pyq: false,
          });
        }
      }
    } catch {}

    // Save locally
    const localQ: Question = {
      id: qId,
      bank_id: null,
      question_text: q.question,
      subject_id: subjectId,
      chapter_id: chapterId,
      topic_id: topicId,
      difficulty: q.difficulty,
      source_type: "AI Generated",
      pyq_exam_name: null,
      pyq_year: null,
      source_reference: `Gemini 2.5 Flash (${language})`,
      status: "Pending Review",
      is_personal: false,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      options: q.options.map((optText, idx) => ({
        id: `opt-${qId}-${["A", "B", "C", "D"][idx]}`,
        question_id: qId,
        option_label: (["A", "B", "C", "D"][idx] as OptionLabel),
        option_text: optText,
        order_index: idx + 1,
        created_at: new Date().toISOString(),
      })),
      answer_key: {
        id: `key-${qId}`,
        question_id: qId,
        correct_option: q.correctAnswer as OptionLabel,
        explanation: q.explanation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
    await saveStoredPersonalQuestion(localQ);

    insertedCount++;
  }

  // Update job status
  if (jobId) {
    await supabase
      .from("ai_question_generation_jobs")
      .update({
        status: "Completed",
        generated_count: insertedCount,
      })
      .eq("id", jobId);
  }

  revalidatePath("/question-bank");
  revalidatePath("/question-bank/ai");
  revalidatePath("/question-bank");

  return { success: true, count: insertedCount, totalRequested: count };
}

// ===========================================================================
// MODULE 7: STUDENT PRIVATE QUESTION BANKS
// ===========================================================================

export async function studentCreatePersonalBankAction(formData: FormData) {
  const { user } = await requireAuth();

  const name = ((formData.get("name") as string) || "").trim();
  const description = ((formData.get("description") as string) || "").trim();

  if (!name) {
    return { error: "Question bank name is required." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("question_banks")
    .insert({
      name,
      description: description || null,
      is_system: false,
      is_published: false,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/practice");
  return { success: true, bankId: data.id };
}

export async function studentCreatePersonalQuestionAction(formData: FormData) {
  const { user } = await requireAuth();

  const bankId = (formData.get("bank_id") as string) || null;
  const questionText = ((formData.get("question_text") as string) || "").trim();
  const subjectId = (formData.get("subject_id") as string) || null;
  const difficulty = ((formData.get("difficulty") as DifficultyLevel) || "Medium");
  const optionA = ((formData.get("option_a") as string) || "").trim();
  const optionB = ((formData.get("option_b") as string) || "").trim();
  const optionC = ((formData.get("option_c") as string) || "").trim();
  const optionD = ((formData.get("option_d") as string) || "").trim();
  const correctOption = ((formData.get("correct_option") as OptionLabel) || "A");
  const explanation = ((formData.get("explanation") as string) || "").trim();

  if (!questionText) {
    return { error: "Question text is required." };
  }
  if (!optionA || !optionB || !optionC || !optionD) {
    return { error: "All four options are required." };
  }

  const supabase = await createClient();
  let questionId = `q-personal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  try {
    const { data: qData, error: qError } = await supabase
      .from("questions")
      .insert({
        bank_id: bankId,
        question_text: questionText,
        subject_id: subjectId,
        difficulty,
        source_type: "Student Created",
        status: "Published",
        is_personal: true,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (!qError && qData?.id) {
      questionId = qData.id;

      await supabase.from("question_options").insert([
        { question_id: questionId, option_label: "A", option_text: optionA, order_index: 1 },
        { question_id: questionId, option_label: "B", option_text: optionB, order_index: 2 },
        { question_id: questionId, option_label: "C", option_text: optionC, order_index: 3 },
        { question_id: questionId, option_label: "D", option_text: optionD, order_index: 4 },
      ]);

      await supabase.from("question_answer_keys").insert({
        question_id: questionId,
        correct_option: correctOption,
        explanation: explanation || null,
      });
    } else {
      console.warn("[Questions] Supabase personal question insert failed, saving to local store:", qError?.message);
    }
  } catch (err: any) {
    console.warn("[Questions] Database exception, saving to local store:", err?.message);
  }

  // Always save to resilient local question store
  const localQ: Question = {
    id: questionId,
    bank_id: bankId,
    question_text: questionText,
    subject_id: subjectId,
    chapter_id: null,
    topic_id: null,
    difficulty,
    source_type: "Student Created",
    pyq_exam_name: null,
    pyq_year: null,
    source_reference: "Personal Notes",
    status: "Published",
    is_personal: true,
    created_by: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    options: [
      { id: `opt-${questionId}-A`, question_id: questionId, option_label: "A", option_text: optionA, order_index: 1, created_at: new Date().toISOString() },
      { id: `opt-${questionId}-B`, question_id: questionId, option_label: "B", option_text: optionB, order_index: 2, created_at: new Date().toISOString() },
      { id: `opt-${questionId}-C`, question_id: questionId, option_label: "C", option_text: optionC, order_index: 3, created_at: new Date().toISOString() },
      { id: `opt-${questionId}-D`, question_id: questionId, option_label: "D", option_text: optionD, order_index: 4, created_at: new Date().toISOString() },
    ],
    answer_key: {
      id: `key-${questionId}`,
      question_id: questionId,
      correct_option: correctOption,
      explanation: explanation || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
  await saveStoredPersonalQuestion(localQ);

  revalidatePath("/practice");
  revalidatePath("/question-bank");
  return { success: true, questionId };
}

// ===========================================================================
// MODULE 12: BOOKMARK MANAGEMENT
// ===========================================================================

export async function toggleQuestionBookmarkAction(questionId: string) {
  const { user } = await requireAuth();

  let bookmarked = false;
  try {
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("question_bookmarks")
      .select("id")
      .eq("student_id", user.id)
      .eq("question_id", questionId)
      .single();

    if (existing) {
      await supabase.from("question_bookmarks").delete().eq("id", existing.id);
      bookmarked = false;
    } else {
      await supabase.from("question_bookmarks").insert({
        student_id: user.id,
        question_id: questionId,
      });
      bookmarked = true;
    }
  } catch {
    bookmarked = await toggleStoredBookmark(user.id, questionId);
  }

  // Also ensure local store stays in sync
  try {
    const localResult = await toggleStoredBookmark(user.id, questionId);
    // If supabase succeeded, align local store state
    if (localResult !== bookmarked) {
      await toggleStoredBookmark(user.id, questionId);
    }
  } catch {}

  revalidatePath("/practice/bookmarks");
  revalidatePath("/dashboard");
  return { bookmarked };
}

// ===========================================================================
// MODULE 14: SECURE QUESTION ANSWER EVALUATION (SERVER-SIDE ONLY)
// ===========================================================================

/**
 * Evaluates a single question attempt in Learn Mode.
 * Answers and explanations are checked and retrieved strictly server-side.
 */
export async function submitLearnAttemptAction(data: {
  questionId: string;
  selectedOption: OptionLabel;
  timeSpent: number;
  sessionId?: string;
}) {
  const { user } = await requireAuth();
  const { questionId, selectedOption, timeSpent, sessionId } = data;

  const adminDb = createAdminClient();

  // 1. Fetch answer key server-side
  let correctOption: OptionLabel = "A";
  let explanation: string | null = null;

  const { data: keyData } = await adminDb
    .from("question_answer_keys")
    .select("correct_option, explanation")
    .eq("question_id", questionId)
    .single();

  if (keyData) {
    correctOption = keyData.correct_option as OptionLabel;
    explanation = keyData.explanation;
  } else if (FALLBACK_ANSWER_KEYS[questionId]) {
    // Graceful fallback for seeded offline questions
    correctOption = FALLBACK_ANSWER_KEYS[questionId].correct;
    explanation = FALLBACK_ANSWER_KEYS[questionId].explanation;
  }

  const isCorrect = selectedOption === correctOption;

  // 2. Log attempt record
  try {
    await adminDb.from("question_attempts").insert({
      session_id: sessionId || null,
      student_id: user.id,
      question_id: questionId,
      selected_option: selectedOption,
      is_correct: isCorrect,
      time_spent_seconds: timeSpent || 0,
    });
  } catch {
    // Continue even if logging attempt encounters temporary constraint
  }

  return {
    isCorrect,
    correctOption,
    explanation: explanation || "No explanation provided for this question.",
  };
}

/**
 * Evaluates a complete test session in Test Mode.
 * All grading is conducted server-side before returning score and review.
 */
export async function submitTestSessionAction(data: {
  sessionId?: string;
  examId?: string;
  subjectId?: string;
  topicId?: string;
  mode?: PracticeMode;
  answers: {
    questionId: string;
    selectedOption: OptionLabel | null;
    timeSpent: number;
  }[];
}) {
  const { user } = await requireAuth();
  const { answers, examId, subjectId, topicId, mode = "Test" } = data;

  const adminDb = createAdminClient();
  const questionIds = answers.map((a) => a.questionId);

  // 1. Retrieve all answer keys in one secure server-side query
  const { data: keysData } = await adminDb
    .from("question_answer_keys")
    .select("question_id, correct_option, explanation")
    .in("question_id", questionIds);

  const keysMap = new Map<string, { correct: OptionLabel; explanation: string | null }>();
  (keysData || []).forEach((k: any) => {
    keysMap.set(k.question_id, { correct: k.correct_option, explanation: k.explanation });
  });

  // Supplement with fallback answer keys if needed
  questionIds.forEach((qId) => {
    if (!keysMap.has(qId) && FALLBACK_ANSWER_KEYS[qId]) {
      keysMap.set(qId, {
        correct: FALLBACK_ANSWER_KEYS[qId].correct,
        explanation: FALLBACK_ANSWER_KEYS[qId].explanation,
      });
    }
  });

  // 2. Grade each question
  let correctCount = 0;
  let attemptedCount = 0;

  const questionReviews = answers.map((ans) => {
    const key = keysMap.get(ans.questionId) || { correct: "A" as OptionLabel, explanation: null };
    const isAttempted = ans.selectedOption !== null;
    const isCorrect = isAttempted && ans.selectedOption === key.correct;

    if (isAttempted) attemptedCount++;
    if (isCorrect) correctCount++;

    return {
      questionId: ans.questionId,
      selectedOption: ans.selectedOption,
      correctOption: key.correct,
      isCorrect,
      explanation: key.explanation,
      timeSpent: ans.timeSpent,
    };
  });

  const totalQuestions = answers.length;
  const incorrectCount = attemptedCount - correctCount;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // 3. Create or update practice session
  let sessionId = data.sessionId;
  try {
    if (sessionId) {
      await adminDb
        .from("practice_sessions")
        .update({
          total_questions: totalQuestions,
          attempted_questions: attemptedCount,
          correct_answers: correctCount,
          incorrect_answers: incorrectCount,
          score_percent: scorePercent,
          status: "Completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", sessionId);
    } else {
      const { data: sessData } = await adminDb
        .from("practice_sessions")
        .insert({
          student_id: user.id,
          mode,
          exam_id: examId || null,
          subject_id: subjectId || null,
          topic_id: topicId || null,
          total_questions: totalQuestions,
          attempted_questions: attemptedCount,
          correct_answers: correctCount,
          incorrect_answers: incorrectCount,
          score_percent: scorePercent,
          status: "Completed",
          completed_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      sessionId = sessData?.id;
    }

    // 4. Record question attempts
    const attemptsPayload = answers.map((ans) => {
      const rev = questionReviews.find((r) => r.questionId === ans.questionId);
      return {
        session_id: sessionId || null,
        student_id: user.id,
        question_id: ans.questionId,
        selected_option: ans.selectedOption,
        is_correct: rev?.isCorrect || false,
        time_spent_seconds: ans.timeSpent,
      };
    });

    await adminDb.from("question_attempts").insert(attemptsPayload);
  } catch {
    // Continue if DB tables awaiting migration
  }

  revalidatePath("/practice/history");
  revalidatePath("/practice/incorrect");

  return {
    success: true,
    sessionId,
    totalQuestions,
    attemptedCount,
    correctCount,
    incorrectCount,
    scorePercent,
    reviews: questionReviews,
  };
}
