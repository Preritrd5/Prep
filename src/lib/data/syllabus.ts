import { createClient } from "@/lib/supabase/server";
import { allowDemoFallback } from "./questions";
import { getStoredRoutines } from "./routine-store";
import {
  getStoredTasks,
  getStoredPreferences,
  getStoredTopicProgress,
  getStoredPersonalNotes,
  getStoredPersonalTopics,
  getStoredCustomExams,
  getStoredEnrollments,
  getStoredExamEvents,
  getStoredRevisionSchedules,
} from "./local-store";
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
    id: "e1000000-0000-0000-0000-000000000010",
    category: "KEA Examinations",
    sub_category: "SDA",
    name: "KEA — Second Division Assistant (SDA)",
    code: "KEA-SDA",
    description: "Karnataka Examination Authority Second Division Assistant Recruitment",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "e1000000-0000-0000-0000-000000000011",
    category: "KEA Examinations",
    sub_category: "FDA",
    name: "KEA — First Division Assistant (FDA)",
    code: "KEA-FDA",
    description: "Karnataka Examination Authority First Division Assistant Recruitment",
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
  const customExams = await getStoredCustomExams();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      const merged = [...FALLBACK_EXAMS];
      customExams.forEach((ce) => {
        if (!merged.some((e) => e.id === ce.id || e.code === ce.code)) {
          merged.push(ce);
        }
      });
      return merged;
    }
    const combined = [...(data as Exam[])];
    customExams.forEach((ce) => {
      if (!combined.some((e) => e.id === ce.id || e.code === ce.code)) {
        combined.push(ce);
      }
    });
    return combined;
  } catch {
    const merged = [...FALLBACK_EXAMS];
    customExams.forEach((ce) => {
      if (!merged.some((e) => e.id === ce.id || e.code === ce.code)) {
        merged.push(ce);
      }
    });
    return merged;
  }
}

