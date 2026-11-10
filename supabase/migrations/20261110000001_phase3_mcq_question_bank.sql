-- ============================================================
-- PREPTRACK PHASE 3: MCQ QUESTION BANK & PRACTICE SYSTEM
-- Database Schema, Answer Key Security, RLS Policies & Seed PYQs
-- ============================================================

-- ------------------------------------------------------------
-- 1. QUESTION BANKS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.question_banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false, -- true = Admin common library, false = Student private bank
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_qb_is_system ON public.question_banks(is_system);
CREATE INDEX IF NOT EXISTS idx_qb_created_by ON public.question_banks(created_by);

-- ------------------------------------------------------------
-- 2. QUESTIONS TABLE (Public Question Content - No Answer Key)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID REFERENCES public.question_banks(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    difficulty TEXT NOT NULL DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    source_type TEXT NOT NULL DEFAULT 'Manual' CHECK (source_type IN ('Manual', 'CSV Import', 'Excel Import', 'AI Generated', 'Previous Year Question', 'Student Created')),
    pyq_exam_name TEXT,
    pyq_year INTEGER,
    source_reference TEXT,
    status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Draft', 'Pending Review', 'Approved', 'Published', 'Archived', 'Rejected')),
    is_personal BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON public.questions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON public.questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_source_type ON public.questions(source_type);
CREATE INDEX IF NOT EXISTS idx_questions_is_personal ON public.questions(is_personal);

-- ------------------------------------------------------------
-- 3. QUESTION OPTIONS TABLE (Four Options A, B, C, D)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    option_label TEXT NOT NULL CHECK (option_label IN ('A', 'B', 'C', 'D')),
    option_text TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(question_id, option_label)
);

CREATE INDEX IF NOT EXISTS idx_qo_question ON public.question_options(question_id);

-- ------------------------------------------------------------
-- 4. QUESTION ANSWER KEYS TABLE (PROTECTED - Strict Security Boundary)
-- Stored in a separate table with strict access control so students
-- cannot query the correct option before evaluating their attempt.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.question_answer_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID UNIQUE NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_qak_question ON public.question_answer_keys(question_id);

-- ------------------------------------------------------------
-- 5. QUESTION-EXAM MAPPINGS (M-to-N Reusable Mapping)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.question_exam_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    is_verified_pyq BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(question_id, exam_id)
);

CREATE INDEX IF NOT EXISTS idx_qem_question ON public.question_exam_mappings(question_id);
CREATE INDEX IF NOT EXISTS idx_qem_exam ON public.question_exam_mappings(exam_id);

