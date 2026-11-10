import { createClient } from "@/lib/supabase/server";
import { allowDemoFallback } from "./questions";
import type {
  Exam,
  StudentExam,
  Subject,
  Chapter,
  Topic,
  TopicProgress,
  StudyTask,
  RoutineTemplate,
  ExamScheduleEvent,
  StudyPreferences,
  RevisionSchedule,
  PersonalNote,
} from "@/lib/types";

// ===========================================================================
// FALLBACK SEED DATA (Used seamlessly if remote PostgreSQL is awaiting migration)
// ===========================================================================

export const FALLBACK_EXAMS: Exam[] = [
  {
    id: "e1000000-0000-0000-0000-000000000001",
    category: "GATE",
    sub_category: "Civil Engineering",
    name: "GATE — Civil Engineering",
    code: "GATE-CE",
    description: "Graduate Aptitude Test in Engineering for Civil Engineering discipline",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "e1000000-0000-0000-0000-000000000002",
    category: "GATE",
    sub_category: "Computer Science & IT",
    name: "GATE — Computer Science & Information Technology",
    code: "GATE-CS",
    description: "Graduate Aptitude Test in Engineering for CS & IT discipline",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "e1000000-0000-0000-0000-000000000003",
    category: "KAS",
    sub_category: "General Studies",
    name: "KAS — Karnataka Administrative Services",
    code: "KAS-GS",
    description: "KPSC Gazetted Probationers Preliminary & Mains Examination",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "e1000000-0000-0000-0000-000000000004",
    category: "UPSC",
    sub_category: "Civil Services",
    name: "UPSC — Civil Services Examination",
    code: "UPSC-CSE",
    description: "Union Public Service Commission Civil Services Examination",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "e1000000-0000-0000-0000-000000000005",
    category: "Railway Examinations",
    sub_category: "RRB NTPC",
    name: "Railway — RRB Non-Technical Popular Categories",
    code: "RRB-NTPC",
    description: "Railway Recruitment Board NTPC Examination",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "e1000000-0000-0000-0000-000000000006",
    category: "KEA Examinations",
    sub_category: "Land Surveyor",
    name: "KEA — Land Surveyor",
    code: "KEA-LS",
    description: "Karnataka Examination Authority Land Surveyor Recruitment",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "e1000000-0000-0000-0000-000000000007",
    category: "KEA Examinations",
    sub_category: "VAO",
    name: "KEA — Village Administrative Officer",
    code: "KEA-VAO",
    description: "Karnataka Examination Authority Village Administrative Officer Recruitment",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "e1000000-0000-0000-0000-000000000008",
    category: "AE Civil Engineering",
    sub_category: "Public Works",
    name: "Assistant Engineer (AE) — Civil Engineering",
    code: "AE-CIVIL",
    description: "Assistant Engineer Recruitment for PWD, WRD and Irrigation",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "e1000000-0000-0000-0000-000000000009",
    category: "General Knowledge",
    sub_category: "Core Library",
    name: "General Knowledge Study Library",
    code: "GK-CORE",
    description: "Foundational 11-category general studies repository",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

export const FALLBACK_SUBJECTS: Subject[] = [
  {
    id: "s1000000-0000-0000-0000-000000000001",
    name: "Current Affairs",
    code: "GK-CA",
    category: "General Studies",
    description: "National, International and State Current Affairs",
    is_published: true,
    order_index: 1,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "s1000000-0000-0000-0000-000000000002",
    name: "Indian History",
    code: "GK-HIST",
    category: "General Studies",
    description: "Ancient, Medieval, Modern Indian History and Art & Culture",
    is_published: true,
    order_index: 2,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "s1000000-0000-0000-0000-000000000003",
    name: "Geography",
    code: "GK-GEOG",
    category: "General Studies",
    description: "World and Indian Physical & Economic Geography",
    is_published: true,
    order_index: 3,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "s1000000-0000-0000-0000-000000000004",
    name: "Environment and Ecology",
    code: "GK-ENV",
    category: "General Studies",
    description: "Ecosystem, Pollution, Biodiversity, Climate Change and SDGs",
    is_published: true,
    order_index: 4,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "s1000000-0000-0000-0000-000000000005",
    name: "Indian Polity",
    code: "GK-POLITY",
    category: "General Studies",
    description: "Constitutional Framework, Governance, Rights and Parliament",
    is_published: true,
    order_index: 5,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "s1000000-0000-0000-0000-000000000006",
    name: "Indian Economy",
    code: "GK-ECON",
    category: "General Studies",
    description: "Economic Reforms, Fiscal Policies, Banking and Inflation",
    is_published: true,
    order_index: 6,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "s1000000-0000-0000-0000-000000000007",
    name: "General Science",
    code: "GK-SCI",
    category: "General Studies",
    description: "Everyday Physics, Chemistry and Biological Systems",
    is_published: true,
    order_index: 7,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "s1000000-0000-0000-0000-000000000008",
    name: "Science and Technology",
    code: "GK-SCITECH",
    category: "General Studies",
    description: "Space, Nuclear, Defence, Biotech, Nanotech and IT",
    is_published: true,
    order_index: 8,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "s1000000-0000-0000-0000-000000000009",
    name: "Computer Knowledge",
    code: "GK-COMP",
    category: "General Studies",
    description: "Architecture, OS, Networking, Cyber Security and Internet",
    is_published: true,
    order_index: 9,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "s1000000-0000-0000-0000-000000000010",
    name: "Static GK",
    code: "GK-STATIC",
    category: "General Studies",
    description: "Capitals, Currencies, Books, Awards, Organizations, Sports",
    is_published: true,
    order_index: 10,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "s1000000-0000-0000-0000-000000000011",
    name: "Mental Ability",
    code: "GK-APT",
    category: "Aptitude",
    description: "Logical Reasoning, Analytical Ability and Data Interpretation",
    is_published: true,
    order_index: 11,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "s1000000-0000-0000-0000-000000000012",
    name: "Structural Engineering",
    code: "CE-STRUCT",
    category: "Technical",
    description: "Mechanics, Solid Mechanics, Structural Analysis, Concrete & Steel",
    is_published: true,
    order_index: 12,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "s1000000-0000-0000-0000-000000000013",
    name: "Geotechnical Engineering",
    code: "CE-GEO",
    category: "Technical",
    description: "Soil Mechanics, Permeability, Compaction and Shallow/Deep Foundations",
    is_published: true,
    order_index: 13,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "s1000000-0000-0000-0000-000000000014",
    name: "Engineering Mathematics",
    code: "GATE-EM",
    category: "Technical",
    description: "Linear Algebra, Calculus, Differential Equations and Probability",
    is_published: true,
    order_index: 14,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

// ===========================================================================
// QUERY FUNCTIONS
// ===========================================================================

export async function getAllExams(): Promise<Exam[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      if (!allowDemoFallback()) {
        if (error) console.error(`[PRODUCTION INTEGRITY GUARD] Failed to query exams: ${error.message}`);
        return [];
      }
      return FALLBACK_EXAMS;
    }
    return data as Exam[];
  } catch {
    if (!allowDemoFallback()) return [];
    return FALLBACK_EXAMS;
  }
}

export async function getStudentExams(studentId: string): Promise<StudentExam[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("student_exams")
      .select("*, exam:exams(*)")
      .eq("student_id", studentId)
      .order("priority", { ascending: true });

    if (error || !data) {
      return [];
    }
    return data as StudentExam[];
  } catch {
    return [];
  }
}

export async function getAllSubjects(): Promise<Subject[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("is_published", true)
      .order("order_index", { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_SUBJECTS;
    }
    return data as Subject[];
  } catch {
    return FALLBACK_SUBJECTS;
  }
}

export async function getExamSyllabus(
  examId: string,
  studentId?: string
): Promise<{ exam: Exam | null; subjects: Subject[] }> {
  try {
    const supabase = await createClient();

    // 1. Get Exam
    const { data: examData } = await supabase
      .from("exams")
      .select("*")
      .eq("id", examId)
      .single();

    const exam = (examData as Exam) || FALLBACK_EXAMS.find((e) => e.id === examId) || null;

    // 2. Get Mapped Subjects
    const { data: mappings } = await supabase
      .from("exam_subject_mappings")
      .select("subject_id, weightage_percent, subject:subjects(*)")
      .eq("exam_id", examId)
      .order("order_index", { ascending: true });

    let subjects: Subject[] = [];

    if (mappings && mappings.length > 0) {
      subjects = mappings
        .map((m: any) => ({
          ...m.subject,
          weightage_percent: m.weightage_percent,
        }))
        .filter(Boolean);
    } else {
      // Fallback: If no explicit mapping found yet, match relevant subjects by category
      if (exam?.category === "KAS" || exam?.code === "KAS-GS") {
        subjects = FALLBACK_SUBJECTS.filter((s) =>
          ["GK-HIST", "GK-GEOG", "GK-POLITY", "GK-ECON", "GK-ENV", "GK-APT"].includes(s.code)
        );
      } else if (exam?.category === "GATE" || exam?.code === "GATE-CE") {
        subjects = FALLBACK_SUBJECTS.filter((s) =>
          ["GATE-EM", "CE-STRUCT", "CE-GEO"].includes(s.code)
        );
      } else if (exam?.category === "AE Civil Engineering" || exam?.code === "AE-CIVIL") {
        subjects = FALLBACK_SUBJECTS.filter((s) =>
          ["CE-STRUCT", "CE-GEO", "GK-POLITY"].includes(s.code)
        );
      } else {
        subjects = FALLBACK_SUBJECTS.slice(0, 6);
      }
    }

    // 3. For each subject, fetch Chapters and Topics
    for (const subject of subjects) {
      const { data: chaptersData } = await supabase
        .from("chapters")
        .select("*")
        .eq("subject_id", subject.id)
        .eq("is_published", true)
        .order("order_index", { ascending: true });

      const chapters: Chapter[] = (chaptersData as Chapter[]) || [];

      for (const chapter of chapters) {
        const { data: topicsData } = await supabase
          .from("topics")
          .select("*")
          .eq("chapter_id", chapter.id)
          .eq("is_published", true)
          .order("order_index", { ascending: true });

        const topics: Topic[] = (topicsData as Topic[]) || [];

        // If studentId provided, fetch progress
        if (studentId && topics.length > 0) {
          const topicIds = topics.map((t) => t.id);
          const { data: progressData } = await supabase
            .from("topic_progress")
            .select("*")
            .eq("student_id", studentId)
            .in("topic_id", topicIds);

          const progressMap = new Map((progressData || []).map((p: any) => [p.topic_id, p]));
          topics.forEach((t) => {
            t.progress = progressMap.get(t.id) as TopicProgress | undefined;
          });
        }

        chapter.topics = topics;
      }

      subject.chapters = chapters;
    }

    return { exam, subjects };
  } catch {
    const exam = FALLBACK_EXAMS.find((e) => e.id === examId) || FALLBACK_EXAMS[0];
    return { exam, subjects: FALLBACK_SUBJECTS.slice(0, 5) };
  }
}

export async function getStudentTasks(
  studentId: string,
  filterStatus?: string
): Promise<StudyTask[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("study_tasks")
      .select("*, exam:exams(*), subject:subjects(*), topic:topics(*)")
      .eq("student_id", studentId)
      .order("scheduled_date", { ascending: true });

    if (filterStatus && filterStatus !== "All") {
      query = query.eq("status", filterStatus);
    }

    const { data, error } = await query;
    if (error || !data) {
      return [];
    }
    return data as StudyTask[];
  } catch {
    return [];
  }
}

