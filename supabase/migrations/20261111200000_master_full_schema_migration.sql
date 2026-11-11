-- ==============================================================================
-- PREPTRACK: MASTER CONSOLIDATED DATABASE SCHEMA MIGRATION
-- Project: PrepTrack — Personal Examination Preparation Workspace
-- Version: Consolidated Master (Phases 1 - 5 + Single Owner Architecture)
-- Target: Supabase PostgreSQL (Run in Supabase Dashboard SQL Editor)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- EXTENSIONS & CORE FUNCTIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to check if the caller is the registered app owner
CREATE OR REPLACE FUNCTION public.is_app_owner()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.app_owner
        WHERE singleton_id = true AND user_id = auth.uid()
    ) OR (
        -- If no app_owner has been designated yet, the first authenticated user is treated as owner
        NOT EXISTS (SELECT 1 FROM public.app_owner WHERE singleton_id = true)
        AND auth.uid() IS NOT NULL
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_app_owner() TO authenticated, anon;

-- ==============================================================================
-- 1. AUTH & USER PROFILE MODULE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_app_owner());

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid() OR public.is_app_owner());

DROP POLICY IF EXISTS "Allow insert to profiles" ON public.profiles;
CREATE POLICY "Allow insert to profiles" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid() OR public.is_app_owner());

-- App Owner Singleton Table
CREATE TABLE IF NOT EXISTS public.app_owner (
    singleton_id BOOLEAN PRIMARY KEY DEFAULT true,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    configured_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT app_owner_singleton_check CHECK (singleton_id = true)
);

ALTER TABLE public.app_owner ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny client mutations to app_owner" ON public.app_owner;
CREATE POLICY "Deny client mutations to app_owner" ON public.app_owner FOR ALL USING (false);

-- Trigger to create profile upon user signup in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);

    -- Auto-designate first user as owner if no owner set
    INSERT INTO public.app_owner (singleton_id, user_id, configured_at)
    VALUES (true, NEW.id, now())
    ON CONFLICT (singleton_id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-seed app_owner from existing auth.users if available
DO $$
DECLARE
    owner_uuid UUID;
BEGIN
    SELECT id INTO owner_uuid FROM auth.users ORDER BY created_at ASC LIMIT 1;
    IF owner_uuid IS NOT NULL THEN
        INSERT INTO public.app_owner (singleton_id, user_id, configured_at)
        VALUES (true, owner_uuid, now())
        ON CONFLICT (singleton_id) DO NOTHING;
    END IF;
END $$;

-- ==============================================================================
-- 2. EXAMINATIONS, SYLLABUS & CURRICULUM MODULE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    sub_category TEXT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_exams_category ON public.exams(category);
CREATE INDEX IF NOT EXISTS idx_exams_is_active ON public.exams(is_active);
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner read exams" ON public.exams;
CREATE POLICY "Owner read exams" ON public.exams FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owner manage exams" ON public.exams;
CREATE POLICY "Owner manage exams" ON public.exams FOR ALL USING (public.is_app_owner()) WITH CHECK (public.is_app_owner());

CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    category TEXT,
    description TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_subjects_category ON public.subjects(category);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner read subjects" ON public.subjects;
CREATE POLICY "Owner read subjects" ON public.subjects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owner manage subjects" ON public.subjects;
CREATE POLICY "Owner manage subjects" ON public.subjects FOR ALL USING (public.is_app_owner()) WITH CHECK (public.is_app_owner());

CREATE TABLE IF NOT EXISTS public.chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_chapters_subject ON public.chapters(subject_id);
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner read chapters" ON public.chapters;
CREATE POLICY "Owner read chapters" ON public.chapters FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owner manage chapters" ON public.chapters;
CREATE POLICY "Owner manage chapters" ON public.chapters FOR ALL USING (public.is_app_owner()) WITH CHECK (public.is_app_owner());

CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    estimated_minutes INTEGER NOT NULL DEFAULT 60,
    official_syllabus_ref TEXT,
    textbook_ref TEXT,
    textbook_page_start INTEGER,
    textbook_page_end INTEGER,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_personal BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_topics_chapter ON public.topics(chapter_id);
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner read topics" ON public.topics;
CREATE POLICY "Owner read topics" ON public.topics FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owner manage topics" ON public.topics;
CREATE POLICY "Owner manage topics" ON public.topics FOR ALL USING (public.is_app_owner() OR created_by = auth.uid()) WITH CHECK (public.is_app_owner() OR created_by = auth.uid());

CREATE TABLE IF NOT EXISTS public.exam_subject_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    weightage_percent NUMERIC(5,2) DEFAULT 0,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(exam_id, subject_id)
);

