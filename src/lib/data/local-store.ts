import "server-only";
import fs from "fs";
import path from "path";
import type {
  StudyTask,
  StudyPreferences,
  Topic,
  TopicProgress,
  PersonalNote,
  StudentNotification,
  NotificationCategory,
  ExamAttempt,
  ExamAttemptQuestion,
  ExamAttemptAnswer,
  ExamResult,
  Exam,
  StudentExam,
  Question,
  ExamScheduleEvent,
  RevisionSchedule,
  PracticeSession,
} from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), ".data");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filename: string, defaultValue: T): T {
  try {
    ensureDirectoryExists();
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[LocalStore] Failed to read ${filename}:`, err);
    return defaultValue;
  }
}

function writeJsonFile<T>(filename: string, data: T): void {
  try {
    ensureDirectoryExists();
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`[LocalStore] Failed to write ${filename}:`, err);
  }
}

// ===========================================================================
// 1. STUDY TASKS STORE
// ===========================================================================

const TASKS_FILE = "study_tasks.json";

export async function getStoredTasks(studentId: string): Promise<StudyTask[]> {
  const all = readJsonFile<StudyTask[]>(TASKS_FILE, []);
  return all.filter((t) => t.student_id === studentId);
}

export async function saveStoredTask(task: StudyTask): Promise<void> {
  const all = readJsonFile<StudyTask[]>(TASKS_FILE, []);
  const idx = all.findIndex((t) => t.id === task.id);
  if (idx >= 0) {
    all[idx] = task;
  } else {
    all.push(task);
  }
  writeJsonFile(TASKS_FILE, all);
}

export async function saveStoredTasks(tasks: StudyTask[]): Promise<void> {
  const all = readJsonFile<StudyTask[]>(TASKS_FILE, []);
  for (const t of tasks) {
    const idx = all.findIndex((existing) => existing.id === t.id);
    if (idx >= 0) {
      all[idx] = t;
    } else {
      all.push(t);
    }
  }
  writeJsonFile(TASKS_FILE, all);
}

export async function updateStoredTask(
  taskId: string,
  studentId: string,
  updates: Partial<StudyTask>
): Promise<void> {
  const all = readJsonFile<StudyTask[]>(TASKS_FILE, []);
  const idx = all.findIndex((t) => t.id === taskId && t.student_id === studentId);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates, updated_at: new Date().toISOString() };
    writeJsonFile(TASKS_FILE, all);
  }
}

export async function deleteStoredTask(taskId: string, studentId: string): Promise<void> {
  const all = readJsonFile<StudyTask[]>(TASKS_FILE, []);
  const filtered = all.filter((t) => !(t.id === taskId && t.student_id === studentId));
  writeJsonFile(TASKS_FILE, filtered);
}

// ===========================================================================
// 2. STUDY PREFERENCES STORE
// ===========================================================================

const PREFS_FILE = "study_preferences.json";

export async function getStoredPreferences(studentId: string): Promise<StudyPreferences | null> {
  const all = readJsonFile<StudyPreferences[]>(PREFS_FILE, []);
  return all.find((p) => p.student_id === studentId) || null;
}

export async function saveStoredPreferences(prefs: StudyPreferences): Promise<void> {
  const all = readJsonFile<StudyPreferences[]>(PREFS_FILE, []);
  const idx = all.findIndex((p) => p.student_id === prefs.student_id);
  if (idx >= 0) {
    all[idx] = prefs;
  } else {
    all.push(prefs);
  }
  writeJsonFile(PREFS_FILE, all);
}

// ===========================================================================
// 3. TOPIC PROGRESS STORE
// ===========================================================================

const PROGRESS_FILE = "topic_progress.json";

export async function getStoredTopicProgress(
  studentId?: string,
  topicIds?: string[]
): Promise<TopicProgress[]> {
  const all = readJsonFile<TopicProgress[]>(PROGRESS_FILE, []);
  let list = all;
  if (studentId) {
    list = all.filter((p) => !p.student_id || p.student_id === studentId);
  }
  if (topicIds && topicIds.length > 0) {
    const set = new Set(topicIds);
    list = list.filter((p) => set.has(p.topic_id));
  }
  return list;
}

export async function saveStoredTopicProgress(progress: TopicProgress): Promise<void> {
  const all = readJsonFile<TopicProgress[]>(PROGRESS_FILE, []);
  const idx = all.findIndex(
    (p) =>
      p.topic_id === progress.topic_id &&
      (p.exam_id === progress.exam_id || (!p.exam_id && !progress.exam_id))
  );
  if (idx >= 0) {
    all[idx] = progress;
  } else {
    all.push(progress);
  }
  writeJsonFile(PROGRESS_FILE, all);
}

// ===========================================================================
// 4. PERSONAL TOPICS STORE
// ===========================================================================

const PERSONAL_TOPICS_FILE = "personal_topics.json";

export async function getStoredPersonalTopics(chapterIds?: string[]): Promise<Topic[]> {
  const all = readJsonFile<Topic[]>(PERSONAL_TOPICS_FILE, []);
  if (chapterIds && chapterIds.length > 0) {
    const set = new Set(chapterIds);
    return all.filter((t) => t.chapter_id && set.has(t.chapter_id));
  }
  return all;
}

export async function saveStoredPersonalTopic(topic: Topic): Promise<void> {
  const all = readJsonFile<Topic[]>(PERSONAL_TOPICS_FILE, []);
  const idx = all.findIndex((t) => t.id === topic.id);
  if (idx >= 0) {
    all[idx] = topic;
  } else {
    all.push(topic);
  }
  writeJsonFile(PERSONAL_TOPICS_FILE, all);
}

// ===========================================================================
// 5. PERSONAL NOTES STORE
// ===========================================================================

const NOTES_FILE = "personal_notes.json";

export async function getStoredPersonalNotes(studentId: string): Promise<PersonalNote[]> {
  const all = readJsonFile<PersonalNote[]>(NOTES_FILE, []);
  return all.filter((n) => n.student_id === studentId);
}

export async function saveStoredPersonalNote(note: PersonalNote): Promise<void> {
  const all = readJsonFile<PersonalNote[]>(NOTES_FILE, []);
  const idx = all.findIndex((n) => n.id === note.id);
  if (idx >= 0) {
    all[idx] = note;
  } else {
    all.push(note);
  }
  writeJsonFile(NOTES_FILE, all);
}

export async function deleteStoredPersonalNote(noteId: string, studentId: string): Promise<void> {
  const all = readJsonFile<PersonalNote[]>(NOTES_FILE, []);
  const filtered = all.filter((n) => !(n.id === noteId && n.student_id === studentId));
  writeJsonFile(NOTES_FILE, filtered);
}

// ===========================================================================
// 6. QUESTION BOOKMARKS STORE
// ===========================================================================

const BOOKMARKS_FILE = "question_bookmarks.json";

interface StoredBookmark {
  id: string;
  student_id: string;
  question_id: string;
  created_at: string;
}

export async function getStoredBookmarks(studentId: string): Promise<string[]> {
  const all = readJsonFile<StoredBookmark[]>(BOOKMARKS_FILE, []);
  return all.filter((b) => b.student_id === studentId).map((b) => b.question_id);
}

export async function toggleStoredBookmark(studentId: string, questionId: string): Promise<boolean> {
  const all = readJsonFile<StoredBookmark[]>(BOOKMARKS_FILE, []);
  const idx = all.findIndex((b) => b.student_id === studentId && b.question_id === questionId);
  if (idx >= 0) {
    all.splice(idx, 1);
    writeJsonFile(BOOKMARKS_FILE, all);
    return false; // unbookmarked
  } else {
    all.push({
      id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      student_id: studentId,
      question_id: questionId,
      created_at: new Date().toISOString(),
    });
    writeJsonFile(BOOKMARKS_FILE, all);
    return true; // bookmarked
  }
}

// ===========================================================================
// 7. NOTIFICATIONS STORE
// ===========================================================================

const NOTIFICATIONS_FILE = "student_notifications.json";

function getSeedNotifications(studentId: string): StudentNotification[] {
  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();

  return [
    {
      id: "notif-seed-1",
      student_id: studentId,
      category: "admin_announcement",
      title: "Welcome to PrepTrack Workspace",
      message: "Your personal examination preparation system is configured. Track your syllabus, routines, and mock examinations.",
      link: "/dashboard",
      is_read: false,
      entity_type: null,
      entity_id: null,
      created_at: hoursAgo(1),
    },
    {
      id: "notif-seed-2",
      student_id: studentId,
      category: "upcoming_task",
      title: "Daily Study Routine Active",
      message: "Check your recurring daily study slots in Daily Routine & Tasks to stay on schedule.",
      link: "/routine",
      is_read: false,
      entity_type: null,
      entity_id: null,
      created_at: hoursAgo(4),
    },
    {
      id: "notif-seed-3",
      student_id: studentId,
      category: "recommendation",
      title: "Syllabus Tracker Ready",
      message: "Review curriculum topics across GATE, KAS, UPSC, Railway, and KEA examinations.",
      link: "/syllabus",
      is_read: false,
      entity_type: null,
      entity_id: null,
      created_at: hoursAgo(12),
    },
    {
      id: "notif-seed-4",
      student_id: studentId,
      category: "upcoming_exam",
      title: "Upcoming Exam Dates",
      message: "Check exam dates and notification updates in your Calendar & Exam Dates tracker.",
      link: "/calendar",
      is_read: true,
      entity_type: null,
      entity_id: null,
      created_at: hoursAgo(24),
    },
  ];
}

export async function getStoredNotifications(studentId: string): Promise<StudentNotification[]> {
  let all = readJsonFile<StudentNotification[]>(NOTIFICATIONS_FILE, []);
  let userNotifs = all.filter((n) => n.student_id === studentId);
  if (userNotifs.length === 0) {
    const seed = getSeedNotifications(studentId);
    all = [...all, ...seed];
    writeJsonFile(NOTIFICATIONS_FILE, all);
    userNotifs = seed;
  }
  return userNotifs.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function markStoredNotificationRead(
  studentId: string,
  notificationId?: string
): Promise<void> {
  const all = readJsonFile<StudentNotification[]>(NOTIFICATIONS_FILE, []);
  if (notificationId) {
    const match = all.find((n) => n.id === notificationId && n.student_id === studentId);
    if (match) match.is_read = true;
  } else {
    all.forEach((n) => {
      if (n.student_id === studentId) n.is_read = true;
    });
  }
  writeJsonFile(NOTIFICATIONS_FILE, all);
}

export async function deleteStoredNotification(
  studentId: string,
  notificationId: string
): Promise<void> {
  const all = readJsonFile<StudentNotification[]>(NOTIFICATIONS_FILE, []);
  const filtered = all.filter((n) => !(n.id === notificationId && n.student_id === studentId));
  writeJsonFile(NOTIFICATIONS_FILE, filtered);
}

// ===========================================================================
// 8. EXAM ATTEMPTS, QUESTIONS & ANSWERS STORE
// ===========================================================================

const ATTEMPTS_FILE = "exam_attempts.json";

export interface StoredAttemptData {
  attempt: ExamAttempt;
  questions: ExamAttemptQuestion[];
  answers: ExamAttemptAnswer[];
  result?: ExamResult | null;
}

export async function getStoredExamAttempts(studentId?: string): Promise<ExamAttempt[]> {
  const all = readJsonFile<StoredAttemptData[]>(ATTEMPTS_FILE, []);
  let list = all.map((d) => d.attempt);
  if (studentId) {
    list = list.filter((a) => a.student_id === studentId);
  }
  return list.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
}

export async function getStoredExamAttemptById(attemptId: string): Promise<StoredAttemptData | null> {
  const all = readJsonFile<StoredAttemptData[]>(ATTEMPTS_FILE, []);
  return all.find((d) => d.attempt.id === attemptId) || null;
}

export async function saveStoredExamAttempt(
  attempt: ExamAttempt,
  questions: ExamAttemptQuestion[] = []
): Promise<void> {
  const all = readJsonFile<StoredAttemptData[]>(ATTEMPTS_FILE, []);
  const idx = all.findIndex((d) => d.attempt.id === attempt.id);
  if (idx >= 0) {
    all[idx].attempt = attempt;
    if (questions.length > 0) all[idx].questions = questions;
  } else {
    all.push({
      attempt,
      questions,
      answers: [],
      result: null,
    });
  }
  writeJsonFile(ATTEMPTS_FILE, all);
}

export async function saveStoredExamAnswer(
  attemptId: string,
  answer: ExamAttemptAnswer
): Promise<void> {
  const all = readJsonFile<StoredAttemptData[]>(ATTEMPTS_FILE, []);
  const item = all.find((d) => d.attempt.id === attemptId);
  if (item) {
    const ansIdx = item.answers.findIndex(
      (a) => a.attempt_question_id === answer.attempt_question_id
    );
    if (ansIdx >= 0) {
      item.answers[ansIdx] = { ...item.answers[ansIdx], ...answer };
    } else {
      item.answers.push(answer);
    }
    writeJsonFile(ATTEMPTS_FILE, all);
  }
}

export async function finalizeStoredExamAttempt(
  attemptId: string,
  result: ExamResult,
  status: "Submitted" | "Auto Submitted" = "Submitted"
): Promise<void> {
  const all = readJsonFile<StoredAttemptData[]>(ATTEMPTS_FILE, []);
  const item = all.find((d) => d.attempt.id === attemptId);
  if (item) {
    item.attempt.status = status;
    item.attempt.submitted_at = new Date().toISOString();
    item.result = result;
    writeJsonFile(ATTEMPTS_FILE, all);
  }
}

// ===========================================================================
// 9. STORED ENROLLMENTS (STUDENT EXAMS)
// ===========================================================================

const ENROLLMENTS_FILE = "student_exams.json";

export async function getStoredEnrollments(studentId: string): Promise<StudentExam[]> {
  const all = readJsonFile<StudentExam[]>(ENROLLMENTS_FILE, []);
  const userEnrolled = all.filter((e) => e.student_id === studentId);
  if (userEnrolled.length === 0) {
    const defaultEnrolled: StudentExam[] = [
      {
        id: "se-1",
        student_id: studentId,
        exam_id: "e1000000-0000-0000-0000-000000000001",
        target_date: "2026-02-14",
        priority: 1,
        notes: "Target: Top Rank in GATE Civil Engineering 2026",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "se-2",
        student_id: studentId,
        exam_id: "e1000000-0000-0000-0000-000000000003",
        target_date: "2026-06-20",
        priority: 2,
        notes: "Target: KAS Gazetted Probationers Preliminary GS",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    writeJsonFile(ENROLLMENTS_FILE, [...all, ...defaultEnrolled]);
    return defaultEnrolled;
  }
  return userEnrolled.sort((a, b) => a.priority - b.priority);
}

export async function saveStoredEnrollment(enrollment: StudentExam): Promise<void> {
  const all = readJsonFile<StudentExam[]>(ENROLLMENTS_FILE, []);
  const idx = all.findIndex(
    (e) => e.student_id === enrollment.student_id && e.exam_id === enrollment.exam_id
  );
  if (idx >= 0) {
    all[idx] = enrollment;
  } else {
    all.push(enrollment);
  }
  writeJsonFile(ENROLLMENTS_FILE, all);
}

export async function removeStoredEnrollment(studentId: string, examId: string): Promise<void> {
  const all = readJsonFile<StudentExam[]>(ENROLLMENTS_FILE, []);
  const filtered = all.filter((e) => !(e.student_id === studentId && e.exam_id === examId));
  writeJsonFile(ENROLLMENTS_FILE, filtered);
}

// ===========================================================================
// 10. CUSTOM EXAMINATIONS STORE
// ===========================================================================

const CUSTOM_EXAMS_FILE = "custom_exams.json";

export async function getStoredCustomExams(): Promise<Exam[]> {
  return readJsonFile<Exam[]>(CUSTOM_EXAMS_FILE, []);
}

export async function saveStoredCustomExam(exam: Exam): Promise<void> {
  const all = readJsonFile<Exam[]>(CUSTOM_EXAMS_FILE, []);
  const idx = all.findIndex((e) => e.id === exam.id || e.code === exam.code);
  if (idx >= 0) {
    all[idx] = exam;
  } else {
    all.push(exam);
  }
  writeJsonFile(CUSTOM_EXAMS_FILE, all);
}

// ===========================================================================
// 11. PERSONAL & IMPORTED QUESTIONS STORE
// ===========================================================================

const PERSONAL_QUESTIONS_FILE = "personal_questions.json";

export async function getStoredPersonalQuestions(): Promise<Question[]> {
  return readJsonFile<Question[]>(PERSONAL_QUESTIONS_FILE, []);
}

export async function saveStoredPersonalQuestion(q: Question): Promise<void> {
  const all = readJsonFile<Question[]>(PERSONAL_QUESTIONS_FILE, []);
  const idx = all.findIndex((item) => item.id === q.id);
  if (idx >= 0) {
    all[idx] = q;
  } else {
    all.push(q);
  }
  writeJsonFile(PERSONAL_QUESTIONS_FILE, all);
}

export async function saveStoredPersonalQuestions(questions: Question[]): Promise<void> {
  const all = readJsonFile<Question[]>(PERSONAL_QUESTIONS_FILE, []);
  for (const q of questions) {
    const idx = all.findIndex((item) => item.id === q.id);
    if (idx >= 0) {
      all[idx] = q;
    } else {
      all.push(q);
    }
  }
  writeJsonFile(PERSONAL_QUESTIONS_FILE, all);
}

// ===========================================================================
// 12. EXAM SCHEDULE EVENTS STORE
// ===========================================================================

const EXAM_EVENTS_FILE = "exam_events.json";

export async function getStoredExamEvents(examIds?: string[]): Promise<ExamScheduleEvent[]> {
  const all = readJsonFile<ExamScheduleEvent[]>(EXAM_EVENTS_FILE, []);
  if (examIds && examIds.length > 0) {
    const set = new Set(examIds);
    return all.filter((ev) => set.has(ev.exam_id));
  }
  return all;
}

export async function saveStoredExamEvent(ev: ExamScheduleEvent): Promise<void> {
  const all = readJsonFile<ExamScheduleEvent[]>(EXAM_EVENTS_FILE, []);
  const idx = all.findIndex((item) => item.id === ev.id);
  if (idx >= 0) {
    all[idx] = ev;
  } else {
    all.push(ev);
  }
  writeJsonFile(EXAM_EVENTS_FILE, all);
}

// ===========================================================================
// 13. REVISION SCHEDULES STORE
// ===========================================================================

const REVISIONS_FILE = "revision_schedules.json";

export async function getStoredRevisionSchedules(studentId: string): Promise<RevisionSchedule[]> {
  const all = readJsonFile<RevisionSchedule[]>(REVISIONS_FILE, []);
  return all.filter((r) => r.student_id === studentId);
}

export async function saveStoredRevisionSchedule(rev: RevisionSchedule): Promise<void> {
  const all = readJsonFile<RevisionSchedule[]>(REVISIONS_FILE, []);
  const idx = all.findIndex((item) => item.id === rev.id);
  if (idx >= 0) {
    all[idx] = rev;
  } else {
    all.push(rev);
  }
  writeJsonFile(REVISIONS_FILE, all);
}

export async function updateStoredRevisionSchedule(
  revId: string,
  studentId: string,
  updates: Partial<RevisionSchedule>
): Promise<void> {
  const all = readJsonFile<RevisionSchedule[]>(REVISIONS_FILE, []);
  const idx = all.findIndex((r) => r.id === revId && r.student_id === studentId);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates, updated_at: new Date().toISOString() };
    writeJsonFile(REVISIONS_FILE, all);
  }
}

// ===========================================================================
// 14. PRACTICE SESSIONS STORE
// ===========================================================================

const PRACTICE_SESSIONS_FILE = "practice_sessions.json";

export async function getStoredPracticeSessions(studentId?: string): Promise<PracticeSession[]> {
  const all = readJsonFile<PracticeSession[]>(PRACTICE_SESSIONS_FILE, []);
  if (studentId) {
    return all.filter((s) => s.student_id === studentId);
  }
  return all;
}

export async function saveStoredPracticeSession(session: PracticeSession): Promise<void> {
  const all = readJsonFile<PracticeSession[]>(PRACTICE_SESSIONS_FILE, []);
  const idx = all.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    all[idx] = session;
  } else {
    all.push(session);
  }
  writeJsonFile(PRACTICE_SESSIONS_FILE, all);
}
