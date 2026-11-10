import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Question,
  QuestionBank,
  PracticeSession,
  DifficultyLevel,
  QuestionStatus,
  QuestionSource,
  OptionLabel,
  QuestionImportBatch,
  AIQuestionGenerationJob,
} from "@/lib/types";

// ===========================================================================
// FALLBACK SEED QUESTIONS (Accessible if database is awaiting SQL migration)
// ===========================================================================

export const FALLBACK_QUESTIONS: Question[] = [
  {
    id: "q1000000-0000-0000-0000-000000000001",
    bank_id: "qb100000-0000-0000-0000-000000000001",
    question_text:
      "With reference to the Indian National Movement, consider the following events: 1. Champaran Satyagraha 2. Kheda Satyagraha 3. Ahmedabad Mill Strike. Which is the correct chronological sequence?",
    subject_id: "s1000000-0000-0000-0000-000000000002", // Indian History
    chapter_id: null,
    topic_id: null,
    difficulty: "Medium",
    source_type: "Previous Year Question",
    pyq_exam_name: "UPSC Civil Services Prelims",
    pyq_year: 2018,
    source_reference: "UPSC CSE 2018 General Studies Paper I",
    status: "Published",
    is_personal: false,
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    options: [
      { id: "o1", question_id: "q1000000-0000-0000-0000-000000000001", option_label: "A", option_text: "1 - 3 - 2", order_index: 1, created_at: "2026-01-01T00:00:00Z" },
      { id: "o2", question_id: "q1000000-0000-0000-0000-000000000001", option_label: "B", option_text: "1 - 2 - 3", order_index: 2, created_at: "2026-01-01T00:00:00Z" },
      { id: "o3", question_id: "q1000000-0000-0000-0000-000000000001", option_label: "C", option_text: "3 - 1 - 2", order_index: 3, created_at: "2026-01-01T00:00:00Z" },
      { id: "o4", question_id: "q1000000-0000-0000-0000-000000000001", option_label: "D", option_text: "2 - 1 - 3", order_index: 4, created_at: "2026-01-01T00:00:00Z" },
    ],
  },
  {
    id: "q1000000-0000-0000-0000-000000000002",
    bank_id: "qb100000-0000-0000-0000-000000000001",
    question_text:
      "Which Article of the Constitution of India safeguards one’s right to marry the person of one’s choice?",
    subject_id: "s1000000-0000-0000-0000-000000000005", // Indian Polity
    chapter_id: null,
    topic_id: null,
    difficulty: "Easy",
    source_type: "Previous Year Question",
    pyq_exam_name: "UPSC Civil Services Prelims",
    pyq_year: 2019,
    source_reference: "UPSC CSE 2019 / Shafin Jahan vs Asokan K.M.",
    status: "Published",
    is_personal: false,
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    options: [
      { id: "o5", question_id: "q1000000-0000-0000-0000-000000000002", option_label: "A", option_text: "Article 19", order_index: 1, created_at: "2026-01-01T00:00:00Z" },
      { id: "o6", question_id: "q1000000-0000-0000-0000-000000000002", option_label: "B", option_text: "Article 21", order_index: 2, created_at: "2026-01-01T00:00:00Z" },
      { id: "o7", question_id: "q1000000-0000-0000-0000-000000000002", option_label: "C", option_text: "Article 25", order_index: 3, created_at: "2026-01-01T00:00:00Z" },
      { id: "o8", question_id: "q1000000-0000-0000-0000-000000000002", option_label: "D", option_text: "Article 29", order_index: 4, created_at: "2026-01-01T00:00:00Z" },
    ],
  },
  {
    id: "q1000000-0000-0000-0000-000000000003",
    bank_id: "qb100000-0000-0000-0000-000000000001",
    question_text:
      "For a simply supported beam of span L subjected to a uniformly distributed load w per unit length, the maximum bending moment is:",
    subject_id: "s1000000-0000-0000-0000-000000000012", // Structural Engineering
    chapter_id: null,
    topic_id: null,
    difficulty: "Easy",
    source_type: "Previous Year Question",
    pyq_exam_name: "GATE Civil Engineering",
    pyq_year: 2021,
    source_reference: "GATE CE 2021 Session 1",
    status: "Published",
    is_personal: false,
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    options: [
      { id: "o9", question_id: "q1000000-0000-0000-0000-000000000003", option_label: "A", option_text: "wL^2 / 4", order_index: 1, created_at: "2026-01-01T00:00:00Z" },
      { id: "o10", question_id: "q1000000-0000-0000-0000-000000000003", option_label: "B", option_text: "wL^2 / 8", order_index: 2, created_at: "2026-01-01T00:00:00Z" },
      { id: "o11", question_id: "q1000000-0000-0000-0000-000000000003", option_label: "C", option_text: "wL^2 / 12", order_index: 3, created_at: "2026-01-01T00:00:00Z" },
      { id: "o12", question_id: "q1000000-0000-0000-0000-000000000003", option_label: "D", option_text: "wL^2 / 16", order_index: 4, created_at: "2026-01-01T00:00:00Z" },
    ],
  },
  {
    id: "q1000000-0000-0000-0000-000000000004",
    bank_id: "qb100000-0000-0000-0000-000000000001",
    question_text:
      "Under the Karnataka Land Revenue Act, 1964, who is designated as the chief revenue authority of a revenue sub-division?",
    subject_id: "s1000000-0000-0000-0000-000000000005", // Indian Polity / Admin
    chapter_id: null,
    topic_id: null,
    difficulty: "Medium",
    source_type: "Previous Year Question",
    pyq_exam_name: "KEA Land Surveyor / VAO",
    pyq_year: 2022,
    source_reference: "KEA 2022 Land Revenue Administration",
    status: "Published",
    is_personal: false,
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    options: [
      { id: "o13", question_id: "q1000000-0000-0000-0000-000000000004", option_label: "A", option_text: "Tahsildar", order_index: 1, created_at: "2026-01-01T00:00:00Z" },
      { id: "o14", question_id: "q1000000-0000-0000-0000-000000000004", option_label: "B", option_text: "Assistant Commissioner", order_index: 2, created_at: "2026-01-01T00:00:00Z" },
      { id: "o15", question_id: "q1000000-0000-0000-0000-000000000004", option_label: "C", option_text: "Deputy Commissioner", order_index: 3, created_at: "2026-01-01T00:00:00Z" },
      { id: "o16", question_id: "q1000000-0000-0000-0000-000000000004", option_label: "D", option_text: "Revenue Inspector", order_index: 4, created_at: "2026-01-01T00:00:00Z" },
    ],
  },
  {
    id: "q1000000-0000-0000-0000-000000000005",
    bank_id: "qb100000-0000-0000-0000-000000000001",
    question_text:
      "A train moving at 72 km/h crosses a 200-meter-long platform in 22 seconds. What is the length of the train?",
    subject_id: "s1000000-0000-0000-0000-000000000011", // Mental Ability
    chapter_id: null,
    topic_id: null,
    difficulty: "Medium",
    source_type: "Previous Year Question",
    pyq_exam_name: "Railway RRB NTPC",
    pyq_year: 2021,
    source_reference: "RRB NTPC CBT-1 2021",
    status: "Published",
    is_personal: false,
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    options: [
      { id: "o17", question_id: "q1000000-0000-0000-0000-000000000005", option_label: "A", option_text: "220 meters", order_index: 1, created_at: "2026-01-01T00:00:00Z" },
      { id: "o18", question_id: "q1000000-0000-0000-0000-000000000005", option_label: "B", option_text: "240 meters", order_index: 2, created_at: "2026-01-01T00:00:00Z" },
      { id: "o19", question_id: "q1000000-0000-0000-0000-000000000005", option_label: "C", option_text: "260 meters", order_index: 3, created_at: "2026-01-01T00:00:00Z" },
      { id: "o20", question_id: "q1000000-0000-0000-0000-000000000005", option_label: "D", option_text: "280 meters", order_index: 4, created_at: "2026-01-01T00:00:00Z" },
    ],
  },
  {
    id: "q1000000-0000-0000-0000-000000000006",
    bank_id: "qb100000-0000-0000-0000-000000000001",
    question_text:
      "Which of the following soil types possesses high liquid limit and plasticity index, exhibiting high swelling and shrinkage characteristics?",
    subject_id: "s1000000-0000-0000-0000-000000000013", // Geotechnical Engineering
    chapter_id: null,
    topic_id: null,
    difficulty: "Medium",
    source_type: "Previous Year Question",
    pyq_exam_name: "Assistant Engineer (AE) Civil",
    pyq_year: 2020,
    source_reference: "Karnataka PWD AE 2020",
    status: "Published",
    is_personal: false,
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    options: [
      { id: "o21", question_id: "q1000000-0000-0000-0000-000000000006", option_label: "A", option_text: "Red sandy loam", order_index: 1, created_at: "2026-01-01T00:00:00Z" },
      { id: "o22", question_id: "q1000000-0000-0000-0000-000000000006", option_label: "B", option_text: "Black cotton soil (Montmorillonite)", order_index: 2, created_at: "2026-01-01T00:00:00Z" },
      { id: "o23", question_id: "q1000000-0000-0000-0000-000000000006", option_label: "C", option_text: "Laterite soil", order_index: 3, created_at: "2026-01-01T00:00:00Z" },
      { id: "o24", question_id: "q1000000-0000-0000-0000-000000000006", option_label: "D", option_text: "Alluvial silt", order_index: 4, created_at: "2026-01-01T00:00:00Z" },
    ],
  },
  {
    id: "q1000000-0000-0000-0000-000000000007",
    bank_id: "qb100000-0000-0000-0000-000000000001",
    question_text:
      "In Karnataka Administrative history, the historical treaty of Seringapatam (1792) was signed after which Anglo-Mysore War?",
    subject_id: "s1000000-0000-0000-0000-000000000002", // Indian History
    chapter_id: null,
    topic_id: null,
    difficulty: "Easy",
    source_type: "Previous Year Question",
    pyq_exam_name: "KAS Gazetted Probationers",
    pyq_year: 2020,
    source_reference: "KPSC KAS Prelims 2020",
    status: "Published",
    is_personal: false,
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    options: [
      { id: "o25", question_id: "q1000000-0000-0000-0000-000000000007", option_label: "A", option_text: "First Anglo-Mysore War", order_index: 1, created_at: "2026-01-01T00:00:00Z" },
      { id: "o26", question_id: "q1000000-0000-0000-0000-000000000007", option_label: "B", option_text: "Second Anglo-Mysore War", order_index: 2, created_at: "2026-01-01T00:00:00Z" },
      { id: "o27", question_id: "q1000000-0000-0000-0000-000000000007", option_label: "C", option_text: "Third Anglo-Mysore War", order_index: 3, created_at: "2026-01-01T00:00:00Z" },
      { id: "o28", question_id: "q1000000-0000-0000-0000-000000000007", option_label: "D", option_text: "Fourth Anglo-Mysore War", order_index: 4, created_at: "2026-01-01T00:00:00Z" },
    ],
  },
];

