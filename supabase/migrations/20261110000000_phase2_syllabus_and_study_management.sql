-- ============================================================
-- PREPTRACK PHASE 2: SYLLABUS & STUDY MANAGEMENT MIGRATION
-- Database Schema, Constraints, Indexes, RLS Policies & Seed Data
-- ============================================================

-- Enable pgcrypto for UUID generation if not already active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- 1. EXAMINATIONS TABLE
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- 2. STUDENT EXAMINATIONS TABLE
-- ------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_student_exams_student ON public.student_exams(student_id);
CREATE INDEX IF NOT EXISTS idx_student_exams_exam ON public.student_exams(exam_id);

-- ------------------------------------------------------------
-- 3. SUBJECTS TABLE
-- ------------------------------------------------------------
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
CREATE INDEX IF NOT EXISTS idx_subjects_order ON public.subjects(order_index);

-- ------------------------------------------------------------
-- 4. CHAPTERS TABLE
-- ------------------------------------------------------------
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
CREATE INDEX IF NOT EXISTS idx_chapters_order ON public.chapters(order_index);

-- ------------------------------------------------------------
-- 5. TOPICS TABLE
-- ------------------------------------------------------------
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
CREATE INDEX IF NOT EXISTS idx_topics_is_personal ON public.topics(is_personal);
CREATE INDEX IF NOT EXISTS idx_topics_created_by ON public.topics(created_by);

