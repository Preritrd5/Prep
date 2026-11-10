-- ============================================================
-- PREPTRACK PHASE 4: ONLINE EXAMINATION & MOCK TEST SYSTEM
-- Database Schema, Constraints, Indexes, RLS Policies & Initial Templates
-- ============================================================

-- ------------------------------------------------------------
-- 1. EXAM TEMPLATES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    exam_category TEXT NOT NULL CHECK (exam_category IN ('GATE', 'KAS', 'UPSC', 'Railway Examinations', 'KEA Examinations', 'AE Civil Engineering', 'General Knowledge', 'Custom')),
    exam_id UUID REFERENCES public.exams(id) ON DELETE SET NULL,
    exam_type TEXT NOT NULL CHECK (exam_type IN ('Chapter Test', 'Subject Test', 'Sectional Test', 'Full-Length Mock Test', 'Previous Year Question Test', 'Custom Test')),
    instructions TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
    total_questions INTEGER NOT NULL DEFAULT 0,
    total_marks NUMERIC(6,2) NOT NULL DEFAULT 100.00,
    passing_marks NUMERIC(6,2),
    max_attempts INTEGER NOT NULL DEFAULT 1, -- 0 for unlimited
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    randomize_questions BOOLEAN NOT NULL DEFAULT true,
    randomize_options BOOLEAN NOT NULL DEFAULT false,
    has_negative_marking BOOLEAN NOT NULL DEFAULT true,
    correct_marks NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    negative_marks NUMERIC(5,2) NOT NULL DEFAULT 0.25,
    unattempted_marks NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    result_release_policy TEXT NOT NULL DEFAULT 'Immediate' CHECK (result_release_policy IN ('Immediate', 'Delayed', 'Admin Controlled')),
    results_published BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Archived')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_et_category ON public.exam_templates(exam_category);
CREATE INDEX IF NOT EXISTS idx_et_status ON public.exam_templates(status);
CREATE INDEX IF NOT EXISTS idx_et_type ON public.exam_templates(exam_type);
CREATE INDEX IF NOT EXISTS idx_et_exam_id ON public.exam_templates(exam_id);