export const FALLBACK_ANSWER_KEYS: Record<string, { correct: OptionLabel; explanation: string }> = {
  "q1000000-0000-0000-0000-000000000001": {
    correct: "A",
    explanation:
      "Champaran Satyagraha occurred in 1917, followed by Ahmedabad Mill Strike (Feb-Mar 1918), and Kheda Satyagraha (March 1918). Sequence: 1-3-2.",
  },
  "q1000000-0000-0000-0000-000000000002": {
    correct: "B",
    explanation:
      "In the Hadiya case (Shafin Jahan v. Asokan K.M. 2018), the Supreme Court affirmed that the right to marry a person of one’s choice is integral to Article 21.",
  },
  "q1000000-0000-0000-0000-000000000003": {
    correct: "B",
    explanation:
      "For a simply supported beam carrying a UDL of w over span L, the maximum bending moment occurs at midspan and is (w * L^2) / 8.",
  },
  "q1000000-0000-0000-0000-000000000004": {
    correct: "B",
    explanation:
      "Under Section 10 of the Karnataka Land Revenue Act 1964, the Assistant Commissioner is in charge of a Revenue Sub-Division (Assistant Commissioner Sub-Division).",
  },
  "q1000000-0000-0000-0000-000000000005": {
    correct: "B",
    explanation:
      "Speed = 72 * (5/18) = 20 m/s. Total distance crossed = Speed * Time = 20 * 22 = 440 m. Train length = 440 - 200 (platform) = 240 meters.",
  },
  "q1000000-0000-0000-0000-000000000006": {
    correct: "B",
    explanation:
      "Black cotton soil contains predominant Montmorillonite clay mineral, resulting in high liquid limit, expansive plasticity, and severe swelling/shrinkage cycles.",
  },
  "q1000000-0000-0000-0000-000000000007": {
    correct: "C",
    explanation:
      "The Treaty of Seringapatam was signed on 18 March 1792 at the end of the Third Anglo-Mysore War between Tipu Sultan and Lord Cornwallis.",
  },
};