-- ------------------------------------------------------------
-- 6. QUESTION BOOKMARKS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.question_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(student_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_qb_student ON public.question_bookmarks(student_id);

-- ------------------------------------------------------------
-- 7. PRACTICE SESSIONS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.practice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN ('Learn', 'Test')),
    exam_id UUID REFERENCES public.exams(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    total_questions INTEGER NOT NULL DEFAULT 0,
    attempted_questions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    incorrect_answers INTEGER NOT NULL DEFAULT 0,
    score_percent NUMERIC(5,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'In Progress' CHECK (status IN ('In Progress', 'Completed', 'Abandoned')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ps_student ON public.practice_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_ps_exam ON public.practice_sessions(exam_id);
CREATE INDEX IF NOT EXISTS idx_ps_status ON public.practice_sessions(status);

-- ------------------------------------------------------------
-- 8. QUESTION ATTEMPTS TABLE (Historical Question Practice Log)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.question_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option TEXT CHECK (selected_option IN ('A', 'B', 'C', 'D')),
    is_correct BOOLEAN NOT NULL,
    time_spent_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_qa_session ON public.question_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_qa_student ON public.question_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_qa_question ON public.question_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_qa_is_correct ON public.question_attempts(is_correct);

-- ------------------------------------------------------------
-- 9. QUESTION IMPORT BATCHES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.question_import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('CSV', 'XLSX')),
    total_rows INTEGER NOT NULL DEFAULT 0,
    valid_rows INTEGER NOT NULL DEFAULT 0,
    invalid_rows INTEGER NOT NULL DEFAULT 0,
    duplicate_rows INTEGER NOT NULL DEFAULT 0,
    imported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------
-- 10. AI QUESTION GENERATION JOBS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_question_generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    prompt TEXT,
    requested_count INTEGER NOT NULL DEFAULT 10,
    generated_count INTEGER NOT NULL DEFAULT 0,
    difficulty TEXT NOT NULL DEFAULT 'Medium',
    language TEXT NOT NULL DEFAULT 'English',
    status TEXT NOT NULL DEFAULT 'Completed' CHECK (status IN ('Pending', 'Processing', 'Completed', 'Failed')),
    error_message TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_exam_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_question_generation_jobs ENABLE ROW LEVEL SECURITY;

-- 1. Question Banks Policies
CREATE POLICY "View public or personal banks" ON public.question_banks
    FOR SELECT USING (is_published = true OR (is_system = false AND created_by = auth.uid()) OR public.is_admin());
CREATE POLICY "Admins manage question banks" ON public.question_banks
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Students manage personal banks" ON public.question_banks
    FOR ALL USING (is_system = false AND created_by = auth.uid()) WITH CHECK (is_system = false AND created_by = auth.uid());

-- 2. Questions Policies
CREATE POLICY "View published or personal questions" ON public.questions
    FOR SELECT USING (status = 'Published' OR (is_personal = true AND created_by = auth.uid()) OR public.is_admin());
CREATE POLICY "Admins manage questions" ON public.questions
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Students manage personal questions" ON public.questions
    FOR ALL USING (is_personal = true AND created_by = auth.uid()) WITH CHECK (is_personal = true AND created_by = auth.uid());

-- 3. Question Options Policies
CREATE POLICY "View options for viewable questions" ON public.question_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.questions q
            WHERE q.id = question_id
            AND (q.status = 'Published' OR (q.is_personal = true AND q.created_by = auth.uid()) OR public.is_admin())
        )
    );
CREATE POLICY "Admins manage question options" ON public.question_options
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Students manage personal question options" ON public.question_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.questions q
            WHERE q.id = question_id
            AND q.is_personal = true AND q.created_by = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.questions q
            WHERE q.id = question_id
            AND q.is_personal = true AND q.created_by = auth.uid()
        )
    );

-- 4. Question Answer Keys (MODULE 14 SECURITY BOUNDARY)
-- Students can ONLY read answer keys for questions they PERSONALLY created.
-- Common published question keys can NEVER be read directly by client queries.
CREATE POLICY "Students read own personal answer keys" ON public.question_answer_keys
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.questions q
            WHERE q.id = question_id
            AND q.is_personal = true AND q.created_by = auth.uid()
        )
    );
CREATE POLICY "Admins manage answer keys" ON public.question_answer_keys
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Students manage personal answer keys" ON public.question_answer_keys
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.questions q
            WHERE q.id = question_id
            AND q.is_personal = true AND q.created_by = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.questions q
            WHERE q.id = question_id
            AND q.is_personal = true AND q.created_by = auth.uid()
        )
    );

-- 5. Question Exam Mappings Policies
CREATE POLICY "Anyone view question exam mappings" ON public.question_exam_mappings
    FOR SELECT USING (true);
CREATE POLICY "Admins manage question exam mappings" ON public.question_exam_mappings
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. Question Bookmarks Policies
CREATE POLICY "Students manage own bookmarks" ON public.question_bookmarks
    FOR ALL USING (student_id = auth.uid() OR public.is_admin()) WITH CHECK (student_id = auth.uid());

-- 7. Practice Sessions Policies
CREATE POLICY "Students manage own sessions" ON public.practice_sessions
    FOR ALL USING (student_id = auth.uid() OR public.is_admin()) WITH CHECK (student_id = auth.uid());

-- 8. Question Attempts Policies
CREATE POLICY "Students manage own attempts" ON public.question_attempts
    FOR ALL USING (student_id = auth.uid() OR public.is_admin()) WITH CHECK (student_id = auth.uid());

-- 9. Import Batches & AI Jobs Policies
CREATE POLICY "Admins manage import batches" ON public.question_import_batches
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage ai jobs" ON public.ai_question_generation_jobs
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- SEED INITIAL CORE QUESTIONS & VERIFIED PYQs
-- ============================================================

