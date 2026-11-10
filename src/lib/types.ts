export type UserRole = "student" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Phase 2: Syllabus & Study Management Types
// ---------------------------------------------------------------------------

export interface Exam {
  id: string;
  category: string;
  sub_category: string | null;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentExam {
  id: string;
  student_id: string;
  exam_id: string;
  target_date: string | null;
  priority: 1 | 2 | 3; // 1 = High, 2 = Medium, 3 = Low
  notes: string | null;
  created_at: string;
  updated_at: string;
  exam?: Exam;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  category: string | null;
  description: string | null;
  is_published: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  chapters?: Chapter[];
  weightage_percent?: number;
}

export interface Chapter {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  topics?: Topic[];
}

export interface Topic {
  id: string;
  chapter_id: string | null;
  title: string;
  description: string | null;
  estimated_minutes: number;
  official_syllabus_ref: string | null;
  textbook_ref: string | null;
  textbook_page_start: number | null;
  textbook_page_end: number | null;
  order_index: number;
  is_published: boolean;
  is_personal: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  progress?: TopicProgress;
}

export interface ExamSubjectMapping {
  id: string;
  exam_id: string;
  subject_id: string;
  weightage_percent: number | null;
  order_index: number;
  created_at: string;
  subject?: Subject;
}

export interface ExamTopicMapping {
  id: string;
  exam_id: string;
  topic_id: string;
  is_mandatory: boolean;
  order_index: number;
  created_at: string;
  topic?: Topic;
}

export type TopicProgressStatus = "Not Started" | "In Progress" | "Completed";

export interface TopicProgress {
  id: string;
  student_id: string;
  topic_id: string;
  exam_id: string | null;
  status: TopicProgressStatus;
  scheduled_date: string | null;
  started_date: string | null;
  completed_date: string | null;
  last_studied_date: string | null;
  actual_minutes: number;
  revision_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudyPreferences {
  id: string;
  student_id: string;
  daily_study_hours: number;
  available_days: string[];
  preferred_slot_duration_minutes: number;
  timezone: string;
  auto_carry_forward: boolean;
  created_at: string;
  updated_at: string;
}

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface RoutineTemplate {
  id: string;
  student_id: string;
  day_of_week: DayOfWeek;
  title: string;
  exam_id: string | null;
  subject_id: string | null;
  topic_id: string | null;
  start_time: string; // HH:mm:ss
  end_time: string;   // HH:mm:ss
  duration_minutes: number;
  priority: 1 | 2 | 3;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  exam?: Exam;
  subject?: Subject;
}

export type TaskStatus =
  | "Upcoming"
  | "In Progress"
  | "Completed"
  | "Incomplete"
  | "Missed";

export interface StudyTask {
  id: string;
  student_id: string;
  exam_id: string | null;
  subject_id: string | null;
  topic_id: string | null;
  title: string;
  description: string | null;
  scheduled_date: string; // YYYY-MM-DD
  start_time: string | null; // HH:mm:ss
  end_time: string | null;   // HH:mm:ss
  duration_minutes: number;
  priority: 1 | 2 | 3;
  status: TaskStatus;
  completed_at: string | null;
  carried_from_task_id: string | null;
  is_carried_forward: boolean;
  created_at: string;
  updated_at: string;
  exam?: Exam;
  subject?: Subject;
  topic?: Topic;
}

export type ExamEventType =
  | "Official Examination"
  | "Application Opening"
  | "Application Closing"
  | "Admit Card Release"
  | "Result Announcement"
  | "Important Deadline"
  | "Other";

export interface ExamScheduleEvent {
  id: string;
  exam_id: string;
  event_type: ExamEventType;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  official_source_url: string | null;
  verification_date: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  exam?: Exam;
}

export interface RevisionSchedule {
  id: string;
  student_id: string;
  topic_id: string;
  exam_id: string | null;
  revision_number: number;
  scheduled_date: string;
  completed_date: string | null;
  is_completed: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  topic?: Topic;
}

export interface PersonalNote {
  id: string;
  student_id: string;
  topic_id: string | null;
  exam_id: string | null;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  topic?: Topic;
}
