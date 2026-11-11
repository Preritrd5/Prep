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
  studentId: string,
  topicIds?: string[]
): Promise<TopicProgress[]> {
  const all = readJsonFile<TopicProgress[]>(PROGRESS_FILE, []);
  let list = all.filter((p) => p.student_id === studentId);
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
      p.student_id === progress.student_id &&
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