export async function getStudentExams(studentId: string): Promise<StudentExam[]> {
  const storedEnrollments = await getStoredEnrollments(studentId);
  const allAvailableExams = await getAllExams();
  const examMap = new Map(allAvailableExams.map((e) => [e.id, e]));

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("student_exams")
      .select("*, exam:exams(*)")
      .eq("student_id", studentId)
      .order("priority", { ascending: true });

    if (error || !data || data.length === 0) {
      return storedEnrollments.map((se) => ({
        ...se,
        exam: se.exam || examMap.get(se.exam_id),
      }));
    }
    return (data as StudentExam[]).map((se) => ({
      ...se,
      exam: se.exam || examMap.get(se.exam_id),
    }));
  } catch {
    return storedEnrollments.map((se) => ({
      ...se,
      exam: se.exam || examMap.get(se.exam_id),
    }));
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

/**
 * Returns all curriculum subjects with their nested chapters (sections) and topics.
 * Follows the competitive-exam book table of contents structure.
 */
export async function getAllSubjectsWithTree(): Promise<Subject[]> {
  try {
    const supabase = await createClient();
    const { data: sData } = await supabase
      .from("subjects")
      .select("*")
      .eq("is_published", true)
      .order("order_index", { ascending: true });

    const subjects = sData && sData.length > 0 ? (sData as Subject[]) : FALLBACK_SUBJECTS;

    const { data: cData } = await supabase
      .from("chapters")
      .select("*")
      .eq("is_published", true)
      .order("order_index", { ascending: true });

    const { data: tData } = await supabase
      .from("topics")
      .select("*")
      .eq("is_published", true)
      .order("order_index", { ascending: true });

    const topicsByChapter = new Map<string, Topic[]>();
    (tData || []).forEach((t: Topic) => {
      if (t.chapter_id) {
        const list = topicsByChapter.get(t.chapter_id) || [];
        list.push(t);
        topicsByChapter.set(t.chapter_id, list);
      }
    });

    const chaptersBySubject = new Map<string, Chapter[]>();
    (cData || []).forEach((c: Chapter) => {
      c.topics = topicsByChapter.get(c.id) || [];
      const list = chaptersBySubject.get(c.subject_id) || [];
      list.push(c);
      chaptersBySubject.set(c.subject_id, list);
    });

    return subjects.map((subj) => {
      const dbChapters = chaptersBySubject.get(subj.id);
      if (dbChapters && dbChapters.length > 0) {
        return { ...subj, chapters: dbChapters };
      }
      // Populate structured chapters & topics from the verified book table of contents
      return {
        ...subj,
        chapters: BOOK_CHAPTERS_FALLBACK[subj.code] || BOOK_CHAPTERS_FALLBACK[subj.id] || [],
      };
    });
  } catch {
    return FALLBACK_SUBJECTS.map((subj) => ({
      ...subj,
      chapters: BOOK_CHAPTERS_FALLBACK[subj.code] || [],
    }));
  }
}

// ===========================================================================
// BOOK TABLE OF CONTENTS DATA STRUCTURE (Phase 4 / Part 4 Invariant)
// 1. Indian History (Ancient, Medieval, Modern, Art & Culture)
// 2. Geography (World, Indian)
// 3. Environment and Ecology
// 4. Indian Polity
// 5. Indian Economy
// 6. General Science (Physics, Chemistry, Biology)
// 7. Science and Technology
// 8. Computer Knowledge
// 9. Static GK
// 10. Current Affairs
// 11. Previous Year Questions (1000+ One-liner PYQs)
// 12. Mental Ability
// ===========================================================================
export const BOOK_CHAPTERS_FALLBACK: Record<string, Chapter[]> = {
  "GK-HIST": [
    {
      id: "c1000000-0000-0000-0000-000000000001",
      subject_id: "s1000000-0000-0000-0000-000000000002",
      title: "Ancient History",
      description: "Prehistoric, Indus Valley, Vedic, Mahajanapadas, Mauryan and Gupta Eras",
      order_index: 1,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000001", chapter_id: "c1000000-0000-0000-0000-000000000001", title: "Indus Valley Civilization & Prehistory", description: "Sites, town planning, seals, trade and decline", estimated_minutes: 60, official_syllabus_ref: "HIST-01", textbook_ref: "History Book Vol 1", textbook_page_start: 1, textbook_page_end: 15, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000002", chapter_id: "c1000000-0000-0000-0000-000000000001", title: "Vedic Period & Philosophy", description: "Early and Later Vedic society, literature, varnas", estimated_minutes: 60, official_syllabus_ref: "HIST-02", textbook_ref: "History Book Vol 1", textbook_page_start: 16, textbook_page_end: 28, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000003", chapter_id: "c1000000-0000-0000-0000-000000000001", title: "Buddhism & Jainism", description: "Doctrines, councils, sanghas and patronage", estimated_minutes: 45, official_syllabus_ref: "HIST-03", textbook_ref: "History Book Vol 1", textbook_page_start: 29, textbook_page_end: 42, order_index: 3, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000004", chapter_id: "c1000000-0000-0000-0000-000000000001", title: "Mauryan & Gupta Empires", description: "Administration, Ashokan edicts, Golden Age", estimated_minutes: 75, official_syllabus_ref: "HIST-04", textbook_ref: "History Book Vol 1", textbook_page_start: 43, textbook_page_end: 65, order_index: 4, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
    {
      id: "c1000000-0000-0000-0000-000000000002",
      subject_id: "s1000000-0000-0000-0000-000000000002",
      title: "Medieval History",
      description: "Delhi Sultanate, Mughals, Vijayanagara and Marathas",
      order_index: 2,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000005", chapter_id: "c1000000-0000-0000-0000-000000000002", title: "Delhi Sultanate", description: "Slave, Khilji, Tughlaq, Sayyid and Lodi dynasties", estimated_minutes: 60, official_syllabus_ref: "HIST-05", textbook_ref: "History Book Vol 1", textbook_page_start: 66, textbook_page_end: 85, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000006", chapter_id: "c1000000-0000-0000-0000-000000000002", title: "Mughal Empire & Administration", description: "Babur to Aurangzeb, Mansabdari system, revenue", estimated_minutes: 75, official_syllabus_ref: "HIST-06", textbook_ref: "History Book Vol 1", textbook_page_start: 86, textbook_page_end: 110, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000007", chapter_id: "c1000000-0000-0000-0000-000000000002", title: "Vijayanagara Empire & Marathas", description: "Hampi, Shivaji, administration and Deccan powers", estimated_minutes: 60, official_syllabus_ref: "HIST-07", textbook_ref: "History Book Vol 1", textbook_page_start: 111, textbook_page_end: 130, order_index: 3, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
    {
      id: "c1000000-0000-0000-0000-000000000003",
      subject_id: "s1000000-0000-0000-0000-000000000002",
      title: "Modern History",
      description: "European Advent, Revolt of 1857, Freedom Movement and Partition",
      order_index: 3,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000009", chapter_id: "c1000000-0000-0000-0000-000000000003", title: "European Advent & British Expansion", description: "Carnatic Wars, Plassey, Buxar and Mysore Wars", estimated_minutes: 60, official_syllabus_ref: "HIST-08", textbook_ref: "History Book Vol 1", textbook_page_start: 131, textbook_page_end: 155, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000010", chapter_id: "c1000000-0000-0000-0000-000000000003", title: "Revolt of 1857 & Social Reforms", description: "Causes, centers, leaders and socio-religious movements", estimated_minutes: 60, official_syllabus_ref: "HIST-09", textbook_ref: "History Book Vol 1", textbook_page_start: 156, textbook_page_end: 178, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000011", chapter_id: "c1000000-0000-0000-0000-000000000003", title: "Indian National Movement & Gandhian Era", description: "Non-Cooperation, Civil Disobedience, Quit India", estimated_minutes: 90, official_syllabus_ref: "HIST-10", textbook_ref: "History Book Vol 1", textbook_page_start: 179, textbook_page_end: 215, order_index: 3, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
    {
      id: "c1000000-0000-0000-0000-000000000004",
      subject_id: "s1000000-0000-0000-0000-000000000002",
      title: "Art & Culture and Cultural Traditions",
      description: "Architecture, Classical Dances, Music, Paintings and Festivals",
      order_index: 4,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000013", chapter_id: "c1000000-0000-0000-0000-000000000004", title: "Classical Dances, Music & Festivals", description: "8 Classical dance forms, gharanas, instruments", estimated_minutes: 50, official_syllabus_ref: "HIST-11", textbook_ref: "History Book Vol 1", textbook_page_start: 216, textbook_page_end: 235, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000014", chapter_id: "c1000000-0000-0000-0000-000000000004", title: "Indian Architecture & Caves", description: "Nagara, Dravida, Vesara styles, rock-cut architecture", estimated_minutes: 60, official_syllabus_ref: "HIST-12", textbook_ref: "History Book Vol 1", textbook_page_start: 236, textbook_page_end: 260, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
  ],
  "GK-GEOG": [
    {
      id: "c1000000-0000-0000-0000-000000000005",
      subject_id: "s1000000-0000-0000-0000-000000000003",
      title: "World Geography",
      description: "Solar System, Earth, Geomorphology, Climatology and Oceans",
      order_index: 1,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000017", chapter_id: "c1000000-0000-0000-0000-000000000005", title: "Solar System & Plate Tectonics", description: "Planets, internal structure of earth, lithosphere", estimated_minutes: 60, official_syllabus_ref: "GEOG-01", textbook_ref: "Geography Vol 1", textbook_page_start: 1, textbook_page_end: 25, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000018", chapter_id: "c1000000-0000-0000-0000-000000000005", title: "Climatology & Oceanography", description: "Atmosphere, pressure belts, ocean currents, tides", estimated_minutes: 60, official_syllabus_ref: "GEOG-02", textbook_ref: "Geography Vol 1", textbook_page_start: 26, textbook_page_end: 50, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
    {
      id: "c1000000-0000-0000-0000-000000000006",
      subject_id: "s1000000-0000-0000-0000-000000000003",
      title: "Indian Geography",
      description: "Physiography, Drainage, Climate, Soils, Agriculture and Minerals",
      order_index: 2,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000020", chapter_id: "c1000000-0000-0000-0000-000000000006", title: "Physiography & River Systems of India", description: "Himalayas, Peninsular Plateau, River basins", estimated_minutes: 75, official_syllabus_ref: "GEOG-03", textbook_ref: "Geography Vol 1", textbook_page_start: 51, textbook_page_end: 80, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000022", chapter_id: "c1000000-0000-0000-0000-000000000006", title: "Climate, Monsoons & Agriculture", description: "SW/NE Monsoons, soil types, major crop seasons", estimated_minutes: 60, official_syllabus_ref: "GEOG-04", textbook_ref: "Geography Vol 1", textbook_page_start: 81, textbook_page_end: 110, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
  ],
  "GK-POLITY": [
    {
      id: "c1000000-0000-0000-0000-000000000009",
      subject_id: "s1000000-0000-0000-0000-000000000005",
      title: "Constitutional Framework",
      description: "Preamble, Fundamental Rights, DPSPs and Amendments",
      order_index: 1,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000031", chapter_id: "c1000000-0000-0000-0000-000000000009", title: "Preamble & Making of Constitution", description: "Constituent Assembly, sources, salient features", estimated_minutes: 45, official_syllabus_ref: "POL-01", textbook_ref: "Indian Polity", textbook_page_start: 1, textbook_page_end: 20, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000033", chapter_id: "c1000000-0000-0000-0000-000000000009", title: "Fundamental Rights & Duties", description: "Articles 12-35, writs, 51A fundamental duties", estimated_minutes: 90, official_syllabus_ref: "POL-02", textbook_ref: "Indian Polity", textbook_page_start: 21, textbook_page_end: 55, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000034", chapter_id: "c1000000-0000-0000-0000-000000000009", title: "Directive Principles of State Policy", description: "Articles 36-51, social, economic and Gandhian principles", estimated_minutes: 45, official_syllabus_ref: "POL-03", textbook_ref: "Indian Polity", textbook_page_start: 56, textbook_page_end: 75, order_index: 3, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
    {
      id: "c1000000-0000-0000-0000-000000000010",
      subject_id: "s1000000-0000-0000-0000-000000000005",
      title: "Union & State Governance",
      description: "President, Parliament, Judiciary, Governor and Local Bodies",
      order_index: 2,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000035", chapter_id: "c1000000-0000-0000-0000-000000000010", title: "President, Prime Minister & Parliament", description: "Executive powers, legislative procedure, budget", estimated_minutes: 80, official_syllabus_ref: "POL-04", textbook_ref: "Indian Polity", textbook_page_start: 76, textbook_page_end: 120, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000037", chapter_id: "c1000000-0000-0000-0000-000000000010", title: "Judiciary: Supreme Court & High Courts", description: "Jurisdiction, judicial review, PIL, collegium", estimated_minutes: 60, official_syllabus_ref: "POL-05", textbook_ref: "Indian Polity", textbook_page_start: 121, textbook_page_end: 150, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000038", chapter_id: "c1000000-0000-0000-0000-000000000010", title: "Panchayati Raj & State Administration", description: "73rd/74th amendments, district revenue governance", estimated_minutes: 60, official_syllabus_ref: "POL-06", textbook_ref: "Indian Polity", textbook_page_start: 151, textbook_page_end: 180, order_index: 3, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
  ],
  "GK-SCI": [
    {
      id: "c1000000-0000-0000-0000-000000000013",
      subject_id: "s1000000-0000-0000-0000-000000000007",
      title: "Physics",
      description: "Mechanics, Heat, Light, Sound and Electricity",
      order_index: 1,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000046", chapter_id: "c1000000-0000-0000-0000-000000000013", title: "Mechanics & Motion", description: "Newton's laws, gravitation, work, energy, power", estimated_minutes: 60, official_syllabus_ref: "SCI-01", textbook_ref: "General Science", textbook_page_start: 1, textbook_page_end: 30, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000047", chapter_id: "c1000000-0000-0000-0000-000000000013", title: "Optics, Sound & Waves", description: "Reflection, refraction, lenses, wave propagation", estimated_minutes: 50, official_syllabus_ref: "SCI-02", textbook_ref: "General Science", textbook_page_start: 31, textbook_page_end: 55, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
    {
      id: "c1000000-0000-0000-0000-000000000014",
      subject_id: "s1000000-0000-0000-0000-000000000007",
      title: "Chemistry",
      description: "Matter, Atomic Structure, Periodic Table, Acids, Bases and Metals",
      order_index: 2,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000049", chapter_id: "c1000000-0000-0000-0000-000000000014", title: "Matter & Periodic Table", description: "Atomic structure, chemical bonding, elements", estimated_minutes: 50, official_syllabus_ref: "SCI-03", textbook_ref: "General Science", textbook_page_start: 56, textbook_page_end: 80, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000051", chapter_id: "c1000000-0000-0000-0000-000000000014", title: "Acids, Bases, Salts & Metals", description: "pH scale, neutralization, metallurgy, daily chemicals", estimated_minutes: 50, official_syllabus_ref: "SCI-04", textbook_ref: "General Science", textbook_page_start: 81, textbook_page_end: 105, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
    {
      id: "c1000000-0000-0000-0000-000000000015",
      subject_id: "s1000000-0000-0000-0000-000000000007",
      title: "Biology",
      description: "Cells, Human Physiology, Diseases and Genetics",
      order_index: 3,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000052", chapter_id: "c1000000-0000-0000-0000-000000000015", title: "Cell Structure & Genetics", description: "Organelles, mitosis, meiosis, DNA/RNA, heredity", estimated_minutes: 60, official_syllabus_ref: "SCI-05", textbook_ref: "General Science", textbook_page_start: 106, textbook_page_end: 130, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000053", chapter_id: "c1000000-0000-0000-0000-000000000015", title: "Human Systems, Diseases & Immunity", description: "Circulatory, nervous, vitamins, pathogens, vaccines", estimated_minutes: 75, official_syllabus_ref: "SCI-06", textbook_ref: "General Science", textbook_page_start: 131, textbook_page_end: 165, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
  ],
  "GK-APT": [
    {
      id: "c1000000-0000-0000-0000-000000000021",
      subject_id: "s1000000-0000-0000-0000-000000000011",
      title: "Reasoning & Quantitative Aptitude",
      description: "Logical, analytical, numerical reasoning and data analysis",
      order_index: 1,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000069", chapter_id: "c1000000-0000-0000-0000-000000000021", title: "Series & Coding-Decoding", description: "Number/alphabet series, patterns, substitution", estimated_minutes: 50, official_syllabus_ref: "APT-01", textbook_ref: "Mental Ability", textbook_page_start: 1, textbook_page_end: 25, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000070", chapter_id: "c1000000-0000-0000-0000-000000000021", title: "Time, Distance, Speed & Relations", description: "Relative speed, trains, blood relations, directions", estimated_minutes: 60, official_syllabus_ref: "APT-02", textbook_ref: "Mental Ability", textbook_page_start: 26, textbook_page_end: 50, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
  ],
  "GK-COMP": [
    {
      id: "c1000000-0000-0000-0000-000000000022",
      subject_id: "s1000000-0000-0000-0000-000000000009",
      title: "Computer Systems & Hardware Architecture",
      description: "CPU components, memory hierarchy, cache, and input/output peripherals",
      order_index: 1,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000071", chapter_id: "c1000000-0000-0000-0000-000000000022", title: "CPU Architecture & Memory Organization", description: "ALU, registers, cache levels L1/L2/L3, virtual memory and buses", estimated_minutes: 60, official_syllabus_ref: "COMP-01", textbook_ref: "Computer Knowledge", textbook_page_start: 1, textbook_page_end: 30, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000072", chapter_id: "c1000000-0000-0000-0000-000000000022", title: "Storage Devices & I/O Interfaces", description: "HDD, SSD, NVMe, USB protocols, PCI Express and DMA controllers", estimated_minutes: 45, official_syllabus_ref: "COMP-02", textbook_ref: "Computer Knowledge", textbook_page_start: 31, textbook_page_end: 55, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
    {
      id: "c1000000-0000-0000-0000-000000000023",
      subject_id: "s1000000-0000-0000-0000-000000000009",
      title: "Operating Systems & Networking",
      description: "Process management, threads, OSI model, TCP/IP stack and routing",
      order_index: 2,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000073", chapter_id: "c1000000-0000-0000-0000-000000000023", title: "Operating System Kernels & Scheduling", description: "Process scheduling algorithms, deadlocks, semaphores and paging", estimated_minutes: 75, official_syllabus_ref: "COMP-03", textbook_ref: "Computer Knowledge", textbook_page_start: 56, textbook_page_end: 90, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000074", chapter_id: "c1000000-0000-0000-0000-000000000023", title: "Computer Networks & Protocols", description: "OSI 7-layer model, TCP/UDP, IP addressing, DNS, HTTP/HTTPS and routers", estimated_minutes: 60, official_syllabus_ref: "COMP-04", textbook_ref: "Computer Knowledge", textbook_page_start: 91, textbook_page_end: 125, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
    {
      id: "c1000000-0000-0000-0000-000000000024",
      subject_id: "s1000000-0000-0000-0000-000000000009",
      title: "Data Structures, DBMS & Cyber Security",
      description: "Arrays, trees, graphs, relational schema, SQL and encryption standards",
      order_index: 3,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000075", chapter_id: "c1000000-0000-0000-0000-000000000024", title: "Relational DBMS & SQL Queries", description: "Normalization, ACID properties, joins, transactions and indexing", estimated_minutes: 60, official_syllabus_ref: "COMP-05", textbook_ref: "Computer Knowledge", textbook_page_start: 126, textbook_page_end: 160, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000076", chapter_id: "c1000000-0000-0000-0000-000000000024", title: "Information Security & Cryptography", description: "Symmetric/asymmetric ciphers, SSL/TLS, firewalls, malware and cyber ethics", estimated_minutes: 50, official_syllabus_ref: "COMP-06", textbook_ref: "Computer Knowledge", textbook_page_start: 161, textbook_page_end: 190, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
  ],
  "GATE-EM": [
    {
      id: "c1000000-0000-0000-0000-000000000025",
      subject_id: "s1000000-0000-0000-0000-000000000014",
      title: "Linear Algebra",
      description: "Matrix algebra, systems of linear equations, eigenvalues and eigenvectors",
      order_index: 1,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000077", chapter_id: "c1000000-0000-0000-0000-000000000025", title: "Matrices & Systems of Equations", description: "Rank of matrix, Gaussian elimination, consistency of linear equations", estimated_minutes: 60, official_syllabus_ref: "EM-01", textbook_ref: "Engineering Mathematics", textbook_page_start: 1, textbook_page_end: 35, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000078", chapter_id: "c1000000-0000-0000-0000-000000000025", title: "Eigenvalues & Cayley-Hamilton Theorem", description: "Characteristic equations, diagonalization, quadratic forms", estimated_minutes: 65, official_syllabus_ref: "EM-02", textbook_ref: "Engineering Mathematics", textbook_page_start: 36, textbook_page_end: 65, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
    {
      id: "c1000000-0000-0000-0000-000000000026",
      subject_id: "s1000000-0000-0000-0000-000000000014",
      title: "Calculus & Differential Equations",
      description: "Limits, continuity, partial derivatives, maxima/minima, first and higher order ODEs",
      order_index: 2,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000079", chapter_id: "c1000000-0000-0000-0000-000000000026", title: "Differential Calculus & Vector Calculus", description: "Mean value theorems, gradient, divergence, curl, line and surface integrals", estimated_minutes: 75, official_syllabus_ref: "EM-03", textbook_ref: "Engineering Mathematics", textbook_page_start: 66, textbook_page_end: 110, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000080", chapter_id: "c1000000-0000-0000-0000-000000000026", title: "Ordinary & Partial Differential Equations", description: "First order ODE, linear ODE with constant coefficients, Laplace transforms", estimated_minutes: 70, official_syllabus_ref: "EM-04", textbook_ref: "Engineering Mathematics", textbook_page_start: 111, textbook_page_end: 150, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
    {
      id: "c1000000-0000-0000-0000-000000000027",
      subject_id: "s1000000-0000-0000-0000-000000000014",
      title: "Probability & Statistics",
      description: "Conditional probability, Bayes theorem, random variables and probability distributions",
      order_index: 3,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000081", chapter_id: "c1000000-0000-0000-0000-000000000027", title: "Probability Distributions & Bayes Rule", description: "Discrete and continuous random variables, binomial, Poisson, normal distribution", estimated_minutes: 60, official_syllabus_ref: "EM-05", textbook_ref: "Engineering Mathematics", textbook_page_start: 151, textbook_page_end: 185, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
  ],
  "CE-STRUCT": [
    {
      id: "c1000000-0000-0000-0000-000000000028",
      subject_id: "s1000000-0000-0000-0000-000000000012",
      title: "Strength of Materials & Mechanics",
      description: "Stresses, strains, Mohr's circle, shear force and bending moment diagrams",
      order_index: 1,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000082", chapter_id: "c1000000-0000-0000-0000-000000000028", title: "Stress, Strain & Principal Stresses", description: "Axial loading, elastic constants, Mohr's stress circle and thin cylinders", estimated_minutes: 65, official_syllabus_ref: "STR-01", textbook_ref: "Structural Engineering", textbook_page_start: 1, textbook_page_end: 40, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000083", chapter_id: "c1000000-0000-0000-0000-000000000028", title: "Bending, Shear & Deflection of Beams", description: "Bending stress equation, shear center, conjugate beam and double integration", estimated_minutes: 70, official_syllabus_ref: "STR-02", textbook_ref: "Structural Engineering", textbook_page_start: 41, textbook_page_end: 85, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
    {
      id: "c1000000-0000-0000-0000-000000000029",
      subject_id: "s1000000-0000-0000-0000-000000000012",
      title: "Design of Concrete & Steel Structures",
      description: "Limit state method, beam/column design, trusses and connection design",
      order_index: 2,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000084", chapter_id: "c1000000-0000-0000-0000-000000000029", title: "Reinforced Concrete Design (IS 456)", description: "Singular/doubly reinforced beams, shear design, bond and columns", estimated_minutes: 75, official_syllabus_ref: "STR-03", textbook_ref: "Structural Engineering", textbook_page_start: 86, textbook_page_end: 130, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000085", chapter_id: "c1000000-0000-0000-0000-000000000029", title: "Steel Structures & Connections (IS 800)", description: "Bolted/welded connections, tension members, compression members, roof trusses", estimated_minutes: 60, official_syllabus_ref: "STR-04", textbook_ref: "Structural Engineering", textbook_page_start: 131, textbook_page_end: 170, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
  ],
  "CE-GEO": [
    {
      id: "c1000000-0000-0000-0000-000000000030",
      subject_id: "s1000000-0000-0000-0000-000000000013",
      title: "Soil Mechanics",
      description: "Index properties, permeability, effective stress, compaction and shear strength",
      order_index: 1,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000086", chapter_id: "c1000000-0000-0000-0000-000000000030", title: "Soil Properties & Classification", description: "Phase relationships, Atterberg limits, Indian Standard soil classification", estimated_minutes: 55, official_syllabus_ref: "GEO-01", textbook_ref: "Geotechnical Engineering", textbook_page_start: 1, textbook_page_end: 35, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000087", chapter_id: "c1000000-0000-0000-0000-000000000030", title: "Permeability, Compaction & Shear Strength", description: "Darcy's law, seepage, Proctor test, Mohr-Coulomb failure criterion", estimated_minutes: 65, official_syllabus_ref: "GEO-02", textbook_ref: "Geotechnical Engineering", textbook_page_start: 36, textbook_page_end: 80, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
    {
      id: "c1000000-0000-0000-0000-000000000031",
      subject_id: "s1000000-0000-0000-0000-000000000013",
      title: "Foundation Engineering & Surveying",
      description: "Shallow and deep foundations, bearing capacity, levelling and total station",
      order_index: 2,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000088", chapter_id: "c1000000-0000-0000-0000-000000000031", title: "Bearing Capacity & Deep Foundations", description: "Terzaghi theory, Meyerhof equation, pile load capacity and settlement", estimated_minutes: 65, official_syllabus_ref: "GEO-03", textbook_ref: "Geotechnical Engineering", textbook_page_start: 81, textbook_page_end: 120, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000089", chapter_id: "c1000000-0000-0000-0000-000000000031", title: "Surveying, Levelling & Contouring", description: "Chain/compass surveying, levelling techniques, curves, GIS & GPS basics", estimated_minutes: 55, official_syllabus_ref: "GEO-04", textbook_ref: "Geotechnical Engineering", textbook_page_start: 121, textbook_page_end: 160, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
  ],
  "GK-ENV": [
    {
      id: "c1000000-0000-0000-0000-000000000032",
      subject_id: "s1000000-0000-0000-0000-000000000004",
      title: "Ecology & Biodiversity Conservation",
      description: "Ecosystem structure, food webs, ecological succession and conservation reserves",
      order_index: 1,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000090", chapter_id: "c1000000-0000-0000-0000-000000000032", title: "Ecosystem Fundamentals & Biogeochemical Cycles", description: "Food chains, trophic levels, carbon and nitrogen cycles, ecological pyramids", estimated_minutes: 50, official_syllabus_ref: "ENV-01", textbook_ref: "Environment & Ecology", textbook_page_start: 1, textbook_page_end: 30, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000091", chapter_id: "c1000000-0000-0000-0000-000000000032", title: "Biodiversity Hotspots & Wildlife Protection", description: "National parks, biosphere reserves, IUCN Red List categories, Wildlife Act 1972", estimated_minutes: 60, official_syllabus_ref: "ENV-02", textbook_ref: "Environment & Ecology", textbook_page_start: 31, textbook_page_end: 65, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
    {
      id: "c1000000-0000-0000-0000-000000000033",
      subject_id: "s1000000-0000-0000-0000-000000000004",
      title: "Climate Change, Pollution & Global Treaties",
      description: "Greenhouse effect, air/water pollution acts, UNFCCC, Kyoto and Paris accords",
      order_index: 2,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000092", chapter_id: "c1000000-0000-0000-0000-000000000033", title: "Environmental Pollution & Control Acts", description: "AQI parameters, biomagnification, solid waste management, EPA 1986", estimated_minutes: 50, official_syllabus_ref: "ENV-03", textbook_ref: "Environment & Ecology", textbook_page_start: 66, textbook_page_end: 100, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000093", chapter_id: "c1000000-0000-0000-0000-000000000033", title: "Global Climate Summits & Renewable Energy", description: "COP summits, Net Zero targets, ISA, solar/wind missions in India", estimated_minutes: 55, official_syllabus_ref: "ENV-04", textbook_ref: "Environment & Ecology", textbook_page_start: 101, textbook_page_end: 135, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
  ],
  "GK-ECON": [
    {
      id: "c1000000-0000-0000-0000-000000000034",
      subject_id: "s1000000-0000-0000-0000-000000000006",
      title: "Macroeconomics & Banking System",
      description: "National income, inflation indices, RBI monetary policy and financial institutions",
      order_index: 1,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000094", chapter_id: "c1000000-0000-0000-0000-000000000034", title: "National Income & Inflation Dynamics", description: "GDP, GNP, NNP calculations, CPI, WPI, headline vs core inflation", estimated_minutes: 60, official_syllabus_ref: "ECON-01", textbook_ref: "Indian Economy", textbook_page_start: 1, textbook_page_end: 35, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000095", chapter_id: "c1000000-0000-0000-0000-000000000034", title: "Monetary Policy & Commercial Banking", description: "Repo, Reverse Repo, CRR, SLR, NPA resolution and digital banking systems", estimated_minutes: 60, official_syllabus_ref: "ECON-02", textbook_ref: "Indian Economy", textbook_page_start: 36, textbook_page_end: 75, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
    {
      id: "c1000000-0000-0000-0000-000000000035",
      subject_id: "s1000000-0000-0000-0000-000000000006",
      title: "Public Finance, Budget & Planning",
      description: "Union budget, taxation system, fiscal deficit, balance of payments and NITI Aayog",
      order_index: 2,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000096", chapter_id: "c1000000-0000-0000-0000-000000000035", title: "Union Budget & Fiscal Policy", description: "Revenue and capital receipts, GST slabs, direct taxes and FRBM Act", estimated_minutes: 55, official_syllabus_ref: "ECON-03", textbook_ref: "Indian Economy", textbook_page_start: 76, textbook_page_end: 110, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000097", chapter_id: "c1000000-0000-0000-0000-000000000035", title: "External Sector & Economic Reforms", description: "FDI, FPI, forex reserves, balance of payments, WTO and 1991 LPG reforms", estimated_minutes: 50, official_syllabus_ref: "ECON-04", textbook_ref: "Indian Economy", textbook_page_start: 111, textbook_page_end: 145, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
  ],
  "GK-SCITECH": [
    {
      id: "c1000000-0000-0000-0000-000000000036",
      subject_id: "s1000000-0000-0000-0000-000000000008",
      title: "Space & Nuclear Technology",
      description: "ISRO space exploration, satellite orbits, launch vehicles and India's nuclear program",
      order_index: 1,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000098", chapter_id: "c1000000-0000-0000-0000-000000000036", title: "Indian Space Programme & Satellite Missions", description: "PSLV, GSLV, LVM3, Chandrayaan, Aditya-L1, Gaganyaan and NavIC navigation", estimated_minutes: 60, official_syllabus_ref: "ST-01", textbook_ref: "Science & Technology", textbook_page_start: 1, textbook_page_end: 35, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000099", chapter_id: "c1000000-0000-0000-0000-000000000036", title: "Defence Systems & Nuclear Reactors", description: "Integrated Guided Missile Programme (Agni, Prithvi), BARC, NPCIL, fast breeder reactors", estimated_minutes: 55, official_syllabus_ref: "ST-02", textbook_ref: "Science & Technology", textbook_page_start: 36, textbook_page_end: 70, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
    {
      id: "c1000000-0000-0000-0000-000000000037",
      subject_id: "s1000000-0000-0000-0000-000000000008",
      title: "Biotechnology, AI & Emerging Technologies",
      description: "Recombinant DNA, vaccines, artificial intelligence, quantum computing and nanotechnology",
      order_index: 2,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000100", chapter_id: "c1000000-0000-0000-0000-000000000037", title: "Biotechnology & Gene Editing", description: "CRISPR-Cas9, stem cell therapy, genetically modified crops, biosafety guidelines", estimated_minutes: 50, official_syllabus_ref: "ST-03", textbook_ref: "Science & Technology", textbook_page_start: 71, textbook_page_end: 105, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000101", chapter_id: "c1000000-0000-0000-0000-000000000037", title: "Artificial Intelligence, Quantum & Semiconductors", description: "Generative AI, India Semiconductor Mission, 5G/6G communication and cybersecurity", estimated_minutes: 55, official_syllabus_ref: "ST-04", textbook_ref: "Science & Technology", textbook_page_start: 106, textbook_page_end: 140, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
  ],
  "GK-STATIC": [
    {
      id: "c1000000-0000-0000-0000-000000000038",
      subject_id: "s1000000-0000-0000-0000-000000000010",
      title: "Organizations, Honours & Records",
      description: "International bodies, national awards, books & authors, sports trophies and venues",
      order_index: 1,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000102", chapter_id: "c1000000-0000-0000-0000-000000000038", title: "International Bodies & Summits", description: "UN, WHO, IMF, World Bank, WTO, INTERPOL headquarters, mandates and memberships", estimated_minutes: 45, official_syllabus_ref: "STAT-01", textbook_ref: "Static GK", textbook_page_start: 1, textbook_page_end: 35, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000103", chapter_id: "c1000000-0000-0000-0000-000000000038", title: "National Honours, Sports & World Records", description: "Bharat Ratna, Padma awards, Nobel laureates, Olympics, Asian Games and national symbols", estimated_minutes: 45, official_syllabus_ref: "STAT-02", textbook_ref: "Static GK", textbook_page_start: 36, textbook_page_end: 70, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
  ],
  "GK-CA": [
    {
      id: "c1000000-0000-0000-0000-000000000039",
      subject_id: "s1000000-0000-0000-0000-000000000001",
      title: "National & Global Affairs",
      description: "Government schemes, summits, bilateral agreements, rankings and indices",
      order_index: 1,
      is_published: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      topics: [
        { id: "t1000000-0000-0000-0000-000000000104", chapter_id: "c1000000-0000-0000-0000-000000000039", title: "National Policies, Schemes & Portals", description: "PM Gati Shakti, Ayushman Bharat, Digital India, infrastructure projects and indices", estimated_minutes: 50, official_syllabus_ref: "CA-01", textbook_ref: "Current Affairs", textbook_page_start: 1, textbook_page_end: 40, order_index: 1, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
        { id: "t1000000-0000-0000-0000-000000000105", chapter_id: "c1000000-0000-0000-0000-000000000039", title: "Bilateral Summits & Global Indices", description: "G20, BRICS, SCO meetings, Global Innovation Index, HDI and defense exercises", estimated_minutes: 50, official_syllabus_ref: "CA-02", textbook_ref: "Current Affairs", textbook_page_start: 41, textbook_page_end: 80, order_index: 2, is_published: true, is_personal: false, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
      ],
    },
  ],
};

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
      // Fallback: If no explicit mapping found in DB, accurately map subjects by exam code
      const examCode = exam?.code || "";
      let targetCodes: string[] = [];

      if (examCode === "GATE-CS") {
        targetCodes = ["GATE-EM", "GK-COMP", "GK-APT", "GK-SCITECH"];
      } else if (examCode === "GATE-CE") {
        targetCodes = ["GATE-EM", "CE-STRUCT", "CE-GEO", "GK-APT"];
      } else if (examCode === "KAS-GS" || exam?.category === "KAS") {
        targetCodes = ["GK-HIST", "GK-GEOG", "GK-POLITY", "GK-ECON", "GK-ENV", "GK-APT"];
      } else if (examCode === "UPSC-CSE" || exam?.category === "UPSC") {
        targetCodes = ["GK-HIST", "GK-GEOG", "GK-POLITY", "GK-ECON", "GK-ENV", "GK-SCITECH", "GK-CA", "GK-APT"];
      } else if (examCode === "RRB-NTPC" || exam?.category === "Railway") {
        targetCodes = ["GK-STATIC", "GK-SCI", "GK-APT", "GK-CA"];
      } else if (examCode === "KEA-LS") {
        targetCodes = ["CE-GEO", "GATE-EM", "GK-POLITY", "GK-APT"];
      } else if (examCode === "KEA-VAO" || examCode === "KEA-SDA") {
        targetCodes = ["GK-POLITY", "GK-HIST", "GK-COMP", "GK-APT"];
      } else if (examCode === "KEA-FDA") {
        targetCodes = ["GK-POLITY", "GK-ECON", "GK-GEOG", "GK-APT"];
      } else if (examCode === "AE-CIVIL" || exam?.category === "AE Civil Engineering") {
        targetCodes = ["CE-STRUCT", "CE-GEO", "GATE-EM", "GK-POLITY"];
      } else if (examCode === "GK-CORE" || exam?.category === "General Knowledge") {
        targetCodes = ["GK-HIST", "GK-GEOG", "GK-POLITY", "GK-ECON", "GK-ENV", "GK-SCI", "GK-SCITECH", "GK-COMP", "GK-STATIC", "GK-CA", "GK-APT"];
      } else {
        targetCodes = ["GK-HIST", "GK-POLITY", "GK-GEOG", "GK-APT", "GK-COMP"];
      }

      subjects = FALLBACK_SUBJECTS.filter((s) => targetCodes.includes(s.code));
    }

    // 3. For each subject, fetch Chapters and Topics
    for (const subject of subjects) {
      const { data: chaptersData } = await supabase
        .from("chapters")
        .select("*")
        .eq("subject_id", subject.id)
        .eq("is_published", true)
        .order("order_index", { ascending: true });

      let chapters: Chapter[] = (chaptersData as Chapter[]) || [];

      // If remote chapters table is empty for this subject, load structured fallback chapters & topics
      if (!chapters || chapters.length === 0) {
        const fallbackList = BOOK_CHAPTERS_FALLBACK[subject.code] || BOOK_CHAPTERS_FALLBACK[subject.id] || [];
        chapters = JSON.parse(JSON.stringify(fallbackList));
      } else {
        for (const chapter of chapters) {
          const { data: topicsData } = await supabase
            .from("topics")
            .select("*")
            .eq("chapter_id", chapter.id)
            .eq("is_published", true)
            .order("order_index", { ascending: true });

          chapter.topics = (topicsData as Topic[]) || [];
        }
      }

      // Merge personal topics from local store
      try {
        const chapterIds = chapters.map((c) => c.id);
        const personalTopics = await getStoredPersonalTopics(chapterIds);
        if (personalTopics.length > 0) {
          const personalByChap = new Map<string, Topic[]>();
          personalTopics.forEach((pt) => {
            if (pt.chapter_id) {
              const list = personalByChap.get(pt.chapter_id) || [];
              list.push(pt);
              personalByChap.set(pt.chapter_id, list);
            }
          });
          chapters.forEach((chap) => {
            const extra = personalByChap.get(chap.id);
            if (extra && extra.length > 0) {
              const existingIds = new Set((chap.topics || []).map((t) => t.id));
              const newExtra = extra.filter((t) => !existingIds.has(t.id));
              chap.topics = [...(chap.topics || []), ...newExtra];
            }
          });
        }
      } catch {}

      // Fetch and attach topic progress (merges Supabase data with resilient local store)
      const allTopicIds: string[] = [];
      chapters.forEach((chap) => {
        (chap.topics || []).forEach((top) => {
          if (top.id) allTopicIds.push(top.id);
        });
      });

      if (allTopicIds.length > 0) {
        let progressList: TopicProgress[] = [];
        try {
          const { data: progressData, error } = await supabase
            .from("topic_progress")
            .select("*")
            .in("topic_id", allTopicIds);

          if (!error && progressData && progressData.length > 0) {
            progressList = progressData as TopicProgress[];
          }
        } catch {
          // allow fallback
        }

        const localProgress = await getStoredTopicProgress(studentId, allTopicIds);
        const progressMap = new Map<string, TopicProgress>();
        localProgress.forEach((p) => progressMap.set(p.topic_id, p));
        progressList.forEach((p) => progressMap.set(p.topic_id, p));

        if (progressMap.size > 0) {
          chapters.forEach((chap) => {
            (chap.topics || []).forEach((top) => {
              top.progress = progressMap.get(top.id) as TopicProgress | undefined;
            });
          });
        }
      }

      subject.chapters = chapters;
    }

    return { exam, subjects };
  } catch {
    const exam = FALLBACK_EXAMS.find((e) => e.id === examId) || FALLBACK_EXAMS[0];
    const examCode = exam?.code || "";
    let targetCodes = ["GK-HIST", "GK-POLITY", "GK-GEOG", "GK-APT", "GK-COMP"];

    if (examCode === "GATE-CS") {
      targetCodes = ["GATE-EM", "GK-COMP", "GK-APT", "GK-SCITECH"];
    } else if (examCode === "GATE-CE") {
      targetCodes = ["GATE-EM", "CE-STRUCT", "CE-GEO", "GK-APT"];
    } else if (examCode === "KAS-GS" || exam?.category === "KAS") {
      targetCodes = ["GK-HIST", "GK-GEOG", "GK-POLITY", "GK-ECON", "GK-ENV", "GK-APT"];
    } else if (examCode === "UPSC-CSE" || exam?.category === "UPSC") {
      targetCodes = ["GK-HIST", "GK-GEOG", "GK-POLITY", "GK-ECON", "GK-ENV", "GK-SCITECH", "GK-CA", "GK-APT"];
    } else if (examCode === "RRB-NTPC" || exam?.category === "Railway") {
      targetCodes = ["GK-STATIC", "GK-SCI", "GK-APT", "GK-CA"];
    } else if (examCode === "KEA-LS") {
      targetCodes = ["CE-GEO", "GATE-EM", "GK-POLITY", "GK-APT"];
    } else if (examCode === "KEA-VAO" || examCode === "KEA-SDA") {
      targetCodes = ["GK-POLITY", "GK-HIST", "GK-COMP", "GK-APT"];
    } else if (examCode === "KEA-FDA") {
      targetCodes = ["GK-POLITY", "GK-ECON", "GK-GEOG", "GK-APT"];
    } else if (examCode === "AE-CIVIL" || exam?.category === "AE Civil Engineering") {
      targetCodes = ["CE-STRUCT", "CE-GEO", "GATE-EM", "GK-POLITY"];
    } else if (examCode === "GK-CORE" || exam?.category === "General Knowledge") {
      targetCodes = ["GK-HIST", "GK-GEOG", "GK-POLITY", "GK-ECON", "GK-ENV", "GK-SCI", "GK-SCITECH", "GK-COMP", "GK-STATIC", "GK-CA", "GK-APT"];
    }

    const subjects = FALLBACK_SUBJECTS
      .filter((s) => targetCodes.includes(s.code))
      .map((s) => ({
        ...s,
        chapters: JSON.parse(JSON.stringify(BOOK_CHAPTERS_FALLBACK[s.code] || [])),
      }));

    // Attach stored personal topics and progress to fallback subjects
    try {
      const allTopicIds: string[] = [];
      const chapterIds: string[] = [];
      subjects.forEach((subj) => {
        (subj.chapters || []).forEach((c: Chapter) => {
          chapterIds.push(c.id);
          (c.topics || []).forEach((t: Topic) => {
            if (t.id) allTopicIds.push(t.id);
          });
        });
      });

      const personalTopics = await getStoredPersonalTopics(chapterIds);
      if (personalTopics.length > 0) {
        subjects.forEach((subj) => {
          (subj.chapters || []).forEach((c: Chapter) => {
            const extra = personalTopics.filter((pt) => pt.chapter_id === c.id);
            if (extra.length > 0) {
              const existingIds = new Set((c.topics || []).map((t: Topic) => t.id));
              const newExtra = extra.filter((t) => !existingIds.has(t.id));
              c.topics = [...(c.topics || []), ...newExtra];
              newExtra.forEach((t) => allTopicIds.push(t.id));
            }
          });
        });
      }

      const storedProg = await getStoredTopicProgress(studentId, allTopicIds);
      if (storedProg.length > 0) {
        const progMap = new Map(storedProg.map((p) => [p.topic_id, p]));
        subjects.forEach((subj) => {
          (subj.chapters || []).forEach((c: Chapter) => {
            (c.topics || []).forEach((t: Topic) => {
              t.progress = progMap.get(t.id);
            });
          });
        });
      }
    } catch {}

    return { exam, subjects };
  }
}

export async function getStudentTasks(
  studentId: string,
  filterStatus?: string
): Promise<StudyTask[]> {
  let tasks: StudyTask[] = [];
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
    if (!error && data && data.length > 0) {
      tasks = data as StudyTask[];
    }
  } catch {}

  if (tasks.length === 0) {
    const localTasks = await getStoredTasks(studentId);
    let filtered = localTasks;
    if (filterStatus && filterStatus !== "All") {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }
    tasks = filtered.map((t) => ({
      ...t,
      exam: t.exam_id ? FALLBACK_EXAMS.find((e) => e.id === t.exam_id) : undefined,
      subject: t.subject_id ? FALLBACK_SUBJECTS.find((s) => s.id === t.subject_id) : undefined,
    }));
  }
  return tasks;
}

export async function getStudentRoutines(studentId: string): Promise<RoutineTemplate[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("routine_templates")
      .select("*, exam:exams(*), subject:subjects(*)")
      .eq("student_id", studentId)
      .order("start_time", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as RoutineTemplate[];
    }

    const localRoutines = await getStoredRoutines(studentId);
    return localRoutines.map((r) => ({
      ...r,
      exam: r.exam_id ? FALLBACK_EXAMS.find((e) => e.id === r.exam_id) : undefined,
      subject: r.subject_id ? FALLBACK_SUBJECTS.find((s) => s.id === r.subject_id) : undefined,
    }));
  } catch {
    const localRoutines = await getStoredRoutines(studentId);
    return localRoutines.map((r) => ({
      ...r,
      exam: r.exam_id ? FALLBACK_EXAMS.find((e) => e.id === r.exam_id) : undefined,
      subject: r.subject_id ? FALLBACK_SUBJECTS.find((s) => s.id === r.subject_id) : undefined,
    }));
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

    if (!error && data) {
      return data as StudyPreferences;
    }
  } catch {}

  const stored = await getStoredPreferences(studentId);
  return stored || defaultPrefs;
}

export const DEFAULT_EXAM_SCHEDULE_EVENTS: ExamScheduleEvent[] = [
  {
    id: "ev-1",
    exam_id: "e1000000-0000-0000-0000-000000000001",
    title: "GATE 2026 — Civil Engineering Examination",
    event_type: "Official Examination",
    description: "Official Computer Based Test (CBT) for GATE 2026 CE discipline.",
    start_date: "2026-02-14",
    end_date: "2026-02-14",
    official_source_url: "https://gate2026.iit.ac.in",
    verification_date: "2026-01-01",
    is_active: true,
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "ev-2",
    exam_id: "e1000000-0000-0000-0000-000000000003",
    title: "KAS Prelims 2026 — General Studies Examination",
    event_type: "Official Examination",
    description: "KPSC Gazetted Probationers Preliminary Examination Paper 1 & 2.",
    start_date: "2026-06-20",
    end_date: "2026-06-20",
    official_source_url: "https://kpsc.kar.nic.in",
    verification_date: "2026-01-01",
    is_active: true,
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "ev-3",
    exam_id: "e1000000-0000-0000-0000-000000000004",
    title: "UPSC CSE Prelims 2026 — GS Paper I & CSAT",
    event_type: "Official Examination",
    description: "Union Public Service Commission Civil Services Preliminary Examination.",
    start_date: "2026-05-24",
    end_date: "2026-05-24",
    official_source_url: "https://upsc.gov.in",
    verification_date: "2026-01-01",
    is_active: true,
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

export async function getExamScheduleEvents(examIds?: string[]): Promise<ExamScheduleEvent[]> {
  const storedEvents = await getStoredExamEvents(examIds);
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
    if (error || !data || data.length === 0) {
      let merged = [...DEFAULT_EXAM_SCHEDULE_EVENTS];
      if (examIds && examIds.length > 0) {
        merged = merged.filter((ev) => examIds.includes(ev.exam_id));
      }
      storedEvents.forEach((sev) => {
        if (!merged.some((e) => e.id === sev.id)) {
          merged.push(sev);
        }
      });
      return merged;
    }
    const combined = [...(data as ExamScheduleEvent[])];
    storedEvents.forEach((sev) => {
      if (!combined.some((e) => e.id === sev.id)) {
        combined.push(sev);
      }
    });
    return combined;
  } catch {
    let merged = [...DEFAULT_EXAM_SCHEDULE_EVENTS];
    if (examIds && examIds.length > 0) {
      merged = merged.filter((ev) => examIds.includes(ev.exam_id));
    }
    storedEvents.forEach((sev) => {
      if (!merged.some((e) => e.id === sev.id)) {
        merged.push(sev);
      }
    });
    return merged;
  }
}

export async function getStudentRevisions(studentId: string): Promise<RevisionSchedule[]> {
  const storedRevisions = await getStoredRevisionSchedules(studentId);
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("revision_schedules")
      .select("*, topic:topics(*)")
      .eq("student_id", studentId)
      .order("scheduled_date", { ascending: true });

    if (error || !data || data.length === 0) {
      return storedRevisions;
    }
    return data as RevisionSchedule[];
  } catch {
    return storedRevisions;
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

    if (!error && data && data.length > 0) {
      return data as PersonalNote[];
    }
  } catch {}

  return await getStoredPersonalNotes(studentId);
}
