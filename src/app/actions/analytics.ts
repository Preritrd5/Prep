"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOwner } from "@/lib/auth";
import { getGeminiClient, DEFAULT_GEMINI_MODEL } from "@/lib/ai/gemini";
import type {
  RevisionConfidenceRating,
  RecommendationStatus,
  StudentNotificationPreferences,
  AdminAuditAction,
  AdminAuditEntity,
} from "@/lib/types";
import { getStudentPerformanceAnalytics, getWeakTopics } from "@/lib/data/analytics";
import { markStoredNotificationRead, deleteStoredNotification } from "@/lib/data/local-store";

// ============================================================================
// MODULE 5: REVISION ACTIONS (SPACED REPETITION ENGINE)
// ============================================================================

export async function studentUpdateRevisionAction(formData: FormData) {
  const { user } = await requireOwner();
  const supabase = await createClient();

  const revisionId = formData.get("revisionId") as string;
  const confidenceRating = formData.get("confidenceRating") as RevisionConfidenceRating;
  const notes = formData.get("notes") as string | null;

  if (!revisionId || !confidenceRating) {
    return { error: "Missing required revision parameters." };
  }

  // Fetch current revision to calculate next spaced interval
  const { data: currentRev } = await supabase
    .from("revision_schedules")
    .select("topic_id, revision_number, interval_days")
    .eq("id", revisionId)
    .eq("student_id", user.id)
    .single();

  if (!currentRev) {
    return { error: "Revision record not found or unauthorized." };
  }

  const todayStr = new Date().toISOString().split("T")[0];
  let nextIntervalDays = 3;
  let shouldCreateNext = true;

  // Spaced Repetition adaptive adjustment based on student feedback
  if (confidenceRating === "Understood") {
    // Increase interval: 1d -> 3d -> 7d -> 14d -> 30d
    const prevInterval = currentRev.interval_days || 1;
    if (prevInterval <= 1) nextIntervalDays = 3;
    else if (prevInterval <= 3) nextIntervalDays = 7;
    else if (prevInterval <= 7) nextIntervalDays = 14;
    else if (prevInterval <= 14) nextIntervalDays = 30;
    else {
      nextIntervalDays = 60;
      shouldCreateNext = false; // Mastered
    }
  } else if (confidenceRating === "Needs more practice") {
    // Keep short interval: 2 days
    nextIntervalDays = 2;
  } else if (confidenceRating === "Not understood") {
    // Immediate review: 1 day
    nextIntervalDays = 1;
  } else {
    shouldCreateNext = false;
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + nextIntervalDays);
  const nextDateStr = nextDate.toISOString().split("T")[0];

  // 1. Mark current revision completed
  const { error: updateError } = await supabase
    .from("revision_schedules")
    .update({
      is_completed: true,
      completed_date: todayStr,
      confidence_rating: confidenceRating,
      notes: notes || null,
      next_revision_date: shouldCreateNext ? nextDateStr : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", revisionId)
    .eq("student_id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  // 2. Schedule next revision cycle if not mastered
  if (shouldCreateNext) {
    await supabase.from("revision_schedules").insert({
      student_id: user.id,
      topic_id: currentRev.topic_id,
      revision_number: (currentRev.revision_number || 1) + 1,
      scheduled_date: nextDateStr,
      interval_days: nextIntervalDays,
      is_completed: false,
    });
  }

  revalidatePath("/revisions");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function studentScheduleRevisionAction(formData: FormData) {
  const { user } = await requireOwner();
  const supabase = await createClient();

  const topicId = formData.get("topicId") as string;
  const scheduledDate = formData.get("scheduledDate") as string;
  const notes = formData.get("notes") as string | null;

  if (!topicId || !scheduledDate) {
    return { error: "Topic and scheduled date are required." };
  }

  const { error } = await supabase.from("revision_schedules").insert({
    student_id: user.id,
    topic_id: topicId,
    scheduled_date: scheduledDate,
    notes: notes || null,
    revision_number: 1,
    interval_days: 1,
    is_completed: false,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/revisions");
  return { success: true };
}

// ============================================================================
// MODULE 4 & 6: WEAK AREA DISMISSAL & RECOMMENDATIONS
// ============================================================================

export async function studentDismissWeakAreaAction(formData: FormData) {
  const { user } = await requireOwner();
  const supabase = await createClient();

  const topicId = formData.get("topicId") as string;
  const notes = formData.get("notes") as string | null;

  if (!topicId) return { error: "Topic ID required." };

  const { error } = await supabase.from("student_weak_area_dismissals").upsert(
    {
      student_id: user.id,
      topic_id: topicId,
      notes: notes || "Marked as addressed by student",
      created_at: new Date().toISOString(),
    },
    { onConflict: "student_id,topic_id" }
  );

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/practice/topic");
  return { success: true };
}

export async function studentUpdateRecommendationStatusAction(
  recommendationId: string,
  status: RecommendationStatus
) {
  const { user } = await requireOwner();
  const supabase = await createClient();

  // If synthetic recommendation, insert into db as dismissed/accepted
  if (recommendationId.startsWith("gen-")) {
    await supabase.from("student_study_recommendations").insert({
      student_id: user.id,
      title: "Archived Suggestion",
      reason: "Handled by student",
      recommendation_type: "Revise Topic",
      status,
    });
  } else {
    await supabase
      .from("student_study_recommendations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", recommendationId)
      .eq("student_id", user.id);
  }

  revalidatePath("/dashboard");
  return { success: true };
}

// ============================================================================
// MODULE 8: NOTIFICATION ACTIONS
// ============================================================================

export async function studentMarkNotificationReadAction(notificationId?: string) {
  const { user } = await requireOwner();

  try {
    const supabase = await createClient();
    if (notificationId) {
      await supabase
        .from("student_notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("student_id", user.id);
    } else {
      await supabase
        .from("student_notifications")
        .update({ is_read: true })
        .eq("student_id", user.id)
        .eq("is_read", false);
    }
  } catch (err: any) {
    console.warn("[Analytics] Database notification mark read exception:", err?.message);
  }

  await markStoredNotificationRead(user.id, notificationId);

  revalidatePath("/notifications");
  return { success: true };
}

export async function studentDeleteNotificationAction(notificationId: string) {
  const { user } = await requireOwner();

  try {
    const supabase = await createClient();
    await supabase
      .from("student_notifications")
      .delete()
      .eq("id", notificationId)
      .eq("student_id", user.id);
  } catch (err: any) {
    console.warn("[Analytics] Database notification delete exception:", err?.message);
  }

  await deleteStoredNotification(user.id, notificationId);

  revalidatePath("/notifications");
  return { success: true };
}

export async function studentUpdateNotificationPreferencesAction(
  formData: FormData
) {
  const { user } = await requireOwner();
  const supabase = await createClient();

  const prefs: Partial<StudentNotificationPreferences> = {
    student_id: user.id,
    upcoming_tasks: formData.get("upcoming_tasks") === "on",
    incomplete_tasks: formData.get("incomplete_tasks") === "on",
    revisions_due: formData.get("revisions_due") === "on",
    upcoming_exams: formData.get("upcoming_exams") === "on",
    new_published_exams: formData.get("new_published_exams") === "on",
    mock_results_ready: formData.get("mock_results_ready") === "on",
    study_recommendations: formData.get("study_recommendations") === "on",
    admin_announcements: formData.get("admin_announcements") === "on",
    browser_notifications_enabled: formData.get("browser_notifications_enabled") === "on",
    quiet_hours_enabled: formData.get("quiet_hours_enabled") === "on",
    quiet_hours_start: (formData.get("quiet_hours_start") as string) || "22:00",
    quiet_hours_end: (formData.get("quiet_hours_end") as string) || "07:00",
    timezone: (formData.get("timezone") as string) || "Asia/Kolkata",
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("student_notification_preferences")
    .upsert(prefs, { onConflict: "student_id" });

  if (error) return { error: error.message };

  revalidatePath("/profile");
  return { success: true };
}

// ============================================================================
// MODULE 11: GEMINI AI STUDY ASSISTANT (SERVER-SIDE)
// ============================================================================

export interface AssistantTopicContext {
  examName?: string;
  subjectName?: string;
  topicName?: string;
}

export interface AssistantHistoryMessage {
  role: "user" | "assistant";
  text: string;
}

export async function studentGeminiAssistantAction(
  userQuery: string,
  category: "REVISION_PLAN" | "WEAK_AREA_EXPLANATION" | "PRACTICE_ADVICE" | "PROGRESS_SUMMARY" | "GENERAL_ASSIST" = "GENERAL_ASSIST",
  topicContext?: AssistantTopicContext,
  history?: AssistantHistoryMessage[]
) {
  const { user, profile } = await requireOwner();
  const supabase = await createClient();

  if (!userQuery || userQuery.trim().length === 0) {
    return { error: "Please enter your question or request for the Study Assistant." };
  }

  // 1. Gather strictly authenticated student context
  const [analytics, weakTopics] = await Promise.all([
    getStudentPerformanceAnalytics(user.id),
    getWeakTopics(user.id),
  ]);

  const studentContext = `
STUDENT PREPARATION CONTEXT:
- Student Name: ${profile.full_name || "PrepTrack Aspirant"}
- Target Examinations Selected: ${analytics.totalExaminationsSelected}
- Syllabus Completion: ${analytics.syllabusCompletionPercentage}% (${analytics.completedTopics} of ${analytics.totalSyllabusTopics} topics)
- Total Study Hours Logged: ${analytics.totalStudyHours} hours
- MCQ Practice Questions Attempted: ${analytics.mcqsAttempted} (Overall Accuracy: ${analytics.overallAccuracy}%)
- Mock Examinations Completed: ${analytics.totalMockExaminationsAttempted} (Best Score: ${analytics.bestMockScore}, Average Score: ${analytics.averageMockScore})
- Identified Weak Topics Needing Attention: ${weakTopics.length > 0 ? weakTopics.map((w) => `${w.topicTitle} (${w.subjectName}: ${w.reason})`).join("; ") : "None currently flagged"}
`;

  const topicContextStr = topicContext?.topicName || topicContext?.subjectName
    ? `\nACTIVE TOPIC FOCUS:\n- Target Examination: ${topicContext.examName || "All Examinations"}\n- Subject: ${topicContext.subjectName || "All Subjects"}\n- Topic: ${topicContext.topicName || "General"}\n`
    : "";

  const systemInstruction = `
You are the PrepTrack AI Study Assistant for competitive examination aspirants (GATE, UPSC, KAS, Railway, KEA, AE Civil).
Your role:
1. Provide practical, empathetic, and actionable guidance based on the student's actual preparation metrics.
2. If the student asks for a study or revision plan, structure it with realistic time blocks and spaced repetition.
3. If they ask about weak topics, explain the underlying concept clearly and give them practical strategies.
4. Clearly distinguish AI-generated guidance from verified official examination dates or notices. Never fabricate official exam notifications.
5. Keep explanations structured with markdown bullet points and clear takeaways.
`;

  let responseText = "";
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = getGeminiClient();
      const initialPrompt = `${systemInstruction}\n\n${studentContext}${topicContextStr}`;
      const contents: any[] = [];

      if (history && history.length > 0) {
        contents.push({
          role: "user",
          parts: [{ text: `${initialPrompt}\n\nStudent Request: ${history[0].text}` }],
        });

        for (let i = 1; i < history.length; i++) {
          const h = history[i];
          contents.push({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.text }],
          });
        }

        contents.push({
          role: "user",
          parts: [{ text: userQuery }],
        });
      } else {
        contents.push({
          role: "user",
          parts: [{ text: `${initialPrompt}\n\nStudent Request: ${userQuery}` }],
        });
      }

      const response = await ai.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents,
      });
      responseText = response.text || "I was unable to generate a detailed response. Please review your dashboard metrics.";
    } catch (err: any) {
      console.warn("Gemini API call failed, falling back to rule-based assistance:", err?.message);
      responseText = getFallbackAssistantResponse(userQuery, category, analytics, weakTopics);
    }
  } else {
    // Non-AI deterministic fallback
    responseText = getFallbackAssistantResponse(userQuery, category, analytics, weakTopics);
  }

  // Record interaction
  await supabase.from("student_ai_interactions").insert({
    student_id: user.id,
    category,
    prompt_summary: userQuery.slice(0, 150),
    response_text: responseText,
  });

  return { success: true, response: responseText };
}

function getFallbackAssistantResponse(
  query: string,
  category: string,
  analytics: any,
  weakTopics: any[]
): string {
  if (category === "REVISION_PLAN" || query.toLowerCase().includes("plan") || query.toLowerCase().includes("schedule")) {
    return `### Suggested Spaced-Repetition Revision Plan

Based on your current preparation metrics (${analytics.syllabusCompletionPercentage}% syllabus completed, ${analytics.totalStudyHours} hours logged):

1. **Daily Foundation (60-90 mins):**
   - Focus on 1 new syllabus topic from your pending list (${analytics.pendingTopics} topics remaining).
   - Solve 15-20 MCQs immediately after reading the topic.

2. **Spaced Review Blocks (45 mins):**
   ${weakTopics.length > 0 ? `- **Priority Review:** Revise **${weakTopics[0].topicTitle}** (${weakTopics[0].reason}).` : "- Review notes from topics completed 3 days ago."}
   - Solve 10 questions from your Mistake Notebook to reinforce weak concepts.

3. **Weekly Mock Test Benchmark (Weekend):**
   - Take 1 sectional or full-length test on PrepTrack under timed conditions.
   - Review your detailed analytics scorecard and positive/negative mark breakdown.

*Note: This is an automated PrepTrack preparation suggestion based on your study metrics.*`;
  }

  if (weakTopics.length > 0) {
    const topWeak = weakTopics[0];
    return `### Focus Strategy for ${topWeak.topicTitle}

Your current accuracy in **${topWeak.topicTitle}** is below target (${topWeak.accuracyPercentage}%).

**Recommended Action Steps:**
1. **Concept Review:** Re-read the core principles in ${topWeak.subjectName} before jumping into questions.
2. **Untimed Practice:** Practice 15 MCQs in Topic Practice mode with explanations enabled.
3. **Analyze Common Pitfalls:** Check whether errors are conceptual or due to misreading negative keywords.
4. **Schedule a Re-test:** After 48 hours, attempt 10 fresh questions in timed exam mode.`;
  }

  return `### Preparation Overview

You have completed **${analytics.completedTopics}** syllabus topics with an overall MCQ practice accuracy of **${analytics.overallAccuracy}%** across **${analytics.mcqsAttempted}** attempts.

**Next Key Milestones:**
- Continue daily syllabus targets in your active examinations.
- Maintain consistent spaced repetitions in the Revision Manager.
- Take a scheduled mock test to verify your time management per question.`;
}

// ============================================================================
// MODULE 15: ADMIN AUDIT LOG ACTION
// ============================================================================

export async function adminLogAuditAction(
  actionType: AdminAuditAction,
  targetEntity: AdminAuditEntity,
  targetId?: string,
  metadata?: Record<string, any>
) {
  const { user } = await requireOwner();
  const adminClient = createAdminClient();

  await adminClient.from("admin_audit_logs").insert({
    admin_id: user.id,
    action_type: actionType,
    target_entity: targetEntity,
    target_id: targetId || null,
    metadata: metadata || null,
  });
}