-- 1. Create Default Central Question Bank
INSERT INTO public.question_banks (name, description, is_system, is_published)
VALUES ('Central Question Repository', 'Primary Admin-curated competitive examination MCQ repository', true, true)
ON CONFLICT DO NOTHING;

-- 2. Seed Sample PYQ Question 1: Modern Indian History (UPSC / KAS)
DO $$
DECLARE
    bank_uuid UUID;
    hist_subj_uuid UUID;
    q1_uuid UUID;
    exam_upsc_uuid UUID;
    exam_kas_uuid UUID;
BEGIN
    SELECT id INTO bank_uuid FROM public.question_banks WHERE is_system = true LIMIT 1;
    SELECT id INTO hist_subj_uuid FROM public.subjects WHERE code = 'GK-HIST' LIMIT 1;
    SELECT id INTO exam_upsc_uuid FROM public.exams WHERE code = 'UPSC-CSE' LIMIT 1;
    SELECT id INTO exam_kas_uuid FROM public.exams WHERE code = 'KAS-GS' LIMIT 1;

    IF hist_subj_uuid IS NOT NULL THEN
        INSERT INTO public.questions (
            bank_id, question_text, subject_id, difficulty, source_type,
            pyq_exam_name, pyq_year, source_reference, status
        ) VALUES (
            bank_uuid,
            'With reference to the Indian National Movement, consider the following events: 1. Champaran Satyagraha 2. Kheda Satyagraha 3. Ahmedabad Mill Strike. Which is the correct chronological sequence?',
            hist_subj_uuid, 'Medium', 'Previous Year Question',
            'UPSC Civil Services Prelims', 2018, 'UPSC CSE 2018 General Studies Paper I', 'Published'
        ) RETURNING id INTO q1_uuid;

        IF q1_uuid IS NOT NULL THEN
            INSERT INTO public.question_options (question_id, option_label, option_text, order_index) VALUES
            (q1_uuid, 'A', '1 - 3 - 2', 1),
            (q1_uuid, 'B', '1 - 2 - 3', 2),
            (q1_uuid, 'C', '3 - 1 - 2', 3),
            (q1_uuid, 'D', '2 - 1 - 3', 4);

            INSERT INTO public.question_answer_keys (question_id, correct_option, explanation) VALUES
            (q1_uuid, 'A', 'Champaran Satyagraha took place in 1917, followed by the Ahmedabad Mill Strike in February-March 1918, and the Kheda Satyagraha in March 1918. Hence, the correct sequence is 1-3-2.');

            -- Map to both UPSC and KAS demonstrating multi-exam mapping without duplicate question records!
            IF exam_upsc_uuid IS NOT NULL THEN
                INSERT INTO public.question_exam_mappings (question_id, exam_id, is_verified_pyq)
                VALUES (q1_uuid, exam_upsc_uuid, true) ON CONFLICT DO NOTHING;
            END IF;
            IF exam_kas_uuid IS NOT NULL THEN
                INSERT INTO public.question_exam_mappings (question_id, exam_id, is_verified_pyq)
                VALUES (q1_uuid, exam_kas_uuid, true) ON CONFLICT DO NOTHING;
            END IF;
        END IF;
    END IF;
END $$;

-- 3. Seed Sample PYQ Question 2: Indian Polity (Preamble & Rights)
DO $$
DECLARE
    bank_uuid UUID;
    polity_subj_uuid UUID;
    q2_uuid UUID;
    exam_kas_uuid UUID;
    exam_upsc_uuid UUID;