// ===========================================================================
// QUERY FUNCTIONS
// ===========================================================================

export async function getQuestions(filters?: {
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  examId?: string;
  difficulty?: DifficultyLevel | "All";
  status?: QuestionStatus | "All";
  sourceType?: QuestionSource | "All";
  searchQuery?: string;
  isPersonal?: boolean;
}): Promise<Question[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("questions")
      .select("*, options:question_options(*), subject:subjects(*)")
      .order("created_at", { ascending: false });

    if (filters?.subjectId && filters.subjectId !== "All") {
      query = query.eq("subject_id", filters.subjectId);
    }
    if (filters?.chapterId && filters.chapterId !== "All") {
      query = query.eq("chapter_id", filters.chapterId);
    }
    if (filters?.topicId && filters.topicId !== "All") {
      query = query.eq("topic_id", filters.topicId);
    }
    if (filters?.difficulty && filters.difficulty !== "All") {
      query = query.eq("difficulty", filters.difficulty);
    }
    if (filters?.status && filters.status !== "All") {
      query = query.eq("status", filters.status);
    }
    if (filters?.sourceType && filters.sourceType !== "All") {
      query = query.eq("source_type", filters.sourceType);
    }
    if (filters?.isPersonal !== undefined) {
      query = query.eq("is_personal", filters.isPersonal);
    }
    if (filters?.searchQuery) {
      query = query.ilike("question_text", `%${filters.searchQuery}%`);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      // Filter fallback questions
      let res = FALLBACK_QUESTIONS;
      if (filters?.subjectId && filters.subjectId !== "All") {
        res = res.filter((q) => q.subject_id === filters.subjectId);
      }
      if (filters?.difficulty && filters.difficulty !== "All") {
        res = res.filter((q) => q.difficulty === filters.difficulty);
      }
      if (filters?.sourceType && filters.sourceType !== "All") {
        res = res.filter((q) => q.source_type === filters.sourceType);
      }
      if (filters?.searchQuery) {
        res = res.filter((q) =>
          q.question_text.toLowerCase().includes(filters.searchQuery!.toLowerCase())
        );
      }
      return res;
    }
    return data as Question[];
  } catch {
    return FALLBACK_QUESTIONS;
  }
}

