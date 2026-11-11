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
