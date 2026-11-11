import "server-only";
import fs from "fs";
import path from "path";
import type {
  StudyTask,
  StudyPreferences,
  TopicProgress,
  PersonalNote,
  Question,
  QuestionOption,
  QuestionAnswerKey,
  ExamTemplate,
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
// 4. PERSONAL NOTES STORE
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
// 5. QUESTION BOOKMARKS STORE
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
