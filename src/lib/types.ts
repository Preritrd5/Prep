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
  priority: 1 | 2 | 3;
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
  start_time: string;
  end_time: string;
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
  scheduled_date: string;
  start_time: string | null;
  end_time: string | null;
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

// ---------------------------------------------------------------------------
// Phase 3: MCQ Question Bank & Practice System Types
// ---------------------------------------------------------------------------

export type DifficultyLevel = "Easy" | "Medium" | "Hard";

export type QuestionSource =
  | "Manual"
  | "CSV Import"
  | "Excel Import"
  | "AI Generated"
  | "Previous Year Question"
  | "Student Created";

export type QuestionStatus =
  | "Draft"
  | "Pending Review"
  | "Approved"
  | "Published"
  | "Archived"
  | "Rejected";

export type OptionLabel = "A" | "B" | "C" | "D";

export interface QuestionBank {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_label: OptionLabel;
  option_text: string;
  order_index: number;
  created_at: string;
}

export interface QuestionAnswerKey {
  id: string;
  question_id: string;
  correct_option: OptionLabel;
  explanation: string | null;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  bank_id: string | null;
  question_text: string;
  subject_id: string | null;
  chapter_id: string | null;
  topic_id: string | null;
  difficulty: DifficultyLevel;
  source_type: QuestionSource;
  pyq_exam_name: string | null;
  pyq_year: number | null;
  source_reference: string | null;
  status: QuestionStatus;
  is_personal: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  options?: QuestionOption[];
  subject?: Subject;
  chapter?: Chapter;
  topic?: Topic;
  applicable_exams?: Exam[];
  is_bookmarked?: boolean;
}

export interface QuestionExamMapping {
  id: string;
  question_id: string;
  exam_id: string;
  is_verified_pyq: boolean;
  created_at: string;
  exam?: Exam;
}

export interface QuestionBookmark {
  id: string;
  student_id: string;
  question_id: string;
  created_at: string;
  question?: Question;
}

export type PracticeMode = "Learn" | "Test";
export type PracticeSessionStatus = "In Progress" | "Completed" | "Abandoned";

export interface PracticeSession {
  id: string;
  student_id: string;
  mode: PracticeMode;
  exam_id: string | null;
  subject_id: string | null;
  topic_id: string | null;
  total_questions: number;
  attempted_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  score_percent: number;
  status: PracticeSessionStatus;
  started_at: string;
  completed_at: string | null;
  exam?: Exam;
  subject?: Subject;
  topic?: Topic;
}

export interface QuestionAttempt {
  id: string;
  session_id: string | null;
  student_id: string;
  question_id: string;
  selected_option: OptionLabel | null;
  is_correct: boolean;
  time_spent_seconds: number;
  created_at: string;
  question?: Question;
  correct_option?: OptionLabel;
  explanation?: string;
}

export interface QuestionImportBatch {
  id: string;
  file_name: string;
  file_type: "CSV" | "XLSX";
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicate_rows: number;
  imported_by: string | null;
  created_at: string;
}

