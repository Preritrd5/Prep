import "server-only";
import fs from "fs";
import path from "path";
import type { RoutineTemplate } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const ROUTINES_FILE = path.join(DATA_DIR, "routine_templates.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readRoutinesFile(): RoutineTemplate[] {
  try {
    ensureDirectoryExists();
    if (!fs.existsSync(ROUTINES_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(ROUTINES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.warn("[RoutineStore] Failed to read routines file:", err);
    return [];
  }
}

function writeRoutinesFile(routines: RoutineTemplate[]): void {
  try {
    ensureDirectoryExists();
    fs.writeFileSync(ROUTINES_FILE, JSON.stringify(routines, null, 2), "utf-8");
  } catch (err) {
    console.error("[RoutineStore] Failed to write routines file:", err);
  }
}

export async function getStoredRoutines(studentId: string): Promise<RoutineTemplate[]> {
  const all = readRoutinesFile();
  return all.filter((r) => r.student_id === studentId);
}

export async function saveStoredRoutine(routine: RoutineTemplate): Promise<void> {
  const all = readRoutinesFile();
  const existingIdx = all.findIndex((r) => r.id === routine.id);
  if (existingIdx >= 0) {
    all[existingIdx] = routine;
  } else {
    all.push(routine);
  }
  writeRoutinesFile(all);
}

export async function deleteStoredRoutine(routineId: string, studentId: string): Promise<void> {
  const all = readRoutinesFile();
  const filtered = all.filter((r) => !(r.id === routineId && r.student_id === studentId));
  writeRoutinesFile(filtered);
}