-- ------------------------------------------------------------
-- 6. EXAM-SUBJECT MAPPINGS (M-to-N Reusability)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_subject_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    weightage_percent NUMERIC(5,2),
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(exam_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_esm_exam ON public.exam_subject_mappings(exam_id);
CREATE INDEX IF NOT EXISTS idx_esm_subject ON public.exam_subject_mappings(subject_id);

-- ------------------------------------------------------------
-- 7. EXAM-TOPIC MAPPINGS (Configurable Topic Scoping)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_topic_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(exam_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_etm_exam ON public.exam_topic_mappings(exam_id);
CREATE INDEX IF NOT EXISTS idx_etm_topic ON public.exam_topic_mappings(topic_id);

-- ------------------------------------------------------------
-- 8. TOPIC PROGRESS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.topic_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed')),
    scheduled_date DATE,
    started_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    last_studied_date TIMESTAMPTZ,
    actual_minutes INTEGER NOT NULL DEFAULT 0,
    revision_count INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(student_id, topic_id, exam_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_progress_student ON public.topic_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_topic ON public.topic_progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_status ON public.topic_progress(status);

-- ------------------------------------------------------------
-- 9. STUDY PREFERENCES TABLE
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- 10. ROUTINE TEMPLATES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.routine_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    title TEXT NOT NULL,
    exam_id UUID REFERENCES public.exams(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    priority INTEGER NOT NULL DEFAULT 2 CHECK (priority IN (1, 2, 3)),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_routine_student ON public.routine_templates(student_id);
CREATE INDEX IF NOT EXISTS idx_routine_day ON public.routine_templates(day_of_week);

-- ------------------------------------------------------------
-- 11. STUDY TASKS TABLE
-- ------------------------------------------------------------
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
    priority INTEGER NOT NULL DEFAULT 2 CHECK (priority IN (1, 2, 3)),
    status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'In Progress', 'Completed', 'Incomplete', 'Missed')),
    completed_at TIMESTAMPTZ,
    carried_from_task_id UUID REFERENCES public.study_tasks(id) ON DELETE SET NULL,
    is_carried_forward BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_study_tasks_student ON public.study_tasks(student_id);
CREATE INDEX IF NOT EXISTS idx_study_tasks_date ON public.study_tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_study_tasks_status ON public.study_tasks(status);

-- ------------------------------------------------------------
-- 12. EXAMINATION SCHEDULE EVENTS (Official Calendar)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_schedule_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('Official Examination', 'Application Opening', 'Application Closing', 'Admit Card Release', 'Result Announcement', 'Important Deadline', 'Other')),
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    official_source_url TEXT,
    verification_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_exam_events_exam ON public.exam_schedule_events(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_events_start ON public.exam_schedule_events(start_date);

-- ------------------------------------------------------------
-- 13. REVISION SCHEDULES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.revision_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    revision_number INTEGER NOT NULL DEFAULT 1,
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_revision_student ON public.revision_schedules(student_id);
CREATE INDEX IF NOT EXISTS idx_revision_date ON public.revision_schedules(scheduled_date);

-- ------------------------------------------------------------
-- 14. PERSONAL NOTES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.personal_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notes_student ON public.personal_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_notes_topic ON public.personal_notes(topic_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all 14 tables
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_subject_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_topic_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_schedule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_notes ENABLE ROW LEVEL SECURITY;

-- 1. Exams: Everyone authenticated can view active; Admins have full access
CREATE POLICY "Anyone can view active exams" ON public.exams
    FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage exams" ON public.exams
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 2. Student Exams: Student owns their selections; Admin can view all
CREATE POLICY "Students view own exams" ON public.student_exams
    FOR SELECT USING (student_id = auth.uid() OR public.is_admin());
CREATE POLICY "Students manage own exams" ON public.student_exams
    FOR ALL USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- 3. Subjects: Everyone can view published; Admins have full access
CREATE POLICY "Anyone can view published subjects" ON public.subjects
    FOR SELECT USING (is_published = true OR public.is_admin());
CREATE POLICY "Admins manage subjects" ON public.subjects
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. Chapters: Everyone can view published; Admins have full access
CREATE POLICY "Anyone can view published chapters" ON public.chapters
    FOR SELECT USING (is_published = true OR public.is_admin());
CREATE POLICY "Admins manage chapters" ON public.chapters
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. Topics: View published common topics or student's own personal topics
CREATE POLICY "View published or personal topics" ON public.topics
    FOR SELECT USING (is_published = true OR (is_personal = true AND created_by = auth.uid()) OR public.is_admin());
CREATE POLICY "Admins manage topics" ON public.topics
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Students create personal topics" ON public.topics
    FOR INSERT WITH CHECK (is_personal = true AND created_by = auth.uid());
CREATE POLICY "Students update personal topics" ON public.topics
    FOR UPDATE USING (is_personal = true AND created_by = auth.uid()) WITH CHECK (is_personal = true AND created_by = auth.uid());
CREATE POLICY "Students delete personal topics" ON public.topics
    FOR DELETE USING (is_personal = true AND created_by = auth.uid());

-- 6. Exam-Subject Mappings: Everyone can view; Admins manage
CREATE POLICY "Anyone can view exam subject mappings" ON public.exam_subject_mappings
    FOR SELECT USING (true);
CREATE POLICY "Admins manage exam subject mappings" ON public.exam_subject_mappings
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. Exam-Topic Mappings: Everyone can view; Admins manage
CREATE POLICY "Anyone can view exam topic mappings" ON public.exam_topic_mappings
    FOR SELECT USING (true);
CREATE POLICY "Admins manage exam topic mappings" ON public.exam_topic_mappings
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8. Topic Progress: Student owns their progress records; Admins can view
CREATE POLICY "Students view own progress" ON public.topic_progress
    FOR SELECT USING (student_id = auth.uid() OR public.is_admin());
CREATE POLICY "Students manage own progress" ON public.topic_progress
    FOR ALL USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- 9. Study Preferences: Student manages their own preferences; Admins can view
CREATE POLICY "Students view own preferences" ON public.study_preferences
    FOR SELECT USING (student_id = auth.uid() OR public.is_admin());
CREATE POLICY "Students manage own preferences" ON public.study_preferences
    FOR ALL USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- 10. Routine Templates: Student owns their routines; Admins can view
CREATE POLICY "Students view own routines" ON public.routine_templates
    FOR SELECT USING (student_id = auth.uid() OR public.is_admin());
CREATE POLICY "Students manage own routines" ON public.routine_templates
    FOR ALL USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- 11. Study Tasks: Student owns their tasks; Admins can view
CREATE POLICY "Students view own tasks" ON public.study_tasks
    FOR SELECT USING (student_id = auth.uid() OR public.is_admin());
CREATE POLICY "Students manage own tasks" ON public.study_tasks
    FOR ALL USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- 12. Exam Schedule Events: Everyone can view active; Admins manage
CREATE POLICY "Anyone view active events" ON public.exam_schedule_events
    FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage schedule events" ON public.exam_schedule_events
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 13. Revision Schedules: Student owns their revision records; Admins can view
CREATE POLICY "Students view own revisions" ON public.revision_schedules
    FOR SELECT USING (student_id = auth.uid() OR public.is_admin());
CREATE POLICY "Students manage own revisions" ON public.revision_schedules
    FOR ALL USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- 14. Personal Notes: Student owns their notes; Admins can view
CREATE POLICY "Students view own notes" ON public.personal_notes
    FOR SELECT USING (student_id = auth.uid() OR public.is_admin());
CREATE POLICY "Students manage own notes" ON public.personal_notes
    FOR ALL USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- ============================================================
-- SEED INITIAL EXAMINATIONS & SYLLABUS LIBRARY
-- ============================================================

-- Insert Examinations
INSERT INTO public.exams (category, sub_category, name, code, description) VALUES
('GATE', 'Civil Engineering', 'GATE — Civil Engineering', 'GATE-CE', 'Graduate Aptitude Test in Engineering for Civil Engineering discipline'),
('GATE', 'Computer Science & IT', 'GATE — Computer Science & Information Technology', 'GATE-CS', 'Graduate Aptitude Test in Engineering for CS & IT discipline'),
('KAS', 'General Studies', 'KAS — Karnataka Administrative Services', 'KAS-GS', 'Karnataka Public Service Commission Gazetted Probationers Examination'),
('UPSC', 'Civil Services', 'UPSC — Civil Services Examination', 'UPSC-CSE', 'Union Public Service Commission Civil Services Preliminary & Mains'),
('Railway Examinations', 'RRB NTPC', 'Railway — RRB Non-Technical Popular Categories', 'RRB-NTPC', 'Railway Recruitment Board NTPC Graduate & Under Graduate Posts'),
('Railway Examinations', 'RRB JE', 'Railway — RRB Junior Engineer', 'RRB-JE', 'Railway Recruitment Board Junior Engineer Examination'),
('KEA Examinations', 'Land Surveyor', 'KEA — Land Surveyor', 'KEA-LS', 'Karnataka Examination Authority Land Surveyor Recruitment'),
('KEA Examinations', 'VAO', 'KEA — Village Administrative Officer', 'KEA-VAO', 'Karnataka Examination Authority Village Administrative Officer Recruitment'),
('KEA Examinations', 'SDA', 'KEA — Second Division Assistant', 'KEA-SDA', 'Karnataka Examination Authority Second Division Assistant Examination'),
('KEA Examinations', 'FDA', 'KEA — First Division Assistant', 'KEA-FDA', 'Karnataka Examination Authority First Division Assistant Examination'),
('AE Civil Engineering', 'Public Works', 'Assistant Engineer (AE) — Civil Engineering', 'AE-CIVIL', 'Assistant Engineer Recruitment for PWD, WRD and Irrigation Departments'),
('General Knowledge', 'Core Study Library', 'General Knowledge Study Library', 'GK-CORE', 'Comprehensive Foundation General Studies & Static GK Repository')
ON CONFLICT (code) DO NOTHING;

-- Insert Core General Knowledge Subjects
INSERT INTO public.subjects (name, code, category, description, order_index) VALUES
('Current Affairs', 'GK-CA', 'General Studies', 'National, International and State Current Affairs', 1),
('Indian History', 'GK-HIST', 'General Studies', 'Ancient, Medieval, Modern Indian History and Art & Culture', 2),
('Geography', 'GK-GEOG', 'General Studies', 'Physical, World and Indian Geography', 3),
('Environment and Ecology', 'GK-ENV', 'General Studies', 'Ecosystem, Pollution, Biodiversity, Climate and Disaster Management', 4),
('Indian Polity', 'GK-POLITY', 'General Studies', 'Constitution, Governance, Political System and Public Policy', 5),
('Indian Economy', 'GK-ECON', 'General Studies', 'Economic Development, Planning, Banking and Agriculture', 6),
('General Science', 'GK-SCI', 'General Studies', 'Fundamentals of Physics, Chemistry and Biology', 7),
('Science and Technology', 'GK-SCITECH', 'General Studies', 'Space, Nuclear, Defence, Biotech, IT and Nanotechnology', 8),
('Computer Knowledge', 'GK-COMP', 'General Studies', 'Fundamentals, Software, OS, Networking, Internet & Security', 9),
('Static GK', 'GK-STATIC', 'General Studies', 'Capitals, Currencies, Monuments, Books, Awards, Organisations', 10),
('Mental Ability', 'GK-APT', 'Aptitude', 'Logical Reasoning, Analytical Ability and Quantitative Aptitude', 11),
('Engineering Mathematics', 'GATE-EM', 'Technical', 'Linear Algebra, Calculus, Differential Equations, Probability & Statistics', 12),
('General Aptitude (GATE)', 'GATE-GA', 'Aptitude', 'Verbal Aptitude and Numerical Ability', 13),
('Structural Engineering', 'CE-STRUCT', 'Technical', 'Mechanics, Structural Analysis, Concrete & Steel Structures', 14),
('Geotechnical Engineering', 'CE-GEO', 'Technical', 'Soil Mechanics and Foundation Engineering', 15),
('Environmental Engineering', 'CE-ENV', 'Technical', 'Water Supply, Wastewater Treatment and Air Pollution', 16),
('Transportation Engineering', 'CE-TRANS', 'Technical', 'Highway Engineering, Pavements and Traffic Engineering', 17),
('Hydraulics & Water Resources', 'CE-WATER', 'Technical', 'Fluid Mechanics, Open Channel Flow, Hydrology and Irrigation', 18)
ON CONFLICT (code) DO NOTHING;

-- Insert Chapters for Indian History
INSERT INTO public.chapters (subject_id, title, description, order_index)
SELECT id, 'Ancient Indian History', 'Prehistoric Period, Indus Valley, Vedic Age, Mauryan & Gupta Empires', 1
FROM public.subjects WHERE code = 'GK-HIST'
ON CONFLICT DO NOTHING;

INSERT INTO public.chapters (subject_id, title, description, order_index)
SELECT id, 'Medieval Indian History', 'Delhi Sultanate, Mughal Empire, Vijayanagara and Marathas', 2
FROM public.subjects WHERE code = 'GK-HIST'
ON CONFLICT DO NOTHING;

INSERT INTO public.chapters (subject_id, title, description, order_index)
SELECT id, 'Modern Indian History', 'European Advent, 1857 Revolt, Indian National Movement & Independence', 3
FROM public.subjects WHERE code = 'GK-HIST'
ON CONFLICT DO NOTHING;

INSERT INTO public.chapters (subject_id, title, description, order_index)
SELECT id, 'Art and Culture', 'Indian Architecture, Sculpture, Paintings, Music, Dance and Festivals', 4
FROM public.subjects WHERE code = 'GK-HIST'
ON CONFLICT DO NOTHING;

-- Insert Chapters for Environment and Ecology
INSERT INTO public.chapters (subject_id, title, description, order_index)
SELECT id, 'Ecosystem & Biodiversity', 'Structure, Biomes, Protected Areas and Conservation', 1
FROM public.subjects WHERE code = 'GK-ENV'
ON CONFLICT DO NOTHING;

INSERT INTO public.chapters (subject_id, title, description, order_index)
SELECT id, 'Environmental Pollution & Climate Change', 'Air, Water, Soil Pollution, Global Warming and Treaties', 2
FROM public.subjects WHERE code = 'GK-ENV'
ON CONFLICT DO NOTHING;

INSERT INTO public.chapters (subject_id, title, description, order_index)
SELECT id, 'Sustainable Development & Disaster Management', 'Renewable Energy, SDGs, Natural Hazards and Mitigation', 3
FROM public.subjects WHERE code = 'GK-ENV'
ON CONFLICT DO NOTHING;

-- Insert Chapters for Computer Knowledge
INSERT INTO public.chapters (subject_id, title, description, order_index)
SELECT id, 'Computer Fundamentals & Hardware', 'Architecture, CPU, Memory, I/O Devices and Generations', 1
FROM public.subjects WHERE code = 'GK-COMP'
ON CONFLICT DO NOTHING;

INSERT INTO public.chapters (subject_id, title, description, order_index)
SELECT id, 'Software & Operating Systems', 'System/Application Software, Windows, Linux and Commands', 2
FROM public.subjects WHERE code = 'GK-COMP'
ON CONFLICT DO NOTHING;

INSERT INTO public.chapters (subject_id, title, description, order_index)
SELECT id, 'Networking, Internet & Cybersecurity', 'Network Topologies, Protocols, Web, Security Threats and Malware', 3
FROM public.subjects WHERE code = 'GK-COMP'
ON CONFLICT DO NOTHING;

-- Map Common Subjects to Examinations (Demonstrating Multi-Exam Reusability)
-- 1. KAS includes GK-HIST, GK-GEOG, GK-POLITY, GK-ECON, GK-ENV, GK-SCI, GK-CA, GK-APT
INSERT INTO public.exam_subject_mappings (exam_id, subject_id, weightage_percent, order_index)
SELECT e.id, s.id, 15.0, 1 FROM public.exams e, public.subjects s WHERE e.code = 'KAS-GS' AND s.code = 'GK-HIST'
ON CONFLICT DO NOTHING;
INSERT INTO public.exam_subject_mappings (exam_id, subject_id, weightage_percent, order_index)
SELECT e.id, s.id, 15.0, 2 FROM public.exams e, public.subjects s WHERE e.code = 'KAS-GS' AND s.code = 'GK-GEOG'
ON CONFLICT DO NOTHING;
INSERT INTO public.exam_subject_mappings (exam_id, subject_id, weightage_percent, order_index)
SELECT e.id, s.id, 20.0, 3 FROM public.exams e, public.subjects s WHERE e.code = 'KAS-GS' AND s.code = 'GK-POLITY'
ON CONFLICT DO NOTHING;
INSERT INTO public.exam_subject_mappings (exam_id, subject_id, weightage_percent, order_index)
SELECT e.id, s.id, 15.0, 4 FROM public.exams e, public.subjects s WHERE e.code = 'KAS-GS' AND s.code = 'GK-ECON'
ON CONFLICT DO NOTHING;
INSERT INTO public.exam_subject_mappings (exam_id, subject_id, weightage_percent, order_index)
SELECT e.id, s.id, 15.0, 5 FROM public.exams e, public.subjects s WHERE e.code = 'KAS-GS' AND s.code = 'GK-ENV'
ON CONFLICT DO NOTHING;
INSERT INTO public.exam_subject_mappings (exam_id, subject_id, weightage_percent, order_index)
SELECT e.id, s.id, 20.0, 6 FROM public.exams e, public.subjects s WHERE e.code = 'KAS-GS' AND s.code = 'GK-APT'
ON CONFLICT DO NOTHING;

-- 2. GATE-CE includes GATE-EM, GATE-GA, CE-STRUCT, CE-GEO, CE-ENV, CE-TRANS, CE-WATER
INSERT INTO public.exam_subject_mappings (exam_id, subject_id, weightage_percent, order_index)
SELECT e.id, s.id, 13.0, 1 FROM public.exams e, public.subjects s WHERE e.code = 'GATE-CE' AND s.code = 'GATE-EM'
ON CONFLICT DO NOTHING;
INSERT INTO public.exam_subject_mappings (exam_id, subject_id, weightage_percent, order_index)
SELECT e.id, s.id, 15.0, 2 FROM public.exams e, public.subjects s WHERE e.code = 'GATE-CE' AND s.code = 'GATE-GA'
ON CONFLICT DO NOTHING;
INSERT INTO public.exam_subject_mappings (exam_id, subject_id, weightage_percent, order_index)
SELECT e.id, s.id, 25.0, 3 FROM public.exams e, public.subjects s WHERE e.code = 'GATE-CE' AND s.code = 'CE-STRUCT'
ON CONFLICT DO NOTHING;
INSERT INTO public.exam_subject_mappings (exam_id, subject_id, weightage_percent, order_index)
SELECT e.id, s.id, 15.0, 4 FROM public.exams e, public.subjects s WHERE e.code = 'GATE-CE' AND s.code = 'CE-GEO'
ON CONFLICT DO NOTHING;
INSERT INTO public.exam_subject_mappings (exam_id, subject_id, weightage_percent, order_index)
SELECT e.id, s.id, 12.0, 5 FROM public.exams e, public.subjects s WHERE e.code = 'GATE-CE' AND s.code = 'CE-ENV'
ON CONFLICT DO NOTHING;
INSERT INTO public.exam_subject_mappings (exam_id, subject_id, weightage_percent, order_index)
SELECT e.id, s.id, 10.0, 6 FROM public.exams e, public.subjects s WHERE e.code = 'GATE-CE' AND s.code = 'CE-TRANS'
ON CONFLICT DO NOTHING;
INSERT INTO public.exam_subject_mappings (exam_id, subject_id, weightage_percent, order_index)
SELECT e.id, s.id, 10.0, 7 FROM public.exams e, public.subjects s WHERE e.code = 'GATE-CE' AND s.code = 'CE-WATER'
ON CONFLICT DO NOTHING;

-- 3. AE-CIVIL maps to technical CE subjects + General Studies
INSERT INTO public.exam_subject_mappings (exam_id, subject_id, weightage_percent, order_index)
SELECT e.id, s.id, 25.0, 1 FROM public.exams e, public.subjects s WHERE e.code = 'AE-CIVIL' AND s.code = 'CE-STRUCT'
ON CONFLICT DO NOTHING;
INSERT INTO public.exam_subject_mappings (exam_id, subject_id, weightage_percent, order_index)
SELECT e.id, s.id, 20.0, 2 FROM public.exams e, public.subjects s WHERE e.code = 'AE-CIVIL' AND s.code = 'CE-GEO'
ON CONFLICT DO NOTHING;
INSERT INTO public.exam_subject_mappings (exam_id, subject_id, weightage_percent, order_index)
SELECT e.id, s.id, 20.0, 3 FROM public.exams e, public.subjects s WHERE e.code = 'AE-CIVIL' AND s.code = 'CE-WATER'
ON CONFLICT DO NOTHING;
INSERT INTO public.exam_subject_mappings (exam_id, subject_id, weightage_percent, order_index)
SELECT e.id, s.id, 20.0, 4 FROM public.exams e, public.subjects s WHERE e.code = 'AE-CIVIL' AND s.code = 'CE-ENV'
ON CONFLICT DO NOTHING;
INSERT INTO public.exam_subject_mappings (exam_id, subject_id, weightage_percent, order_index)
SELECT e.id, s.id, 15.0, 5 FROM public.exams e, public.subjects s WHERE e.code = 'AE-CIVIL' AND s.code = 'GK-POLITY'
ON CONFLICT DO NOTHING;