ALTER TABLE public.exam_subject_mappings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read exam_subject_mappings" ON public.exam_subject_mappings;
CREATE POLICY "Read exam_subject_mappings" ON public.exam_subject_mappings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Manage exam_subject_mappings" ON public.exam_subject_mappings;
CREATE POLICY "Manage exam_subject_mappings" ON public.exam_subject_mappings FOR ALL USING (public.is_app_owner()) WITH CHECK (public.is_app_owner());

CREATE TABLE IF NOT EXISTS public.exam_topic_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    importance_level TEXT DEFAULT 'Medium',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(exam_id, topic_id)
);

ALTER TABLE public.exam_topic_mappings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read exam_topic_mappings" ON public.exam_topic_mappings;
CREATE POLICY "Read exam_topic_mappings" ON public.exam_topic_mappings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Manage exam_topic_mappings" ON public.exam_topic_mappings;
CREATE POLICY "Manage exam_topic_mappings" ON public.exam_topic_mappings FOR ALL USING (public.is_app_owner()) WITH CHECK (public.is_app_owner());

CREATE TABLE IF NOT EXISTS public.student_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    target_date DATE,
    priority INTEGER NOT NULL DEFAULT 1 CHECK (priority IN (1, 2, 3)),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(student_id, exam_id)
);

ALTER TABLE public.student_exams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage student_exams" ON public.student_exams;
CREATE POLICY "Owner manage student_exams" ON public.student_exams FOR ALL USING (student_id = auth.uid() OR public.is_app_owner()) WITH CHECK (student_id = auth.uid() OR public.is_app_owner());

CREATE TABLE IF NOT EXISTS public.topic_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Not Started',
    actual_minutes INTEGER NOT NULL DEFAULT 0,
    started_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    last_studied_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(student_id, topic_id, exam_id)
);

ALTER TABLE public.topic_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage topic_progress" ON public.topic_progress;
CREATE POLICY "Owner manage topic_progress" ON public.topic_progress FOR ALL USING (student_id = auth.uid() OR public.is_app_owner()) WITH CHECK (student_id = auth.uid() OR public.is_app_owner());

CREATE TABLE IF NOT EXISTS public.personal_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.personal_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage personal_notes" ON public.personal_notes;
CREATE POLICY "Owner manage personal_notes" ON public.personal_notes FOR ALL USING (student_id = auth.uid() OR public.is_app_owner()) WITH CHECK (student_id = auth.uid() OR public.is_app_owner());

-- ==============================================================================
-- 3. ROUTINE, STUDY TASKS & CALENDAR MODULE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.routine_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    title TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    exam_id UUID REFERENCES public.exams(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    priority INTEGER NOT NULL DEFAULT 2 CHECK (priority IN (1, 2, 3)),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_routine_student ON public.routine_templates(student_id);
CREATE INDEX IF NOT EXISTS idx_routine_day ON public.routine_templates(day_of_week);
ALTER TABLE public.routine_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage routine_templates" ON public.routine_templates;
CREATE POLICY "Owner manage routine_templates" ON public.routine_templates FOR ALL USING (student_id = auth.uid() OR public.is_app_owner()) WITH CHECK (student_id = auth.uid() OR public.is_app_owner());

CREATE TABLE IF NOT EXISTS public.study_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    daily_study_hours NUMERIC(4,2) NOT NULL DEFAULT 4.0,
    available_days TEXT[] NOT NULL DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    preferred_slot_duration_minutes INTEGER NOT NULL DEFAULT 60,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    auto_carry_forward BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.study_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage study_preferences" ON public.study_preferences;
CREATE POLICY "Owner manage study_preferences" ON public.study_preferences FOR ALL USING (student_id = auth.uid() OR public.is_app_owner()) WITH CHECK (student_id = auth.uid() OR public.is_app_owner());

CREATE TABLE IF NOT EXISTS public.study_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES public.exams(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'In Progress', 'Completed', 'Incomplete', 'Missed', 'Rescheduled')),
    priority INTEGER NOT NULL DEFAULT 2 CHECK (priority IN (1, 2, 3)),
    completed_at TIMESTAMPTZ,
    carried_from_task_id UUID REFERENCES public.study_tasks(id) ON DELETE SET NULL,
    is_carried_forward BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tasks_student_date ON public.study_tasks(student_id, scheduled_date);
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage study_tasks" ON public.study_tasks;
CREATE POLICY "Owner manage study_tasks" ON public.study_tasks FOR ALL USING (student_id = auth.uid() OR public.is_app_owner()) WITH CHECK (student_id = auth.uid() OR public.is_app_owner());