-- ------------------------------------------------------------
-- 2. EXAM SECTIONS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.exam_templates(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    question_count INTEGER NOT NULL DEFAULT 0,
    total_marks NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    time_limit_minutes INTEGER,
    order_index INTEGER NOT NULL DEFAULT 0,
    correct_marks NUMERIC(5,2),
    negative_marks NUMERIC(5,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_es_template ON public.exam_sections(template_id);
CREATE INDEX IF NOT EXISTS idx_es_order ON public.exam_sections(order_index);

-- ------------------------------------------------------------
-- 3. EXAM QUESTION MAPPINGS TABLE (Manual question mapping)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_question_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.exam_templates(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.exam_sections(id) ON DELETE SET NULL,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    marks NUMERIC(5,2),
    negative_marks NUMERIC(5,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(template_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_eqm_template ON public.exam_question_mappings(template_id);
CREATE INDEX IF NOT EXISTS idx_eqm_question ON public.exam_question_mappings(question_id);

-- ------------------------------------------------------------
-- 4. EXAM QUESTION BLUEPRINTS TABLE (Random blueprint selection)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_question_blueprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.exam_templates(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.exam_sections(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Any')),
    question_count INTEGER NOT NULL DEFAULT 5 CHECK (question_count > 0),
    marks_per_question NUMERIC(5,2) DEFAULT 1.00,
    negative_marks_per_question NUMERIC(5,2) DEFAULT 0.25,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_eqb_template ON public.exam_question_blueprints(template_id);

-- ------------------------------------------------------------
-- 5. EXAM ATTEMPTS TABLE (Server-Authoritative Timer & State)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.exam_templates(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ NOT NULL,
    submitted_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'In Progress' CHECK (status IN ('In Progress', 'Submitted', 'Auto Submitted', 'Evaluated', 'Results Released', 'Cancelled')),
    score NUMERIC(6,2) DEFAULT 0.00,
    max_marks NUMERIC(6,2) DEFAULT 0.00,
    percentage NUMERIC(5,2) DEFAULT 0.00,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    unanswered_count INTEGER DEFAULT 0,
    time_taken_seconds INTEGER DEFAULT 0,
    result_release_status TEXT NOT NULL DEFAULT 'Immediate' CHECK (result_release_status IN ('Immediate', 'Delayed', 'Admin Controlled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_ea_student ON public.exam_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_ea_template ON public.exam_attempts(template_id);
CREATE INDEX IF NOT EXISTS idx_ea_status ON public.exam_attempts(status);
CREATE INDEX IF NOT EXISTS idx_ea_expires_at ON public.exam_attempts(expires_at);

-- ------------------------------------------------------------
-- 6. EXAM ATTEMPT QUESTIONS TABLE (Immutable Attempt Snapshot)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_attempt_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL,
    section_id UUID REFERENCES public.exam_sections(id) ON DELETE SET NULL,
    section_name TEXT,
    order_index INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    options_json JSONB NOT NULL, -- [{ option_label: 'A', option_text: '...' }]
    marks NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    negative_marks NUMERIC(5,2) NOT NULL DEFAULT 0.25,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(attempt_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_eaq_attempt ON public.exam_attempt_questions(attempt_id);

-- ------------------------------------------------------------
-- 7. EXAM ATTEMPT ANSWERS TABLE (Autosave & Review Flags)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_attempt_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
    attempt_question_id UUID NOT NULL REFERENCES public.exam_attempt_questions(id) ON DELETE CASCADE,
    selected_option TEXT CHECK (selected_option IN ('A', 'B', 'C', 'D')),
    is_marked_for_review BOOLEAN NOT NULL DEFAULT false,
    is_visited BOOLEAN NOT NULL DEFAULT true,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(attempt_id, attempt_question_id)
);

CREATE INDEX IF NOT EXISTS idx_eaa_attempt ON public.exam_attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_eaa_question ON public.exam_attempt_answers(attempt_question_id);

-- ------------------------------------------------------------
-- 8. EXAM ATTEMPT ANSWER KEYS TABLE (PROTECTED SERVER-ONLY)
-- Stored in a separate table with strict access control so students
-- cannot query the correct option during an active examination.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_attempt_answer_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
    attempt_question_id UUID UNIQUE NOT NULL REFERENCES public.exam_attempt_questions(id) ON DELETE CASCADE,
    correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_eaak_attempt ON public.exam_attempt_answer_keys(attempt_id);

-- ------------------------------------------------------------
-- 9. EXAM RESULTS TABLE (Finalized Evaluation Summary)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID UNIQUE NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.exam_templates(id) ON DELETE CASCADE,
    total_score NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    max_marks NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    positive_marks NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    negative_marks NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    accuracy_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    total_questions INTEGER NOT NULL DEFAULT 0,
    attempted_count INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    incorrect_count INTEGER NOT NULL DEFAULT 0,
    unanswered_count INTEGER NOT NULL DEFAULT 0,
    time_taken_seconds INTEGER NOT NULL DEFAULT 0,
    section_scores_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_er_student ON public.exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_er_template ON public.exam_results(template_id);

-- ------------------------------------------------------------
-- 10. EXAM AUDIT EVENTS TABLE (Administrative & Lifecycle Audit Trail)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.exam_templates(id) ON DELETE SET NULL,
    attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    details_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_eae_template ON public.exam_audit_events(template_id);
CREATE INDEX IF NOT EXISTS idx_eae_attempt ON public.exam_audit_events(attempt_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.exam_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_question_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_question_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempt_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempt_answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_audit_events ENABLE ROW LEVEL SECURITY;

-- 1. Exam Templates Policies
CREATE POLICY "View published exam templates" ON public.exam_templates
    FOR SELECT USING (status = 'Published' OR public.is_admin());
CREATE POLICY "Admins manage exam templates" ON public.exam_templates
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 2. Exam Sections Policies
CREATE POLICY "View sections of viewable templates" ON public.exam_sections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.exam_templates et
            WHERE et.id = template_id AND (et.status = 'Published' OR public.is_admin())
        )
    );
CREATE POLICY "Admins manage exam sections" ON public.exam_sections
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 3. Exam Question Mappings Policies
CREATE POLICY "View question mappings of viewable templates" ON public.exam_question_mappings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.exam_templates et
            WHERE et.id = template_id AND (et.status = 'Published' OR public.is_admin())
        )
    );
CREATE POLICY "Admins manage exam question mappings" ON public.exam_question_mappings
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. Exam Question Blueprints Policies
CREATE POLICY "Admins view blueprints" ON public.exam_question_blueprints
    FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins manage blueprints" ON public.exam_question_blueprints
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. Exam Attempts Policies
CREATE POLICY "Students view own attempts" ON public.exam_attempts
    FOR SELECT USING (student_id = auth.uid() OR public.is_admin());
CREATE POLICY "Students create own attempts" ON public.exam_attempts
    FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students update active attempt before expiry" ON public.exam_attempts
    FOR UPDATE USING (
        (student_id = auth.uid() AND status = 'In Progress' AND expires_at >= timezone('utc'::text, now()))
        OR public.is_admin()
    );

-- 6. Exam Attempt Questions Policies
CREATE POLICY "Students view own attempt questions" ON public.exam_attempt_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.exam_attempts ea
            WHERE ea.id = attempt_id AND (ea.student_id = auth.uid() OR public.is_admin())
        )
    );
CREATE POLICY "Create attempt questions" ON public.exam_attempt_questions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.exam_attempts ea
            WHERE ea.id = attempt_id AND (ea.student_id = auth.uid() OR public.is_admin())
        )
    );

-- 7. Exam Attempt Answers Policies
CREATE POLICY "Students view own attempt answers" ON public.exam_attempt_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.exam_attempts ea
            WHERE ea.id = attempt_id AND (ea.student_id = auth.uid() OR public.is_admin())
        )
    );
CREATE POLICY "Students save own answers before expiry" ON public.exam_attempt_answers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.exam_attempts ea
            WHERE ea.id = attempt_id
            AND ea.student_id = auth.uid()
            AND ea.status = 'In Progress'
            AND ea.expires_at >= timezone('utc'::text, now())
        ) OR public.is_admin()
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.exam_attempts ea
            WHERE ea.id = attempt_id
            AND ea.student_id = auth.uid()
            AND ea.status = 'In Progress'
            AND ea.expires_at >= timezone('utc'::text, now())
        ) OR public.is_admin()
    );