export async function getQuestionById(id: string): Promise<Question | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("questions")
      .select("*, options:question_options(*), subject:subjects(*)")
      .eq("id", id)
      .single();

    if (error || !data) {
      const fb = FALLBACK_QUESTIONS.find((q) => q.id === id);
      return fb || null;
    }
    return data as Question;
  } catch {
    const fb = FALLBACK_QUESTIONS.find((q) => q.id === id);
    return fb || null;
  }
}

/**
 * Retrieves questions tailored for interactive student practice sessions.
 * Never includes answers or explanations (MODULE 14 SECURITY COMPLIANCE).
 */
export async function getQuestionsForPractice(params: {
  topicId?: string;
  subjectId?: string;
  examId?: string;
  pyqOnly?: boolean;
  bookmarkedOnly?: boolean;
  incorrectOnly?: boolean;
  studentId?: string;
  limit?: number;
}): Promise<Question[]> {
  const {
    topicId,
    subjectId,
    examId,
    pyqOnly,
    bookmarkedOnly,
    incorrectOnly,
    studentId,
    limit = 20,
  } = params;

  try {
    const supabase = await createClient();

    // 1. If bookmarked only
    if (bookmarkedOnly && studentId) {
      const bookmarkedIds = await getStudentBookmarks(studentId);
      if (bookmarkedIds.length === 0) return [];

      const { data } = await supabase
        .from("questions")
        .select("*, options:question_options(*)")
        .in("id", bookmarkedIds)
        .limit(limit);

      if (data && data.length > 0) return data as Question[];
      return FALLBACK_QUESTIONS.filter((q) => bookmarkedIds.includes(q.id));
    }

    // 2. If incorrect questions only
    if (incorrectOnly && studentId) {
      const incorrectIds = await getStudentIncorrectQuestionIds(studentId);
      if (incorrectIds.length === 0) return [];

      const { data } = await supabase
        .from("questions")
        .select("*, options:question_options(*)")
        .in("id", incorrectIds)
        .limit(limit);

      if (data && data.length > 0) return data as Question[];
      return FALLBACK_QUESTIONS.filter((q) => incorrectIds.includes(q.id));
    }

    // 3. Exam mapping filter
    if (examId) {
      const { data: mappings } = await supabase
        .from("question_exam_mappings")
        .select("question_id")
        .eq("exam_id", examId);

      const mappedIds = (mappings || []).map((m: any) => m.question_id);
      if (mappedIds.length > 0) {
        let query = supabase
          .from("questions")
          .select("*, options:question_options(*)")
          .in("id", mappedIds)
          .eq("status", "Published")
          .limit(limit);

        if (pyqOnly) {
          query = query.eq("source_type", "Previous Year Question");
        }
        const { data } = await query;
        if (data && data.length > 0) return data as Question[];
      }
    }

    // 4. General query with filters
    let query = supabase
      .from("questions")
      .select("*, options:question_options(*)")
      .eq("status", "Published")
      .limit(limit);

    if (topicId) query = query.eq("topic_id", topicId);
    if (subjectId) query = query.eq("subject_id", subjectId);
    if (pyqOnly) query = query.eq("source_type", "Previous Year Question");

    const { data } = await query;
    if (data && data.length > 0) return data as Question[];

    // Fallback matching
    let fb = FALLBACK_QUESTIONS.filter((q) => q.status === "Published");
    if (subjectId) fb = fb.filter((q) => q.subject_id === subjectId);
    if (pyqOnly) fb = fb.filter((q) => q.source_type === "Previous Year Question");

    return fb.slice(0, limit);
  } catch {
    let fb = FALLBACK_QUESTIONS;
    if (subjectId) fb = fb.filter((q) => q.subject_id === subjectId);
    if (pyqOnly) fb = fb.filter((q) => q.source_type === "Previous Year Question");
    return fb.slice(0, limit);
  }
}

