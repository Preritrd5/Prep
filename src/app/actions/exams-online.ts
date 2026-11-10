"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ExamTemplate,
  ExamTemplateStatus,
  ExamCategory,
  OnlineExamType,
  ResultReleasePolicy,
  OptionLabel,
  SectionScoreSummary,
} from "@/lib/types";
import { FALLBACK_EXAM_TEMPLATES } from "@/lib/data/exams-online";
import { FALLBACK_QUESTIONS, FALLBACK_ANSWER_KEYS } from "@/lib/data/questions";

// ===========================================================================
// ADMIN ACTIONS: EXAMINATION TEMPLATE MANAGEMENT (MODULE 1 & 2)
// ===========================================================================

export async function adminCreateExamTemplateAction(formData: FormData) {
  const { user } = await requireRole("admin");

  const title = ((formData.get("title") as string) || "").trim();
  const description = ((formData.get("description") as string) || "").trim();
  const examCategory = ((formData.get("exam_category") as ExamCategory) || "General Knowledge");
  const examId = (formData.get("exam_id") as string) || null;
  const examType = ((formData.get("exam_type") as OnlineExamType) || "Full-Length Mock Test");
  const instructions = ((formData.get("instructions") as string) || "").trim();
  const durationMinutes = parseInt((formData.get("duration_minutes") as string) || "60", 10);
  const totalQuestions = parseInt((formData.get("total_questions") as string) || "0", 10);
  const totalMarks = parseFloat((formData.get("total_marks") as string) || "100.00");
  const passingMarksStr = formData.get("passing_marks") as string;
  const passingMarks = passingMarksStr ? parseFloat(passingMarksStr) : null;
  const maxAttempts = parseInt((formData.get("max_attempts") as string) || "1", 10);
  const startDate = (formData.get("start_date") as string) || null;
  const endDate = (formData.get("end_date") as string) || null;
  const randomizeQuestions = formData.get("randomize_questions") === "true";
  const randomizeOptions = formData.get("randomize_options") === "true";
  const hasNegativeMarking = formData.get("has_negative_marking") !== "false";
  const correctMarks = parseFloat((formData.get("correct_marks") as string) || "1.00");
  const negativeMarks = parseFloat((formData.get("negative_marks") as string) || "0.25");
  const resultReleasePolicy = ((formData.get("result_release_policy") as ResultReleasePolicy) || "Immediate");
  const status = ((formData.get("status") as ExamTemplateStatus) || "Draft");

  if (!title) {
    return { error: "Examination title is required." };
  }

  const adminDb = createAdminClient();

  try {
    const { data, error } = await adminDb
      .from("exam_templates")
      .insert({
        title,
        description: description || null,
        exam_category: examCategory,
        exam_id: examId || null,
        exam_type: examType,
        instructions: instructions || null,
        duration_minutes: durationMinutes > 0 ? durationMinutes : 60,
        total_questions: totalQuestions,
        total_marks: totalMarks,
        passing_marks: passingMarks,
        max_attempts: maxAttempts,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null,
        randomize_questions: randomizeQuestions,
        randomize_options: randomizeOptions,
        has_negative_marking: hasNegativeMarking,
        correct_marks: correctMarks,
        negative_marks: negativeMarks,
        unattempted_marks: 0.00,
        result_release_policy: resultReleasePolicy,
        results_published: resultReleasePolicy === "Immediate",
        status,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { error: error?.message || "Failed to create examination template." };
    }

    // Log Audit Event
    await adminDb.from("exam_audit_events").insert({
      template_id: data.id,
      user_id: user.id,
      event_type: "EXAM_CREATED",
      details_json: { title, examCategory, examType, durationMinutes },
    });

    revalidatePath("/admin/exams/manage");
    revalidatePath("/admin/exams/monitor");
    revalidatePath("/student/exams/online");

    return { success: true, templateId: data.id };
  } catch (err: any) {
    return { error: err.message || "An error occurred while creating the examination template." };
  }
}

export async function adminToggleExamStatusAction(templateId: string, status: ExamTemplateStatus) {
  const { user } = await requireRole("admin");
  const adminDb = createAdminClient();

  const { error } = await adminDb
    .from("exam_templates")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", templateId);

  if (error) {
    return { error: error.message };
  }

  await adminDb.from("exam_audit_events").insert({
    template_id: templateId,
    user_id: user.id,
    event_type: `STATUS_CHANGED_${status}`,
    details_json: { status },
  });

  revalidatePath("/admin/exams/manage");
  revalidatePath("/admin/exams/monitor");
  revalidatePath("/student/exams/online");
  return { success: true };
}

export async function adminDuplicateExamTemplateAction(templateId: string) {
  const { user } = await requireRole("admin");
  const adminDb = createAdminClient();

  // 1. Fetch source template
  const { data: source, error: sErr } = await adminDb
    .from("exam_templates")
    .select("*, sections:exam_sections(*), mappings:exam_question_mappings(*)")
    .eq("id", templateId)
    .single();

  if (sErr || !source) {
    return { error: "Source examination template not found." };
  }

  // 2. Clone template
  const { data: cloned, error: cErr } = await adminDb
    .from("exam_templates")
    .insert({
      title: `${source.title} (Copy)`,
      description: source.description,
      exam_category: source.exam_category,
      exam_id: source.exam_id,
      exam_type: source.exam_type,
      instructions: source.instructions,
      duration_minutes: source.duration_minutes,
      total_questions: source.total_questions,
      total_marks: source.total_marks,
      passing_marks: source.passing_marks,
      max_attempts: source.max_attempts,
      randomize_questions: source.randomize_questions,
      randomize_options: source.randomize_options,
      has_negative_marking: source.has_negative_marking,
      correct_marks: source.correct_marks,
      negative_marks: source.negative_marks,
      unattempted_marks: source.unattempted_marks,
      result_release_policy: source.result_release_policy,
      results_published: false,
      status: "Draft",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (cErr || !cloned) {
    return { error: cErr?.message || "Failed to duplicate template." };
  }

  const newTemplateId = cloned.id;

  // 3. Clone sections if any
  const sectionIdMap = new Map<string, string>();
  if (source.sections && source.sections.length > 0) {
    for (const sec of source.sections) {
      const { data: newSec } = await adminDb
        .from("exam_sections")
        .insert({
          template_id: newTemplateId,
          name: sec.name,
          subject_id: sec.subject_id,
          question_count: sec.question_count,
          total_marks: sec.total_marks,
          time_limit_minutes: sec.time_limit_minutes,
          order_index: sec.order_index,
          correct_marks: sec.correct_marks,
          negative_marks: sec.negative_marks,
        })
        .select("id")
        .single();
      if (newSec) {
        sectionIdMap.set(sec.id, newSec.id);
      }
    }
  }

  // 4. Clone question mappings
  if (source.mappings && source.mappings.length > 0) {
    const clonedMappings = source.mappings.map((m: any) => ({
      template_id: newTemplateId,
      section_id: m.section_id ? (sectionIdMap.get(m.section_id) || null) : null,
      question_id: m.question_id,
      order_index: m.order_index,
      marks: m.marks,
      negative_marks: m.negative_marks,
    }));
    await adminDb.from("exam_question_mappings").insert(clonedMappings);
  }

  revalidatePath("/admin/exams/manage");
  return { success: true, newTemplateId };
}

export async function adminReleaseExamResultsAction(templateId: string) {
  const { user } = await requireRole("admin");
  const adminDb = createAdminClient();

  const { error: tErr } = await adminDb
    .from("exam_templates")
    .update({ results_published: true, updated_at: new Date().toISOString() })
    .eq("id", templateId);

  if (tErr) return { error: tErr.message };

  // Update associated attempts
  await adminDb
    .from("exam_attempts")
    .update({
      result_release_status: "Results Released",
      updated_at: new Date().toISOString(),
    })
    .eq("template_id", templateId)
    .in("status", ["Submitted", "Auto Submitted", "Evaluated"]);

  await adminDb.from("exam_audit_events").insert({
    template_id: templateId,
    user_id: user.id,
    event_type: "RESULTS_RELEASED",
  });

  revalidatePath("/admin/exams/monitor");
  revalidatePath("/student/exams/online/history");
  return { success: true };
}

export async function adminCancelAttemptAction(attemptId: string, reason: string) {
  const { user } = await requireRole("admin");
  const adminDb = createAdminClient();

  const { error } = await adminDb
    .from("exam_attempts")
    .update({ status: "Cancelled", updated_at: new Date().toISOString() })
    .eq("id", attemptId);

  if (error) return { error: error.message };

  await adminDb.from("exam_audit_events").insert({
    attempt_id: attemptId,
    user_id: user.id,
    event_type: "ATTEMPT_CANCELLED",
    details_json: { reason },
  });

  revalidatePath("/admin/exams/monitor");
  return { success: true };
}

// ===========================================================================
// STUDENT ACTIONS: ATTEMPT LIFECYCLE, AUTOSAVE & TIMER (MODULES 6, 8, 9, 11, 12)
// ===========================================================================

/**
 * Initiates an examination attempt.
 * Computes server-authoritative started_at and expires_at.
 * Creates an immutable snapshot of questions and answers.
 */
export async function studentStartExamAttemptAction(templateId: string) {
  const { user } = await requireAuth();
  const adminDb = createAdminClient();

  // 1. Fetch Template
  const { data: templateData } = await adminDb
    .from("exam_templates")
    .select("*, sections:exam_sections(*), mappings:exam_question_mappings(*, question:questions(*, options:question_options(*)))")
    .eq("id", templateId)
    .single();

  const template = (templateData as ExamTemplate) || FALLBACK_EXAM_TEMPLATES.find((t) => t.id === templateId);
  if (!template) {
    return { error: "Examination not found." };
  }

  // 2. Check if student has an active 'In Progress' attempt
  const { data: existingAttempts } = await adminDb
    .from("exam_attempts")
    .select("*")
    .eq("student_id", user.id)
    .eq("template_id", templateId)
    .order("attempt_number", { ascending: false });

  const activeAttempt = (existingAttempts || []).find((a: any) => a.status === "In Progress");
  if (activeAttempt) {
    const isStillActive = new Date() < new Date(activeAttempt.expires_at);
    if (isStillActive) {
      // Resume existing active attempt
      return { success: true, attemptId: activeAttempt.id, resumed: true };
    } else {
      // Auto-submit expired attempt before allowing any next steps
      await internalEvaluateAndFinalizeAttempt(activeAttempt.id, "Auto Submitted");
    }
  }

  // 3. Check Maximum Attempts Limit
  const completedAttemptsCount = (existingAttempts || []).filter((a: any) =>
    ["Submitted", "Auto Submitted", "Evaluated", "Results Released"].includes(a.status)
  ).length;

  if (template.max_attempts > 0 && completedAttemptsCount >= template.max_attempts) {
    return {
      error: `You have reached the maximum allowed limit of ${template.max_attempts} attempt(s) for this examination.`,
    };
  }

  const attemptNumber = (existingAttempts?.length || 0) + 1;

  // 4. Server-Authoritative Timestamps (MODULE 8)
  const now = new Date();
  const durationMs = (template.duration_minutes || 60) * 60 * 1000;
  const expiresAt = new Date(now.getTime() + durationMs);

  // 5. Gather Questions for Attempt Snapshot (MODULE 11)
  let candidateQuestions: any[] = [];

  // Check manual mappings
  if (template.mappings && template.mappings.length > 0) {
    candidateQuestions = template.mappings
      .map((m: any) => ({
        ...m.question,
        marks: m.marks || template.correct_marks,
        negative_marks: m.negative_marks || template.negative_marks,
        section_id: m.section_id,
        section_name: template.sections?.find((s: any) => s.id === m.section_id)?.name,
      }))
      .filter((q: any) => q && q.question_text);
  }

  // If no mapped questions, match published questions from question bank
  if (candidateQuestions.length === 0) {
    const { data: dbQuestions } = await adminDb
      .from("questions")
      .select("*, options:question_options(*)")
      .eq("status", "Published")
      .limit(template.total_questions || 5);

    if (dbQuestions && dbQuestions.length > 0) {
      candidateQuestions = dbQuestions.map((q: any) => ({
        ...q,
        marks: template.correct_marks,
        negative_marks: template.negative_marks,
        section_name: "General Section",
      }));
    } else {
      candidateQuestions = FALLBACK_QUESTIONS.map((q) => ({
        ...q,
        marks: template.correct_marks,
        negative_marks: template.negative_marks,
        section_name: "General Section",
      }));
    }
  }

  // Apply question randomization if configured
  if (template.randomize_questions) {
    candidateQuestions = [...candidateQuestions].sort(() => Math.random() - 0.5);
  }

  // 6. Create Attempt Record
  const { data: attemptRecord, error: attErr } = await adminDb
    .from("exam_attempts")
    .insert({
      student_id: user.id,
      template_id: template.id,
      attempt_number: attemptNumber,
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      status: "In Progress",
      max_marks: template.total_marks,
      result_release_status: template.result_release_policy,
    })
    .select("id")
    .single();

  if (attErr || !attemptRecord) {
    return { error: attErr?.message || "Failed to initialize examination session." };
  }

  const attemptId = attemptRecord.id;

  // 7. Insert Immutable Question Snapshot (MODULE 11)
  for (let i = 0; i < candidateQuestions.length; i++) {
    const q = candidateQuestions[i];
    let options = (q.options || []).map((opt: any) => ({
      option_label: opt.option_label,
      option_text: opt.option_text,
    }));

    if (template.randomize_options) {
      options = [...options].sort(() => Math.random() - 0.5);
    }

    const { data: insertedSnapQ } = await adminDb
      .from("exam_attempt_questions")
      .insert({
        attempt_id: attemptId,
        question_id: q.id,
        section_id: q.section_id || null,
        section_name: q.section_name || "General Section",
        order_index: i + 1,
        question_text: q.question_text,
        options_json: options,
        marks: q.marks || template.correct_marks,
        negative_marks: q.negative_marks || template.negative_marks,
      })
      .select("id")
      .single();

    if (insertedSnapQ) {
      // 8. Fetch and store protected server-only answer key
      let correctOpt = "A";
      let exp = "Correct standard answer";

      const { data: keyData } = await adminDb
        .from("question_answer_keys")
        .select("correct_option, explanation")
        .eq("question_id", q.id)
        .single();

      if (keyData) {
        correctOpt = keyData.correct_option;
        exp = keyData.explanation || "";
      } else if (FALLBACK_ANSWER_KEYS[q.id]) {
        correctOpt = FALLBACK_ANSWER_KEYS[q.id].correct;
        exp = FALLBACK_ANSWER_KEYS[q.id].explanation;
      }

      await adminDb.from("exam_attempt_answer_keys").insert({
        attempt_id: attemptId,
        attempt_question_id: insertedSnapQ.id,
        correct_option: correctOpt,
        explanation: exp,
      });
    }
  }

  // Log Audit Event
  await adminDb.from("exam_audit_events").insert({
    template_id: template.id,
    attempt_id: attemptId,
    user_id: user.id,
    event_type: "ATTEMPT_STARTED",
    details_json: { attemptNumber, startedAt: now, expiresAt },
  });

  revalidatePath(`/student/exams/online/${template.id}`);
  return { success: true, attemptId };
}

/**
 * Autosaves student's selected answer and review flag.
 * Strictly verifies student identity, active status, and server timer before accepting. (MODULE 8 & 9)
 */
export async function studentAutosaveExamAnswerAction(data: {
  attemptId: string;
  attemptQuestionId: string;
  selectedOption: OptionLabel | null;
  isMarkedForReview: boolean;
  timeSpentSeconds: number;
}) {
  const { user } = await requireAuth();
  const { attemptId, attemptQuestionId, selectedOption, isMarkedForReview, timeSpentSeconds } = data;

  const adminDb = createAdminClient();

  // 1. Fetch attempt and verify ownership & validity
  const { data: attempt } = await adminDb
    .from("exam_attempts")
    .select("student_id, status, expires_at")
    .eq("id", attemptId)
    .single();

  if (!attempt || attempt.student_id !== user.id) {
    return { error: "Unauthorized attempt access." };
  }

  if (attempt.status !== "In Progress") {
    return { error: "This examination attempt has already been finalized." };
  }

  // 2. Server-Authoritative Timer Boundary Check (MODULE 8)
  const now = new Date();
  const expiresAt = new Date(attempt.expires_at);

  if (now > expiresAt) {
    // Time expired! Auto-submit immediately and reject modification
    await internalEvaluateAndFinalizeAttempt(attemptId, "Auto Submitted");
    return {
      expired: true,
      error: "Time has expired. Examination has been automatically submitted.",
    };
  }

  // 3. Idempotently Upsert Answer
  const { error: upsertErr } = await adminDb.from("exam_attempt_answers").upsert(
    {
      attempt_id: attemptId,
      attempt_question_id: attemptQuestionId,
      selected_option: selectedOption,
      is_marked_for_review: isMarkedForReview,
      is_visited: true,
      time_spent_seconds: timeSpentSeconds || 0,
      saved_at: now.toISOString(),
    },
    { onConflict: "attempt_id,attempt_question_id" }
  );

  if (upsertErr) {
    return { error: upsertErr.message };
  }

  return { success: true, savedAt: now.toISOString() };
}

/**
 * Submits an active examination attempt and triggers server evaluation. (MODULE 12)
 */
export async function studentSubmitExamAttemptAction(attemptId: string) {
  const { user } = await requireAuth();
  const adminDb = createAdminClient();

  const { data: attempt } = await adminDb
    .from("exam_attempts")
    .select("student_id, status, template_id, template:exam_templates(*)")
    .eq("id", attemptId)
    .single();

  if (!attempt || attempt.student_id !== user.id) {
    return { error: "Unauthorized attempt access." };
  }

  if (attempt.status !== "In Progress") {
    return { success: true, attemptId, message: "Attempt already submitted." };
  }

  const result = await internalEvaluateAndFinalizeAttempt(attemptId, "Submitted");
  if (!result.success) {
    return { error: result.error || "Failed to finalize evaluation." };
  }

  revalidatePath("/student/exams/online/history");
  revalidatePath(`/student/exams/online/${attempt.template_id}`);

  return {
    success: true,
    attemptId,
    score: result.score,
    maxMarks: result.maxMarks,
    percentage: result.percentage,
    isImmediateRelease: (attempt.template as any)?.result_release_policy === "Immediate",
  };
}

// ===========================================================================
// INTERNAL SECURE EVALUATION ENGINE (MODULE 12)
// Runs strictly server-side with service-role access to protected answer keys.
// ===========================================================================

async function internalEvaluateAndFinalizeAttempt(
  attemptId: string,
  submissionType: "Submitted" | "Auto Submitted" = "Submitted"
) {
  const adminDb = createAdminClient();

  try {
    // 1. Fetch Attempt & Template
    const { data: attempt } = await adminDb
      .from("exam_attempts")
      .select("*, template:exam_templates(*)")
      .eq("id", attemptId)
      .single();

    if (!attempt) return { success: false, error: "Attempt not found." };
    const template = attempt.template as ExamTemplate;

    // 2. Fetch Snapshot Questions, Answers, and Answer Keys
    const [qRes, ansRes, keyRes] = await Promise.all([
      adminDb.from("exam_attempt_questions").select("*").eq("attempt_id", attemptId),
      adminDb.from("exam_attempt_answers").select("*").eq("attempt_id", attemptId),
      adminDb.from("exam_attempt_answer_keys").select("*").eq("attempt_id", attemptId),
    ]);

    const questions = qRes.data || [];
    const answers = ansRes.data || [];
    const keys = keyRes.data || [];

    const ansMap = new Map(answers.map((a: any) => [a.attempt_question_id, a]));
    const keyMap = new Map(keys.map((k: any) => [k.attempt_question_id, k]));

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    let positiveMarks = 0;
    let negativeMarks = 0;
    let totalTimeSpent = 0;

    // Section-wise breakdown tracking
    const sectionMap = new Map<string, SectionScoreSummary>();

    questions.forEach((q: any) => {
      const studentAns = ansMap.get(q.id);
      const answerKey = keyMap.get(q.id);
      const qMarks = Number(q.marks || template.correct_marks || 1.0);
      const qNeg = Number(q.negative_marks || template.negative_marks || 0.25);

      const secName = q.section_name || "General Section";
      if (!sectionMap.has(secName)) {
        sectionMap.set(secName, {
          section_id: q.section_id || null,
          section_name: secName,
          total_questions: 0,
          attempted: 0,
          correct: 0,
          incorrect: 0,
          score: 0,
          max_marks: 0,
        });
      }

      const secStats = sectionMap.get(secName)!;
      secStats.total_questions++;
      secStats.max_marks += qMarks;

      if (!studentAns || !studentAns.selected_option) {
        unansweredCount++;
      } else {
        secStats.attempted++;
        totalTimeSpent += studentAns.time_spent_seconds || 0;

        if (studentAns.selected_option === answerKey?.correct_option) {
          correctCount++;
          positiveMarks += qMarks;
          secStats.correct++;
          secStats.score += qMarks;
        } else {
          incorrectCount++;
          negativeMarks += qNeg;
          secStats.incorrect++;
          secStats.score -= qNeg;
        }
      }
    });

    const totalScore = Math.max(-50, Number((positiveMarks - negativeMarks).toFixed(2)));
    const maxMarks = Number(template.total_marks || (questions.length * Number(template.correct_marks)));
    const percentage = maxMarks > 0 ? Math.max(0, Math.min(100, Number(((totalScore / maxMarks) * 100).toFixed(2)))) : 0;
    const attemptedCount = correctCount + incorrectCount;
    const accuracyPercent = attemptedCount > 0 ? Number(((correctCount / attemptedCount) * 100).toFixed(2)) : 0;

    const sectionScores = Array.from(sectionMap.values());
    const now = new Date().toISOString();

    // 3. Update Attempt Record
    await adminDb
      .from("exam_attempts")
      .update({
        status: submissionType,
        submitted_at: now,
        score: totalScore,
        max_marks: maxMarks,
        percentage,
        correct_count: correctCount,
        incorrect_count: incorrectCount,
        unanswered_count: unansweredCount,
        time_taken_seconds: totalTimeSpent,
        updated_at: now,
      })
      .eq("id", attemptId);

    // 4. Upsert Finalized Exam Results Record
    await adminDb.from("exam_results").upsert(
      {
        attempt_id: attemptId,
        student_id: attempt.student_id,
        template_id: attempt.template_id,
        total_score: totalScore,
        max_marks: maxMarks,
        positive_marks: positiveMarks,
        negative_marks: negativeMarks,
        percentage,
        accuracy_percent: accuracyPercent,
        total_questions: questions.length,
        attempted_count: attemptedCount,
        correct_count: correctCount,
        incorrect_count: incorrectCount,
        unanswered_count: unansweredCount,
        time_taken_seconds: totalTimeSpent,
        section_scores_json: sectionScores,
        evaluated_at: now,
      },
      { onConflict: "attempt_id" }
    );

    // Log Audit Event
    await adminDb.from("exam_audit_events").insert({
      template_id: attempt.template_id,
      attempt_id: attemptId,
      user_id: attempt.student_id,
      event_type: submissionType === "Auto Submitted" ? "ATTEMPT_EXPIRED_AUTOSUBMIT" : "ATTEMPT_SUBMITTED",
      details_json: { totalScore, maxMarks, percentage, correctCount, incorrectCount },
    });

    return {
      success: true,
      score: totalScore,
      maxMarks,
      percentage,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