-- 8. Exam Attempt Answer Keys (PROTECTED SERVER-ONLY)
-- Students have NO client select permission to active keys!
CREATE POLICY "Admins view attempt answer keys" ON public.exam_attempt_answer_keys
    FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins manage attempt answer keys" ON public.exam_attempt_answer_keys
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 9. Exam Results Policies
CREATE POLICY "Students view released results" ON public.exam_results
    FOR SELECT USING (
        (student_id = auth.uid() AND (
            EXISTS (
                SELECT 1 FROM public.exam_templates et
                WHERE et.id = template_id
                AND (et.result_release_policy = 'Immediate' OR et.results_published = true)
            )
        )) OR public.is_admin()
    );
CREATE POLICY "Admins manage results" ON public.exam_results
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 10. Audit Events Policies
CREATE POLICY "Admins view audit events" ON public.exam_audit_events
    FOR SELECT USING (public.is_admin());
CREATE POLICY "Anyone insert audit events" ON public.exam_audit_events
    FOR INSERT WITH CHECK (true);

-- ============================================================
-- SEED DATA: INITIAL OFFICIAL MOCK EXAMINATIONS
-- ============================================================

INSERT INTO public.exam_templates (
    id, title, description, exam_category, exam_id, exam_type, instructions,
    duration_minutes, total_questions, total_marks, passing_marks, max_attempts,
    has_negative_marking, correct_marks, negative_marks, result_release_policy,
    results_published, status
) VALUES
(
    'et100000-0000-0000-0000-000000000001',
    'UPSC Civil Services Prelims — General Studies Mock Paper 1',
    'Full-length 100-mark diagnostic mock test modeled on the official UPSC Civil Services Preliminary examination syllabus.',
    'UPSC',
    'e1000000-0000-0000-0000-000000000004',
    'Full-Length Mock Test',
    '1. Test duration is 60 minutes.\n2. Each question carries 2.0 marks.\n3. Negative marking of 0.66 marks (-33.3%) applies for each incorrect response.\n4. You may mark questions for review and return to them anytime before time expires.\n5. When timer reaches zero, your test will auto-submit automatically.',
    60,
    5,
    10.00,
    4.00,
    3,
    true,
    2.00,
    0.66,
    'Immediate',
    true,
    'Published'
),
(
    'et100000-0000-0000-0000-000000000002',
    'KAS Gazetted Probationers — Preliminary GS Mock Exam',
    'State administrative services preparatory examination covering Indian history, Karnataka heritage, polity, and economy.',
    'KAS',
    'e1000000-0000-0000-0000-000000000003',
    'Full-Length Mock Test',
    '1. Test duration is 60 minutes.\n2. Each correct answer awards 2.0 marks.\n3. Incorrect answers incur a penalty of 0.50 marks (-25%).\n4. Unattempted questions carry zero penalty.\n5. Click Submit Examination when completed.',
    60,
    5,
    10.00,
    4.00,
    2,
    true,
    2.00,
    0.50,
    'Immediate',
    true,
    'Published'
),
(
    'et100000-0000-0000-0000-000000000003',
    'GATE Civil Engineering — Sectional Technical Mock Test',
    'Comprehensive technical test covering Structural Engineering and Geotechnical Engineering concepts for GATE aspirants.',
    'GATE',
    'e1000000-0000-0000-0000-000000000001',
    'Sectional Test',
    '1. Duration is 45 minutes.\n2. Questions carry 1 or 2 marks as marked.\n3. Negative marking of 1/3 applies for MCQs.\n4. Virtual scientific calculators are permitted in real GATE.',
    45,
    5,
    10.00,
    3.50,
    5,
    true,
    2.00,
    0.66,
    'Immediate',
    true,
    'Published'
),
(
    'et100000-0000-0000-0000-000000000004',
    'Railway RRB NTPC — General Awareness & Aptitude Mock',
    'Standard CBT-1 pattern mock examination for Railway Recruitment Board Non-Technical Popular Categories.',
    'Railway Examinations',
    'e1000000-0000-0000-0000-000000000005',
    'Full-Length Mock Test',
    '1. 60 minutes total time.\n2. 1 mark per question.\n3. 1/3 negative marking for wrong options.',
    60,
    5,
    5.00,
    2.00,
    3,
    true,
    1.00,
    0.33,
    'Immediate',
    true,
    'Published'
),
(
    'et100000-0000-0000-0000-000000000005',
    'KEA Land Surveyor / VAO — Revenue Administration Paper',
    'State examination recruitment test for Land Surveyor and Village Administrative Officer positions under KEA.',
    'KEA Examinations',
    'e1000000-0000-0000-0000-000000000006',
    'Subject Test',
    '1. Time allowed: 45 minutes.\n2. Karnataka Land Revenue Act and General Studies.\n3. 1 mark per question, 0.25 negative marking.',
    45,
    5,
    5.00,
    2.00,
    2,
    true,
    1.00,
    0.25,
    'Immediate',
    true,
    'Published'
),
(
    'et100000-0000-0000-0000-000000000006',
    'Assistant Engineer (AE) Civil — Structural & Geo Mock Test',
    'Specialized technical mock test designed for PWD and Irrigation Department Assistant Engineer examinations.',
    'AE Civil Engineering',
    'e1000000-0000-0000-0000-000000000008',
    'Subject Test',
    '1. Technical Civil Engineering examination.\n2. 2 marks per question with 0.50 negative marking.\n3. Auto-evaluates upon submission.',
    45,
    5,
    10.00,
    4.00,
    3,
    true,
    2.00,
    0.50,
    'Immediate',
    true,
    'Published'
)
ON CONFLICT (id) DO NOTHING;

-- Seed sections for UPSC template
INSERT INTO public.exam_sections (
    id, template_id, name, subject_id, question_count, total_marks, order_index, correct_marks, negative_marks
) VALUES
('es100000-0000-0000-0000-000000000001', 'et100000-0000-0000-0000-000000000001', 'History & National Movement', 's1000000-0000-0000-0000-000000000002', 2, 4.00, 1, 2.00, 0.66),
('es100000-0000-0000-0000-000000000002', 'et100000-0000-0000-0000-000000000001', 'Indian Polity & Governance', 's1000000-0000-0000-0000-000000000005', 3, 6.00, 2, 2.00, 0.66)
ON CONFLICT (id) DO NOTHING;