export interface AIQuestionGenerationJob {
  id: string;
  exam_id: string | null;
  subject_id: string | null;
  chapter_id: string | null;
  topic_id: string | null;
  prompt: string | null;
  requested_count: number;
  generated_count: number;
  difficulty: string;
  language: string;
  status: "Pending" | "Processing" | "Completed" | "Failed";
  error_message: string | null;
  created_by: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Phase 4: Online Examination & Mock Test System Types
// ---------------------------------------------------------------------------

export type ExamCategory =
  | "GATE"
  | "KAS"
  | "UPSC"
  | "Railway Examinations"
  | "KEA Examinations"
  | "AE Civil Engineering"
  | "General Knowledge"
  | "Custom";

export type OnlineExamType =
  | "Chapter Test"
  | "Subject Test"
  | "Sectional Test"
  | "Full-Length Mock Test"
  | "Previous Year Question Test"
  | "Custom Test";

export type ResultReleasePolicy = "Immediate" | "Delayed" | "Admin Controlled";
export type ExamTemplateStatus = "Draft" | "Published" | "Archived";
export type AttemptStatus =
  | "In Progress"
  | "Submitted"
  | "Auto Submitted"
  | "Evaluated"
  | "Results Released"
  | "Cancelled";

export interface ExamTemplate {
  id: string;
  title: string;
  description: string | null;
  exam_category: ExamCategory;
  exam_id: string | null;
  exam_type: OnlineExamType;
  instructions: string | null;
  duration_minutes: number;
  total_questions: number;
  total_marks: number;
  passing_marks: number | null;
  max_attempts: number;
  start_date: string | null;
  end_date: string | null;
  randomize_questions: boolean;
  randomize_options: boolean;
  has_negative_marking: boolean;
  correct_marks: number;
  negative_marks: number;
  unattempted_marks: number;
  result_release_policy: ResultReleasePolicy;
  results_published: boolean;
  status: ExamTemplateStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  exam?: Exam;
  sections?: ExamSection[];
  mappings?: ExamQuestionMapping[];
  blueprints?: ExamQuestionBlueprint[];
  attempt_count?: number;
}

export interface ExamSection {
  id: string;
  template_id: string;
  name: string;
  subject_id: string | null;
  question_count: number;
  total_marks: number;
  time_limit_minutes: number | null;
  order_index: number;
  correct_marks: number | null;
  negative_marks: number | null;
  created_at: string;
  updated_at: string;
  subject?: Subject;
}

export interface ExamQuestionMapping {
  id: string;
  template_id: string;
  section_id: string | null;
  question_id: string;
  order_index: number;
  marks: number | null;
  negative_marks: number | null;
  created_at: string;
  question?: Question;
  section?: ExamSection;
}

export interface ExamQuestionBlueprint {
  id: string;
  template_id: string;
  section_id: string | null;
  subject_id: string | null;
  chapter_id: string | null;
  topic_id: string | null;
  difficulty: "Easy" | "Medium" | "Hard" | "Any" | null;
  question_count: number;
  marks_per_question: number;
  negative_marks_per_question: number;
  created_at: string;
  subject?: Subject;
  chapter?: Chapter;
  topic?: Topic;
}

export interface ExamAttempt {
  id: string;
  student_id: string;
  template_id: string;
  attempt_number: number;
  started_at: string;
  expires_at: string;
  submitted_at: string | null;
  status: AttemptStatus;
  score: number;
  max_marks: number;
  percentage: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  time_taken_seconds: number;
  result_release_status: ResultReleasePolicy | "Results Released";
  created_at: string;
  updated_at: string;
  template?: ExamTemplate;
  student?: Profile;
  answers?: ExamAttemptAnswer[];
  questions?: ExamAttemptQuestion[];
  result?: ExamResult;
}

export interface ExamAttemptQuestion {
  id: string;
  attempt_id: string;
  question_id: string | null;
  section_id: string | null;
  section_name: string | null;
  order_index: number;
  question_text: string;
  options_json: { option_label: OptionLabel; option_text: string }[];
  marks: number;
  negative_marks: number;
  created_at: string;
}

export interface ExamAttemptAnswer {
  id: string;
  attempt_id: string;
  attempt_question_id: string;
  selected_option: OptionLabel | null;
  is_marked_for_review: boolean;
  is_visited: boolean;
  time_spent_seconds: number;
  saved_at: string;
}

export interface ExamAttemptAnswerKey {
  id: string;
  attempt_id: string;
  attempt_question_id: string;
  correct_option: OptionLabel;
  explanation: string | null;
  created_at: string;
}

export interface SectionScoreSummary {
  section_id: string | null;
  section_name: string;
  total_questions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  score: number;
  max_marks: number;
}

export interface ExamResult {
  id: string;
  attempt_id: string;
  student_id: string;
  template_id: string;
  total_score: number;
  max_marks: number;
  positive_marks: number;
  negative_marks: number;
  percentage: number;
  accuracy_percent: number;
  total_questions: number;
  attempted_count: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  time_taken_seconds: number;
  section_scores_json: SectionScoreSummary[];
  evaluated_at: string;
  template?: ExamTemplate;
}

export interface ExamAuditEvent {
  id: string;
  template_id: string | null;
  attempt_id: string | null;
  user_id: string | null;
  event_type: string;
  details_json: Record<string, any> | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Phase 5: Analytics, Revisions, Notifications, Recommendations & Audit Types
// ---------------------------------------------------------------------------

export type RecommendationType =
  | "Revise Topic"
  | "Practice Questions"
  | "Review Mistakes"
  | "Take Mock Exam"
  | "Pending Target";

export type RecommendationStatus = "Active" | "Accepted" | "Dismissed";
export type RecommendationPriority = "High" | "Medium" | "Low";

export interface StudentStudyRecommendation {
  id: string;
  student_id: string;
  exam_id: string | null;
  subject_id: string | null;
  topic_id: string | null;
  recommendation_type: RecommendationType;
  title: string;
  reason: string;
  action_url: string | null;
  priority: RecommendationPriority;
  status: RecommendationStatus;
  created_at: string;
  updated_at: string;
  topic?: {
    id: string;
    title: string;
    chapter?: {
      title: string;
      subject?: {
        name: string;
      };
    };
  };
}

export type NotificationCategory =
  | "upcoming_task"
  | "incomplete_task"
  | "revision_due"
  | "upcoming_exam"
  | "new_published_exam"
  | "mock_result_ready"
  | "recommendation"
  | "admin_announcement";

export interface StudentNotification {
  id: string;
  student_id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
}

export interface StudentNotificationPreferences {
  student_id: string;
  upcoming_tasks: boolean;
  incomplete_tasks: boolean;
  revisions_due: boolean;
  upcoming_exams: boolean;
  new_published_exams: boolean;
  mock_results_ready: boolean;
  study_recommendations: boolean;
  admin_announcements: boolean;
  browser_notifications_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  timezone: string;
  updated_at: string;
}

export interface ReminderJobRun {
  id: string;
  job_type: string;
  status: "Success" | "Failed" | "Partial";
  records_processed: number;
  details: Record<string, any> | null;
  executed_at: string;
}

export type AdminAuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "PUBLISH"
  | "UNPUBLISH"
  | "IMPORT"
  | "REJECT"
  | "RELEASE_RESULTS"
  | "ROLE_CHANGE"
  | "SYSTEM_CONFIG";

export type AdminAuditEntity =
  | "EXAM"
  | "SYLLABUS"
  | "QUESTION"
  | "MOCK_EXAM"
  | "USER"
  | "SYSTEM";

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action_type: AdminAuditAction;
  target_entity: AdminAuditEntity;
  target_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  admin?: {
    email: string;
    full_name: string | null;
  };
}

export interface StudentAiInteraction {
  id: string;
  student_id: string;
  category: "REVISION_PLAN" | "WEAK_AREA_EXPLANATION" | "PRACTICE_ADVICE" | "PROGRESS_SUMMARY" | "GENERAL_ASSIST";
  prompt_summary: string;
  response_text: string;
  created_at: string;
}

export interface StudentWeakAreaDismissal {
  id: string;
  student_id: string;
  topic_id: string;
  dismissed_until: string | null;
  notes: string | null;
  created_at: string;
}

export type RevisionConfidenceRating =
  | "Understood"
  | "Needs more practice"
  | "Not understood"
  | "Completed";

export interface RevisionScheduleItem {
  id: string;
  student_id: string;
  topic_id: string;
  exam_id: string | null;
  revision_number: number;
  scheduled_date: string;
  completed_date: string | null;
  is_completed: boolean;
  notes: string | null;
  confidence_rating?: RevisionConfidenceRating | null;
  interval_days?: number;
  next_revision_date?: string | null;
  created_at: string;
  updated_at: string;
  topic?: {
    id: string;
    title: string;
    chapter?: {
      title: string;
      subject?: {
        name: string;
      };
    };
  };
}

export interface StudentPerformanceAnalytics {
  totalExaminationsSelected: number;
  totalSyllabusTopics: number;
  completedTopics: number;
  pendingTopics: number;
  syllabusCompletionPercentage: number;
  totalStudyHours: number;
  tasksCompleted: number;
  incompleteTasks: number;
  mcqsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  overallAccuracy: number;
  totalMockExaminationsAttempted: number;
  bestMockScore: number;
  averageMockScore: number;
  recentPerformanceTrend: {
    date: string;
    accuracy: number;
    questionsAttempted: number;
    studyMinutes: number;
  }[];
}

export interface SubjectAnalyticsSummary {
  subjectId: string;
  subjectName: string;
  examCategory: string | null;
  totalTopics: number;
  completedTopics: number;
  pendingTopics: number;
  completionPercentage: number;
  questionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracyPercentage: number;
  averageTimePerQuestionSeconds: number;
  recentTestScores: {
    examTitle: string;
    score: number;
    maxMarks: number;
    percentage: number;
    date: string;
  }[];
  revisionCount: number;
}

export interface TopicAnalyticsSummary {
  topicId: string;
  topicTitle: string;
  chapterTitle: string;
  subjectName: string;
  examName: string;
  completionStatus: "Completed" | "In Progress" | "Pending";
  questionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracyPercentage: number;
  lastStudiedDate: string | null;
  lastRevisionDate: string | null;
  upcomingRevisionDate: string | null;
  needsPractice: boolean;
  reason: string | null;
}

export interface WeakAreaTopic {
  topicId: string;
  topicTitle: string;
  chapterTitle: string;
  subjectName: string;
  examName: string;
  accuracyPercentage: number;
  questionsAttempted: number;
  incorrectAnswers: number;
  reason: string;
  recommendedAction: "Revise Topic" | "Practise Questions" | "Review Mistakes" | "Schedule Test";
  isDismissed?: boolean;
}

export interface AdminAnalyticsSummary {
  totalRegisteredStudents: number;
  newRegistrationsThisMonth: number;
  activeStudentsThisWeek: number;
  totalExaminations: number;
  totalSyllabusSubjects: number;
  totalChapters: number;
  totalTopics: number;
  publishedQuestions: number;
  pendingQuestionReviews: number;
  aiGeneratedQuestions: number;
  questionsImported: number;
  totalPracticeSessions: number;
  totalExaminationAttempts: number;
  publishedMockExams: number;
  registrationTrends: {
    month: string;
    count: number;
  }[];
  practiceActivityTrends: {
    date: string;
    sessions: number;
    questionsAttempted: number;
  }[];
  mockExamActivityTrends: {
    date: string;
    attempts: number;
  }[];
}

export interface AdminContentQualityReport {
  totalQuestions: number;
  publishedQuestions: number;
  draftQuestions: number;
  pendingReview: number;
  rejectedQuestions: number;
  questionsWithoutExplanation: number;
  questionsWithoutValidTopic: number;
  syllabusTopicsWithoutQuestions: {
    topicId: string;
    topicTitle: string;
    subjectName: string;
  }[];
  duplicateQuestionsCount: number;
  questionsMappedToMultipleExams: number;
}