BEGIN
    SELECT id INTO bank_uuid FROM public.question_banks WHERE is_system = true LIMIT 1;
    SELECT id INTO polity_subj_uuid FROM public.subjects WHERE code = 'GK-POLITY' LIMIT 1;
    SELECT id INTO exam_kas_uuid FROM public.exams WHERE code = 'KAS-GS' LIMIT 1;
    SELECT id INTO exam_upsc_uuid FROM public.exams WHERE code = 'UPSC-CSE' LIMIT 1;

    IF polity_subj_uuid IS NOT NULL THEN
        INSERT INTO public.questions (
            bank_id, question_text, subject_id, difficulty, source_type,
            pyq_exam_name, pyq_year, source_reference, status
        ) VALUES (
            bank_uuid,
            'Which Article of the Constitution of India safeguards one’s right to marry the person of one’s choice?',
            polity_subj_uuid, 'Easy', 'Previous Year Question',
            'UPSC Civil Services Prelims', 2019, 'UPSC CSE 2019 / Shafin Jahan vs Asokan K.M.', 'Published'
        ) RETURNING id INTO q2_uuid;

        IF q2_uuid IS NOT NULL THEN
            INSERT INTO public.question_options (question_id, option_label, option_text, order_index) VALUES
            (q2_uuid, 'A', 'Article 19', 1),
            (q2_uuid, 'B', 'Article 21', 2),
            (q2_uuid, 'C', 'Article 25', 3),
            (q2_uuid, 'D', 'Article 29', 4);

            INSERT INTO public.question_answer_keys (question_id, correct_option, explanation) VALUES
            (q2_uuid, 'B', 'In the Hadiya case (Shafin Jahan v. Asokan K.M. 2018), the Supreme Court affirmed that the right to marry a person of one’s choice is integral to Article 21 (Right to Life and Personal Liberty).');

            IF exam_upsc_uuid IS NOT NULL THEN
                INSERT INTO public.question_exam_mappings (question_id, exam_id, is_verified_pyq)
                VALUES (q2_uuid, exam_upsc_uuid, true) ON CONFLICT DO NOTHING;
            END IF;
            IF exam_kas_uuid IS NOT NULL THEN
                INSERT INTO public.question_exam_mappings (question_id, exam_id, is_verified_pyq)
                VALUES (q2_uuid, exam_kas_uuid, true) ON CONFLICT DO NOTHING;
            END IF;
        END IF;
    END IF;
END $$;

-- 4. Seed Sample PYQ Question 3: GATE Civil Engineering (Structural Mechanics)
DO $$
DECLARE
    bank_uuid UUID;
    struct_subj_uuid UUID;
    q3_uuid UUID;
    exam_gate_uuid UUID;
    exam_ae_uuid UUID;
BEGIN
    SELECT id INTO bank_uuid FROM public.question_banks WHERE is_system = true LIMIT 1;
    SELECT id INTO struct_subj_uuid FROM public.subjects WHERE code = 'CE-STRUCT' LIMIT 1;
    SELECT id INTO exam_gate_uuid FROM public.exams WHERE code = 'GATE-CE' LIMIT 1;
    SELECT id INTO exam_ae_uuid FROM public.exams WHERE code = 'AE-CIVIL' LIMIT 1;

    IF struct_subj_uuid IS NOT NULL THEN
        INSERT INTO public.questions (
            bank_id, question_text, subject_id, difficulty, source_type,
            pyq_exam_name, pyq_year, source_reference, status
        ) VALUES (
            bank_uuid,
            'For a simply supported beam of span L subjected to a uniformly distributed load w per unit length, the maximum bending moment is:',
            struct_subj_uuid, 'Easy', 'Previous Year Question',
            'GATE Civil Engineering', 2021, 'GATE CE 2021 Session 1', 'Published'
        ) RETURNING id INTO q3_uuid;

        IF q3_uuid IS NOT NULL THEN
            INSERT INTO public.question_options (question_id, option_label, option_text, order_index) VALUES
            (q3_uuid, 'A', 'wL^2 / 4', 1),
            (q3_uuid, 'B', 'wL^2 / 8', 2),
            (q3_uuid, 'C', 'wL^2 / 12', 3),
            (q3_uuid, 'D', 'wL^2 / 16', 4);

            INSERT INTO public.question_answer_keys (question_id, correct_option, explanation) VALUES
            (q3_uuid, 'B', 'For a simply supported beam carrying a UDL of w over its entire span L, the maximum bending moment occurs at midspan and is given by M_max = (w * L^2) / 8.');

            IF exam_gate_uuid IS NOT NULL THEN
                INSERT INTO public.question_exam_mappings (question_id, exam_id, is_verified_pyq)
                VALUES (q3_uuid, exam_gate_uuid, true) ON CONFLICT DO NOTHING;
            END IF;
            IF exam_ae_uuid IS NOT NULL THEN
                INSERT INTO public.question_exam_mappings (question_id, exam_id, is_verified_pyq)
                VALUES (q3_uuid, exam_ae_uuid, true) ON CONFLICT DO NOTHING;
            END IF;
        END IF;
    END IF;
END $$;
