import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ExamTemplate,
  ExamSection,
  ExamAttempt,
  ExamAttemptQuestion,
  ExamAttemptAnswer,
  ExamResult,
  ExamAuditEvent,
  ExamCategory,
  OnlineExamType,
  ExamTemplateStatus,
} from "@/lib/types";
import { FALLBACK_QUESTIONS, allowDemoFallback } from "./questions";

// ===========================================================================
// FALLBACK SEED EXAM TEMPLATES (Used if remote PostgreSQL is awaiting migration)
// ===========================================================================

export const FALLBACK_EXAM_TEMPLATES: ExamTemplate[] = [
  {
    id: "et100000-0000-0000-0000-000000000001",
    title: "UPSC Civil Services Prelims — General Studies Mock Paper 1",
    description: "Full-length 100-mark diagnostic mock test modeled on the official UPSC Civil Services Preliminary examination syllabus.",
    exam_category: "UPSC",
    exam_id: "e1000000-0000-0000-0000-000000000004",
    exam_type: "Full-Length Mock Test",
    instructions: "1. Test duration is 60 minutes.\n2. Each question carries 2.0 marks.\n3. Negative marking of 0.66 marks (-33.3%) applies for each incorrect response.\n4. You may mark questions for review and return to them anytime before time expires.\n5. When timer reaches zero, your test will auto-submit automatically.",
    duration_minutes: 60,
    total_questions: 5,
    total_marks: 10.00,
    passing_marks: 4.00,
    max_attempts: 3,
    start_date: null,
    end_date: null,
    randomize_questions: true,
    randomize_options: false,
    has_negative_marking: true,
    correct_marks: 2.00,
    negative_marks: 0.66,
    unattempted_marks: 0.00,
    result_release_policy: "Immediate",
    results_published: true,
    status: "Published",
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    sections: [
      {
        id: "es1",
        template_id: "et100000-0000-0000-0000-000000000001",
        name: "History & National Movement",
        subject_id: "s1000000-0000-0000-0000-000000000002",
        question_count: 2,
        total_marks: 4.00,
        time_limit_minutes: null,
        order_index: 1,
        correct_marks: 2.00,
        negative_marks: 0.66,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "es2",
        template_id: "et100000-0000-0000-0000-000000000001",
        name: "Indian Polity & Governance",
        subject_id: "s1000000-0000-0000-0000-000000000005",
        question_count: 3,
        total_marks: 6.00,
        time_limit_minutes: null,
        order_index: 2,
        correct_marks: 2.00,
        negative_marks: 0.66,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ],
  },
  {
    id: "et100000-0000-0000-0000-000000000002",
    title: "KAS Gazetted Probationers — Preliminary GS Mock Exam",
    description: "State administrative services preparatory examination covering Indian history, Karnataka heritage, polity, and economy.",
    exam_category: "KAS",
    exam_id: "e1000000-0000-0000-0000-000000000003",
    exam_type: "Full-Length Mock Test",
    instructions: "1. Test duration is 60 minutes.\n2. Each correct answer awards 2.0 marks.\n3. Incorrect answers incur a penalty of 0.50 marks (-25%).\n4. Unattempted questions carry zero penalty.\n5. Click Submit Examination when completed.",
    duration_minutes: 60,
    total_questions: 5,
    total_marks: 10.00,
    passing_marks: 4.00,
    max_attempts: 2,
    start_date: null,
    end_date: null,
    randomize_questions: true,
    randomize_options: false,
    has_negative_marking: true,
    correct_marks: 2.00,
    negative_marks: 0.50,
    unattempted_marks: 0.00,
    result_release_policy: "Immediate",
    results_published: true,
    status: "Published",
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "et100000-0000-0000-0000-000000000003",
    title: "GATE Civil Engineering — Sectional Technical Mock Test",
    description: "Comprehensive technical test covering Structural Engineering and Geotechnical Engineering concepts for GATE aspirants.",
    exam_category: "GATE",
    exam_id: "e1000000-0000-0000-0000-000000000001",
    exam_type: "Sectional Test",
    instructions: "1. Duration is 45 minutes.\n2. Questions carry 1 or 2 marks as marked.\n3. Negative marking of 1/3 applies for MCQs.\n4. Virtual scientific calculators are permitted in real GATE.",
    duration_minutes: 45,
    total_questions: 5,
    total_marks: 10.00,
    passing_marks: 3.50,
    max_attempts: 5,
    start_date: null,
    end_date: null,
    randomize_questions: true,
    randomize_options: false,
    has_negative_marking: true,
    correct_marks: 2.00,
    negative_marks: 0.66,
    unattempted_marks: 0.00,
    result_release_policy: "Immediate",
    results_published: true,
    status: "Published",
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "et100000-0000-0000-0000-000000000004",
    title: "Railway RRB NTPC — General Awareness & Aptitude Mock",
    description: "Standard CBT-1 pattern mock examination for Railway Recruitment Board Non-Technical Popular Categories.",
    exam_category: "Railway Examinations",
    exam_id: "e1000000-0000-0000-0000-000000000005",
    exam_type: "Full-Length Mock Test",
    instructions: "1. 60 minutes total time.\n2. 1 mark per question.\n3. 1/3 negative marking for wrong options.",
    duration_minutes: 60,
    total_questions: 5,
    total_marks: 5.00,
    passing_marks: 2.00,
    max_attempts: 3,
    start_date: null,
    end_date: null,
    randomize_questions: true,
    randomize_options: false,
    has_negative_marking: true,
    correct_marks: 1.00,
    negative_marks: 0.33,
    unattempted_marks: 0.00,
    result_release_policy: "Immediate",
    results_published: true,
    status: "Published",
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "et100000-0000-0000-0000-000000000005",
    title: "KEA Land Surveyor / VAO — Revenue Administration Paper",
    description: "State examination recruitment test for Land Surveyor and Village Administrative Officer positions under KEA.",
    exam_category: "KEA Examinations",
    exam_id: "e1000000-0000-0000-0000-000000000006",
    exam_type: "Subject Test",
    instructions: "1. Time allowed: 45 minutes.\n2. Karnataka Land Revenue Act and General Studies.\n3. 1 mark per question, 0.25 negative marking.",
    duration_minutes: 45,
    total_questions: 5,
    total_marks: 5.00,
    passing_marks: 2.00,
    max_attempts: 2,
    start_date: null,
    end_date: null,
    randomize_questions: true,
    randomize_options: false,
    has_negative_marking: true,
    correct_marks: 1.00,
    negative_marks: 0.25,
    unattempted_marks: 0.00,
    result_release_policy: "Immediate",
    results_published: true,
    status: "Published",
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "et100000-0000-0000-0000-000000000006",
    title: "Assistant Engineer (AE) Civil — Structural & Geo Mock Test",
    description: "Specialized technical mock test designed for PWD and Irrigation Department Assistant Engineer examinations.",
    exam_category: "AE Civil Engineering",
    exam_id: "e1000000-0000-0000-0000-000000000008",
    exam_type: "Subject Test",
    instructions: "1. Technical Civil Engineering examination.\n2. 2 marks per question with 0.50 negative marking.\n3. Auto-evaluates upon submission.",
    duration_minutes: 45,
    total_questions: 5,
    total_marks: 10.00,
    passing_marks: 4.00,
    max_attempts: 3,
    start_date: null,
    end_date: null,
    randomize_questions: true,
    randomize_options: false,
    has_negative_marking: true,
    correct_marks: 2.00,
    negative_marks: 0.50,
    unattempted_marks: 0.00,
    result_release_policy: "Immediate",
    results_published: true,
    status: "Published",
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

// ===========================================================================
// QUERY FUNCTIONS
// ===========================================================================

export async function getExamTemplates(filters?: {
  category?: string;
  type?: string;
  status?: string;
  search?: string;
}): Promise<ExamTemplate[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("exam_templates")
      .select("*, exam:exams(*), sections:exam_sections(*)")
      .order("created_at", { ascending: false });

    if (filters?.category && filters.category !== "All") {
      query = query.eq("exam_category", filters.category);
    }
    if (filters?.type && filters.type !== "All") {
      query = query.eq("exam_type", filters.type);
    }
    if (filters?.status && filters.status !== "All") {
      query = query.eq("status", filters.status);
    }
    if (filters?.search) {
      query = query.ilike("title", `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      if (!allowDemoFallback()) {
        if (error) console.error(`[PRODUCTION INTEGRITY GUARD] Failed to query exam templates: ${error.message}`);
        return [];
      }
      // Fallback
      let res = FALLBACK_EXAM_TEMPLATES;
      if (filters?.category && filters.category !== "All") {
        res = res.filter((t) => t.exam_category === filters.category);
      }
      if (filters?.type && filters.type !== "All") {
        res = res.filter((t) => t.exam_type === filters.type);
      }
      if (filters?.status && filters.status !== "All") {
        res = res.filter((t) => t.status === filters.status);
      }
      if (filters?.search) {
        res = res.filter((t) => t.title.toLowerCase().includes(filters.search!.toLowerCase()));
      }
      return res;
    }

    return data as ExamTemplate[];
  } catch {
    if (!allowDemoFallback()) return [];
    return FALLBACK_EXAM_TEMPLATES;
  }
}

export async function getExamTemplateById(id: string): Promise<ExamTemplate | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("exam_templates")
      .select("*, exam:exams(*), sections:exam_sections(*), mappings:exam_question_mappings(*, question:questions(*)), blueprints:exam_question_blueprints(*)")
      .eq("id", id)
      .single();

    if (error || !data) {
      if (!allowDemoFallback()) return null;
      const fb = FALLBACK_EXAM_TEMPLATES.find((t) => t.id === id);
      return fb || null;
    }
    return data as ExamTemplate;
  } catch {
    if (!allowDemoFallback()) return null;
    const fb = FALLBACK_EXAM_TEMPLATES.find((t) => t.id === id);
    return fb || null;
  }
}

export async function getStudentAvailableExams(studentId: string): Promise<{
  availableExams: ExamTemplate[];
  studentAttempts: ExamAttempt[];
}> {
  try {
    const supabase = await createClient();

    // 1. Fetch published templates
    const { data: templates } = await supabase
      .from("exam_templates")
      .select("*, exam:exams(*), sections:exam_sections(*)")
      .eq("status", "Published")
      .order("created_at", { ascending: false });

    // 2. Fetch student's past attempts
    const { data: attempts } = await supabase
      .from("exam_attempts")
      .select("*")
      .eq("student_id", studentId)
      .order("started_at", { ascending: false });

    const activeTemplates = (templates && templates.length > 0) ? (templates as ExamTemplate[]) : FALLBACK_EXAM_TEMPLATES;

    return {
      availableExams: activeTemplates,
      studentAttempts: (attempts as ExamAttempt[]) || [],
    };
  } catch {
    return {
      availableExams: FALLBACK_EXAM_TEMPLATES,
      studentAttempts: [],
    };
  }
}

export async function getStudentAttemptById(
  attemptId: string,
  studentId?: string
): Promise<{
  attempt: ExamAttempt | null;
  questions: ExamAttemptQuestion[];
  answers: ExamAttemptAnswer[];
}> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("exam_attempts")
      .select("*, template:exam_templates(*)")
      .eq("id", attemptId);

    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    const { data: attemptData, error: aErr } = await query.single();
    if (!aErr && attemptData) {
      // Fetch snapshot questions
      const { data: qData } = await supabase
        .from("exam_attempt_questions")
        .select("*")
        .eq("attempt_id", attemptId)
        .order("order_index", { ascending: true });

      // Fetch student's current saved answers
      const { data: ansData } = await supabase
        .from("exam_attempt_answers")
        .select("*")
        .eq("attempt_id", attemptId);

      return {
        attempt: attemptData as ExamAttempt,
        questions: (qData || []) as ExamAttemptQuestion[],
        answers: (ansData || []) as ExamAttemptAnswer[],
      };
    }
  } catch {}

  return { attempt: null, questions: [], answers: [] };
}

export async function getStudentExamAttempts(studentId: string): Promise<ExamAttempt[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("exam_attempts")
      .select("*, template:exam_templates(*)")
      .eq("student_id", studentId)
      .order("started_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as ExamAttempt[];
    }
  } catch {}

  return [];
}

export async function getExamResult(
  attemptId: string,
  studentId?: string
): Promise<{
  result: ExamResult | null;
  attempt: ExamAttempt | null;
  template: ExamTemplate | null;
  questionsReview: {
    questionText: string;
    options: { label: string; text: string }[];
    studentOption: string | null;
    correctOption: string;
    isCorrect: boolean;
    marksEarned: number;
    explanation: string | null;
    timeSpent: number;
    sectionName: string;
  }[];
}> {
  try {
    const adminDb = createAdminClient();

    // 1. Fetch Result Record
    let resQuery = adminDb
      .from("exam_results")
      .select("*")
      .eq("attempt_id", attemptId);

    if (studentId) {
      resQuery = resQuery.eq("student_id", studentId);
    }

    const { data: rawResultData } = await resQuery.single();

    // 2. Fetch Attempt & Template
    const { data: rawAttemptData } = await adminDb
      .from("exam_attempts")
      .select("*, template:exam_templates(*)")
      .eq("id", attemptId)
      .single();

    let attemptData = rawAttemptData;
    let resultData = rawResultData;

    if (!attemptData) {
      return { result: null, attempt: null, template: null, questionsReview: [] };
    }

    const template = attemptData.template as ExamTemplate;

    // Check Result Release Policy:
    // If Delayed / Admin Controlled and not yet released, don't disclose answers unless admin!
    const isReleased =
      template.result_release_policy === "Immediate" ||
      template.results_published === true ||
      attemptData.result_release_status === "Results Released";

    // 3. Fetch Questions, Answers & Keys
    const { data: questions } = await adminDb
      .from("exam_attempt_questions")
      .select("*")
      .eq("attempt_id", attemptId)
      .order("order_index", { ascending: true });

    const { data: answers } = await adminDb
      .from("exam_attempt_answers")
      .select("*")
      .eq("attempt_id", attemptId);

    const { data: keys } = await adminDb
      .from("exam_attempt_answer_keys")
      .select("*")
      .eq("attempt_id", attemptId);

    const ansMap = new Map((answers || []).map((a: any) => [a.attempt_question_id, a]));
    const keyMap = new Map((keys || []).map((k: any) => [k.attempt_question_id, k]));

    const reviews = (questions || []).map((q: any) => {
      const studentAns = ansMap.get(q.id);
      const answerKey = keyMap.get(q.id);
      const isCorrect = studentAns?.selected_option && studentAns.selected_option === answerKey?.correct_option;

      let marksEarned = 0;
      if (isCorrect) {
        marksEarned = Number(q.marks || template.correct_marks);
      } else if (studentAns?.selected_option) {
        marksEarned = -Number(q.negative_marks || template.negative_marks);
      }

      return {
        questionText: q.question_text,
        options: (q.options_json || []).map((opt: any) => ({
          label: opt.option_label,
          text: opt.option_text,
        })),
        studentOption: studentAns?.selected_option || null,
        correctOption: isReleased ? (answerKey?.correct_option || "A") : "Hidden until release",
        isCorrect: isCorrect || false,
        marksEarned,
        explanation: isReleased ? (answerKey?.explanation || null) : null,
        timeSpent: studentAns?.time_spent_seconds || 0,
        sectionName: q.section_name || "General Section",
      };
    });

    return {
      result: (resultData as ExamResult) || null,
      attempt: attemptData as ExamAttempt,
      template,
      questionsReview: reviews,
    };
  } catch {
    return { result: null, attempt: null, template: null, questionsReview: [] };
  }
}

export async function getAdminExamMonitoringData(): Promise<{
  totalExams: number;
  publishedExams: number;
  ongoingAttempts: number;
  completedAttempts: number;
  awaitingPublication: number;
  recentAttempts: ExamAttempt[];
  recentAudits: ExamAuditEvent[];
}> {
  try {
    const adminDb = createAdminClient();

    const [templatesRes, attemptsRes, auditsRes] = await Promise.all([
      adminDb.from("exam_templates").select("id, status, result_release_policy, results_published"),
      adminDb.from("exam_attempts").select("*, template:exam_templates(*), student:profiles(*)").order("started_at", { ascending: false }).limit(20),
      adminDb.from("exam_audit_events").select("*").order("created_at", { ascending: false }).limit(10),
    ]);

    const templates = templatesRes.data || [];
    const attempts = (attemptsRes.data || []) as ExamAttempt[];
    const audits = (auditsRes.data || []) as ExamAuditEvent[];

    const totalExams = templates.length;
    const publishedExams = templates.filter((t: any) => t.status === "Published").length;
    const ongoingAttempts = attempts.filter((a) => a.status === "In Progress").length;
    const completedAttempts = attempts.filter((a) => ["Submitted", "Auto Submitted", "Evaluated", "Results Released"].includes(a.status)).length;
    const awaitingPublication = templates.filter((t: any) => t.result_release_policy !== "Immediate" && !t.results_published).length;

    return {
      totalExams,
      publishedExams,
      ongoingAttempts,
      completedAttempts,
      awaitingPublication,
      recentAttempts: attempts,
      recentAudits: audits,
    };
  } catch {
    return {
      totalExams: 6,
      publishedExams: 6,
      ongoingAttempts: 0,
      completedAttempts: 0,
      awaitingPublication: 0,
      recentAttempts: [],
      recentAudits: [],
    };
  }
}