CREATE TABLE IF NOT EXISTS public.exam_schedule_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL DEFAULT 'Exam Date',
    start_date DATE NOT NULL,
    end_date DATE,
    official_notification_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.exam_schedule_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read exam_schedule_events" ON public.exam_schedule_events;
CREATE POLICY "Read exam_schedule_events" ON public.exam_schedule_events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Manage exam_schedule_events" ON public.exam_schedule_events;
CREATE POLICY "Manage exam_schedule_events" ON public.exam_schedule_events FOR ALL USING (public.is_app_owner()) WITH CHECK (public.is_app_owner());

-- ==============================================================================
-- 4. QUESTION BANK, OPTIONS, ANSWER KEYS & ATTEMPTS MODULE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.question_banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.question_banks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage question_banks" ON public.question_banks;
CREATE POLICY "Owner manage question_banks" ON public.question_banks FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID REFERENCES public.question_banks(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    question_text TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    source_type TEXT NOT NULL DEFAULT 'Manual',
    pyq_exam_name TEXT,
    pyq_year INTEGER,
    source_reference TEXT,
    status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Draft', 'Published', 'Archived')),
    is_personal BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage questions" ON public.questions;
CREATE POLICY "Owner manage questions" ON public.questions FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    option_label TEXT NOT NULL CHECK (option_label IN ('A', 'B', 'C', 'D')),
    option_text TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(question_id, option_label)
);

ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage question_options" ON public.question_options;
CREATE POLICY "Owner manage question_options" ON public.question_options FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS public.question_answer_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID UNIQUE NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.question_answer_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage question_answer_keys" ON public.question_answer_keys;
CREATE POLICY "Owner manage question_answer_keys" ON public.question_answer_keys FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS public.question_exam_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    is_verified_pyq BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(question_id, exam_id)
);

ALTER TABLE public.question_exam_mappings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage question_exam_mappings" ON public.question_exam_mappings;
CREATE POLICY "Owner manage question_exam_mappings" ON public.question_exam_mappings FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS public.question_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(student_id, question_id)
);

ALTER TABLE public.question_bookmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage question_bookmarks" ON public.question_bookmarks;
CREATE POLICY "Owner manage question_bookmarks" ON public.question_bookmarks FOR ALL USING (student_id = auth.uid() OR public.is_app_owner()) WITH CHECK (student_id = auth.uid() OR public.is_app_owner());