export async function getStudentBookmarks(studentId: string): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("question_bookmarks")
      .select("question_id")
      .eq("student_id", studentId);

    if (error || !data) {
      return [];
    }
    return data.map((b: any) => b.question_id);
  } catch {
    return [];
  }
}

export async function getStudentIncorrectQuestionIds(studentId: string): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("question_attempts")
      .select("question_id")
      .eq("student_id", studentId)
      .eq("is_correct", false);

    if (error || !data) {
      return [];
    }
    return Array.from(new Set(data.map((a: any) => a.question_id)));
  } catch {
    return [];
  }
}

export async function getStudentPracticeStats(studentId: string) {
  try {
    const supabase = await createClient();
    const { data: attempts } = await supabase
      .from("question_attempts")
      .select("is_correct, created_at")
      .eq("student_id", studentId);

    const total = attempts?.length || 0;
    const correct = attempts?.filter((a: any) => a.is_correct).length || 0;
    const incorrect = total - correct;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    return {
      totalAttempts: total,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      accuracyPercent: accuracy,
    };
  } catch {
    return {
      totalAttempts: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      accuracyPercent: 0,
    };
  }
}

export async function getStudentPracticeSessions(studentId: string): Promise<PracticeSession[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("practice_sessions")
      .select("*, exam:exams(*), subject:subjects(*)")
      .eq("student_id", studentId)
      .order("started_at", { ascending: false })
      .limit(15);

    if (error || !data) {
      return [];
    }
    return data as PracticeSession[];
  } catch {
    return [];
  }
}

export async function getStudentPersonalBanks(studentId: string): Promise<QuestionBank[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("question_banks")
      .select("*")
      .eq("is_system", false)
      .eq("created_by", studentId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }
    return data as QuestionBank[];
  } catch {
    return [];
  }
}

export async function getImportBatches(): Promise<QuestionImportBatch[]> {
  try {
    const adminDb = createAdminClient();
    const { data, error } = await adminDb
      .from("question_import_batches")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error || !data) return [];
    return data as QuestionImportBatch[];
  } catch {
    return [];
  }
}

export async function getAIGenerationJobs(): Promise<AIQuestionGenerationJob[]> {
  try {
    const adminDb = createAdminClient();
    const { data, error } = await adminDb
      .from("ai_question_generation_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error || !data) return [];
    return data as AIQuestionGenerationJob[];
  } catch {
    return [];
  }
}