export async function getStudentRoutines(studentId: string): Promise<RoutineTemplate[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("routine_templates")
      .select("*, exam:exams(*), subject:subjects(*)")
      .eq("student_id", studentId)
      .order("start_time", { ascending: true });

    if (error || !data) {
      return [];
    }
    return data as RoutineTemplate[];
  } catch {
    return [];
  }
}

export async function getStudyPreferences(studentId: string): Promise<StudyPreferences> {
  const defaultPrefs: StudyPreferences = {
    id: "pref-default",
    student_id: studentId,
    daily_study_hours: 4.0,
    available_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    preferred_slot_duration_minutes: 60,
    timezone: "Asia/Kolkata",
    auto_carry_forward: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("study_preferences")
      .select("*")
      .eq("student_id", studentId)
      .single();

    if (error || !data) {
      return defaultPrefs;
    }
    return data as StudyPreferences;
  } catch {
    return defaultPrefs;
  }
}

export async function getExamScheduleEvents(examIds?: string[]): Promise<ExamScheduleEvent[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("exam_schedule_events")
      .select("*, exam:exams(*)")
      .eq("is_active", true)
      .order("start_date", { ascending: true });

    if (examIds && examIds.length > 0) {
      query = query.in("exam_id", examIds);
    }

    const { data, error } = await query;
    if (error || !data) {
      return [];
    }
    return data as ExamScheduleEvent[];
  } catch {
    return [];
  }
}

export async function getStudentRevisions(studentId: string): Promise<RevisionSchedule[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("revision_schedules")
      .select("*, topic:topics(*)")
      .eq("student_id", studentId)
      .order("scheduled_date", { ascending: true });

    if (error || !data) {
      return [];
    }
    return data as RevisionSchedule[];
  } catch {
    return [];
  }
}

export async function getStudentNotes(studentId: string): Promise<PersonalNote[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("personal_notes")
      .select("*, topic:topics(*)")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }
    return data as PersonalNote[];
  } catch {
    return [];
  }
}