CREATE TABLE IF NOT EXISTS public.practice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES public.exams(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    mode TEXT NOT NULL DEFAULT 'Learn' CHECK (mode IN ('Learn', 'Test')),
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    incorrect_count INTEGER NOT NULL DEFAULT 0,
    unattempted_count INTEGER NOT NULL DEFAULT 0,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage practice_sessions" ON public.practice_sessions;
CREATE POLICY "Owner manage practice_sessions" ON public.practice_sessions FOR ALL USING (student_id = auth.uid() OR public.is_app_owner()) WITH CHECK (student_id = auth.uid() OR public.is_app_owner());

CREATE TABLE IF NOT EXISTS public.question_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option TEXT CHECK (selected_option IN ('A', 'B', 'C', 'D')),
    is_correct BOOLEAN NOT NULL DEFAULT false,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage question_attempts" ON public.question_attempts;
CREATE POLICY "Owner manage question_attempts" ON public.question_attempts FOR ALL USING (student_id = auth.uid() OR public.is_app_owner()) WITH CHECK (student_id = auth.uid() OR public.is_app_owner());

CREATE TABLE IF NOT EXISTS public.question_import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    total_rows INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0,
    error_log JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.question_import_batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage question_import_batches" ON public.question_import_batches;
CREATE POLICY "Owner manage question_import_batches" ON public.question_import_batches FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS public.ai_question_generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    difficulty TEXT,
    requested_count INTEGER NOT NULL DEFAULT 5,
    generated_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.ai_question_generation_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage ai_question_generation_jobs" ON public.ai_question_generation_jobs;
CREATE POLICY "Owner manage ai_question_generation_jobs" ON public.ai_question_generation_jobs FOR ALL USING (true);

-- ==============================================================================
-- 5. CBT EXAMINATION TEMPLATES, ATTEMPTS & EVALUATION MODULE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.exam_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    exam_category TEXT NOT NULL DEFAULT 'General Knowledge',
    exam_id UUID REFERENCES public.exams(id) ON DELETE SET NULL,
    exam_type TEXT NOT NULL DEFAULT 'Full-Length Mock Test',
    instructions TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    total_questions INTEGER NOT NULL DEFAULT 0,
    total_marks NUMERIC(6,2) NOT NULL DEFAULT 100.00,
    passing_marks NUMERIC(6,2),
    max_attempts INTEGER NOT NULL DEFAULT 1,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    randomize_questions BOOLEAN NOT NULL DEFAULT false,
    randomize_options BOOLEAN NOT NULL DEFAULT false,
    has_negative_marking BOOLEAN NOT NULL DEFAULT true,
    correct_marks NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    negative_marks NUMERIC(5,2) NOT NULL DEFAULT 0.25,
    unattempted_marks NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    result_release_policy TEXT NOT NULL DEFAULT 'Immediate',
    results_published BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'Published',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.exam_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage exam_templates" ON public.exam_templates;
CREATE POLICY "Owner manage exam_templates" ON public.exam_templates FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS public.exam_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.exam_templates(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 1,
    total_questions INTEGER NOT NULL DEFAULT 0,
    marks_per_question NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    negative_marks NUMERIC(5,2) NOT NULL DEFAULT 0.25,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.exam_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage exam_sections" ON public.exam_sections;
CREATE POLICY "Owner manage exam_sections" ON public.exam_sections FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS public.exam_question_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.exam_templates(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.exam_sections(id) ON DELETE SET NULL,
    order_index INTEGER NOT NULL DEFAULT 1,
    marks NUMERIC(5,2) DEFAULT 1.00,
    negative_marks NUMERIC(5,2) DEFAULT 0.25,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(template_id, question_id)
);

ALTER TABLE public.exam_question_mappings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage exam_question_mappings" ON public.exam_question_mappings;
CREATE POLICY "Owner manage exam_question_mappings" ON public.exam_question_mappings FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS public.exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.exam_templates(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'In Progress' CHECK (status IN ('In Progress', 'Submitted', 'Auto Submitted', 'Evaluated', 'Results Released', 'Cancelled')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ NOT NULL,
    submitted_at TIMESTAMPTZ,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    result_release_status TEXT NOT NULL DEFAULT 'Immediate',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage exam_attempts" ON public.exam_attempts;
CREATE POLICY "Owner manage exam_attempts" ON public.exam_attempts FOR ALL USING (student_id = auth.uid() OR public.is_app_owner()) WITH CHECK (student_id = auth.uid() OR public.is_app_owner());

CREATE TABLE IF NOT EXISTS public.exam_attempt_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.exam_sections(id) ON DELETE SET NULL,
    section_name TEXT NOT NULL DEFAULT 'General Section',
    order_index INTEGER NOT NULL DEFAULT 1,
    question_text TEXT NOT NULL,
    options_json JSONB NOT NULL,
    marks NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    negative_marks NUMERIC(5,2) NOT NULL DEFAULT 0.25,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(attempt_id, question_id)
);

ALTER TABLE public.exam_attempt_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage exam_attempt_questions" ON public.exam_attempt_questions;
CREATE POLICY "Owner manage exam_attempt_questions" ON public.exam_attempt_questions FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS public.exam_attempt_answer_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(attempt_id, question_id)
);

ALTER TABLE public.exam_attempt_answer_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage exam_attempt_answer_keys" ON public.exam_attempt_answer_keys;
CREATE POLICY "Owner manage exam_attempt_answer_keys" ON public.exam_attempt_answer_keys FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS public.exam_attempt_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option TEXT CHECK (selected_option IN ('A', 'B', 'C', 'D')),
    is_marked_for_review BOOLEAN NOT NULL DEFAULT false,
    is_visited BOOLEAN NOT NULL DEFAULT true,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    is_correct BOOLEAN,
    marks_awarded NUMERIC(5,2) DEFAULT 0.00,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(attempt_id, question_id)
);

ALTER TABLE public.exam_attempt_answers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage exam_attempt_answers" ON public.exam_attempt_answers;
CREATE POLICY "Owner manage exam_attempt_answers" ON public.exam_attempt_answers FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS public.exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID UNIQUE NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.exam_templates(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_score NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    total_possible_marks NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    percentile NUMERIC(5,2),
    rank INTEGER,
    total_candidates INTEGER DEFAULT 1,
    correct_count INTEGER NOT NULL DEFAULT 0,
    incorrect_count INTEGER NOT NULL DEFAULT 0,
    unattempted_count INTEGER NOT NULL DEFAULT 0,
    accuracy_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    time_taken_seconds INTEGER NOT NULL DEFAULT 0,
    is_passed BOOLEAN NOT NULL DEFAULT false,
    section_breakdown JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage exam_results" ON public.exam_results;
CREATE POLICY "Owner manage exam_results" ON public.exam_results FOR ALL USING (student_id = auth.uid() OR public.is_app_owner()) WITH CHECK (student_id = auth.uid() OR public.is_app_owner());

CREATE TABLE IF NOT EXISTS public.exam_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.exam_templates(id) ON DELETE SET NULL,
    attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    details_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.exam_audit_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage exam_audit_events" ON public.exam_audit_events;
CREATE POLICY "Owner manage exam_audit_events" ON public.exam_audit_events FOR ALL USING (true);

-- ==============================================================================
-- 6. REVISIONS, ANALYTICS & NOTIFICATIONS MODULE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.revision_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    interval_stage INTEGER NOT NULL DEFAULT 1,
    scheduled_date DATE NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.revision_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage revision_schedules" ON public.revision_schedules;
CREATE POLICY "Owner manage revision_schedules" ON public.revision_schedules FOR ALL USING (student_id = auth.uid() OR public.is_app_owner()) WITH CHECK (student_id = auth.uid() OR public.is_app_owner());

CREATE TABLE IF NOT EXISTS public.student_weak_area_dismissals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    dismissed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(student_id, topic_id)
);

ALTER TABLE public.student_weak_area_dismissals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage weak dismissals" ON public.student_weak_area_dismissals;
CREATE POLICY "Owner manage weak dismissals" ON public.student_weak_area_dismissals FOR ALL USING (student_id = auth.uid() OR public.is_app_owner()) WITH CHECK (student_id = auth.uid() OR public.is_app_owner());

CREATE TABLE IF NOT EXISTS public.student_study_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    is_dismissed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.student_study_recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage recommendations" ON public.student_study_recommendations;
CREATE POLICY "Owner manage recommendations" ON public.student_study_recommendations FOR ALL USING (student_id = auth.uid() OR public.is_app_owner()) WITH CHECK (student_id = auth.uid() OR public.is_app_owner());

CREATE TABLE IF NOT EXISTS public.student_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Info',
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.student_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage notifications" ON public.student_notifications;
CREATE POLICY "Owner manage notifications" ON public.student_notifications FOR ALL USING (student_id = auth.uid() OR public.is_app_owner()) WITH CHECK (student_id = auth.uid() OR public.is_app_owner());

CREATE TABLE IF NOT EXISTS public.student_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    daily_reminders BOOLEAN NOT NULL DEFAULT true,
    weekly_reports BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.student_notification_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage notification preferences" ON public.student_notification_preferences;
CREATE POLICY "Owner manage notification preferences" ON public.student_notification_preferences FOR ALL USING (student_id = auth.uid() OR public.is_app_owner()) WITH CHECK (student_id = auth.uid() OR public.is_app_owner());

CREATE TABLE IF NOT EXISTS public.student_ai_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    context_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.student_ai_interactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage ai interactions" ON public.student_ai_interactions;
CREATE POLICY "Owner manage ai interactions" ON public.student_ai_interactions FOR ALL USING (student_id = auth.uid() OR public.is_app_owner()) WITH CHECK (student_id = auth.uid() OR public.is_app_owner());

CREATE TABLE IF NOT EXISTS public.reminder_job_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Success',
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.reminder_job_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage reminder jobs" ON public.reminder_job_runs;
CREATE POLICY "Owner manage reminder jobs" ON public.reminder_job_runs FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details_json JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage audit logs" ON public.admin_audit_logs;
CREATE POLICY "Owner manage audit logs" ON public.admin_audit_logs FOR ALL USING (true);

-- ==============================================================================
-- 7. REFRESH SCHEMA CACHE
-- ==============================================================================
NOTIFY pgrst, 'reload schema';
