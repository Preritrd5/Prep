-- ============================================================
-- PREPTRACK — PHASE 5: ANALYTICS, REVISIONS, NOTIFICATIONS,
-- REMINDERS, AUDIT LOGS & PRODUCTION OPTIMIZATIONS
-- ============================================================

-- 1. ENHANCE REVISION SCHEDULES
ALTER TABLE public.revision_schedules
    ADD COLUMN IF NOT EXISTS confidence_rating TEXT CHECK (confidence_rating IN ('Understood', 'Needs more practice', 'Not understood', 'Completed')),
    ADD COLUMN IF NOT EXISTS interval_days INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS next_revision_date DATE;

-- 2. STUDENT STUDY RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS public.student_study_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES public.exams(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('Revise Topic', 'Practice Questions', 'Review Mistakes', 'Take Mock Exam', 'Pending Target')),
    title TEXT NOT NULL,
    reason TEXT NOT NULL,
    action_url TEXT,
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Accepted', 'Dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_recom_student_status ON public.student_study_recommendations(student_id, status);
CREATE INDEX IF NOT EXISTS idx_recom_topic ON public.student_study_recommendations(topic_id);

-- 3. STUDENT NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.student_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN (
        'upcoming_task',
        'incomplete_task',
        'revision_due',
        'upcoming_exam',
        'new_published_exam',
        'mock_result_ready',
        'recommendation',
        'admin_announcement'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    entity_type TEXT,
    entity_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notif_student_read ON public.student_notifications(student_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notif_created ON public.student_notifications(created_at DESC);

-- 4. STUDENT NOTIFICATION PREFERENCES
CREATE TABLE IF NOT EXISTS public.student_notification_preferences (
    student_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    upcoming_tasks BOOLEAN NOT NULL DEFAULT true,
    incomplete_tasks BOOLEAN NOT NULL DEFAULT true,
    revisions_due BOOLEAN NOT NULL DEFAULT true,
    upcoming_exams BOOLEAN NOT NULL DEFAULT true,
    new_published_exams BOOLEAN NOT NULL DEFAULT true,
    mock_results_ready BOOLEAN NOT NULL DEFAULT true,
    study_recommendations BOOLEAN NOT NULL DEFAULT true,
    admin_announcements BOOLEAN NOT NULL DEFAULT true,
    browser_notifications_enabled BOOLEAN NOT NULL DEFAULT false,
    quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
    quiet_hours_start TIME WITHOUT TIME ZONE DEFAULT '22:00:00',
    quiet_hours_end TIME WITHOUT TIME ZONE DEFAULT '07:00:00',
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. REMINDER AUTOMATION LOGS (BATCH RUNS)
CREATE TABLE IF NOT EXISTS public.reminder_job_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Success', 'Failed', 'Partial')),
    records_processed INTEGER NOT NULL DEFAULT 0,
    details JSONB,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_job_runs_executed ON public.reminder_job_runs(executed_at DESC);

-- 6. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'CREATE',
        'UPDATE',
        'DELETE',
        'PUBLISH',
        'UNPUBLISH',
        'IMPORT',
        'REJECT',
        'RELEASE_RESULTS',
        'ROLE_CHANGE',
        'SYSTEM_CONFIG'
    )),
    target_entity TEXT NOT NULL CHECK (target_entity IN ('EXAM', 'SYLLABUS', 'QUESTION', 'MOCK_EXAM', 'USER', 'SYSTEM')),
    target_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_admin ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_entity ON public.admin_audit_logs(target_entity, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_time ON public.admin_audit_logs(created_at DESC);

-- 7. STUDENT AI INTERACTIONS (STUDY ASSISTANT)
CREATE TABLE IF NOT EXISTS public.student_ai_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('REVISION_PLAN', 'WEAK_AREA_EXPLANATION', 'PRACTICE_ADVICE', 'PROGRESS_SUMMARY', 'GENERAL_ASSIST')),
    prompt_summary TEXT NOT NULL,
    response_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_ai_student ON public.student_ai_interactions(student_id, created_at DESC);

-- 8. WEAK AREA DISMISSALS / STATUS
CREATE TABLE IF NOT EXISTS public.student_weak_area_dismissals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    dismissed_until DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(student_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_weak_dismiss_student ON public.student_weak_area_dismissals(student_id, topic_id);

-- 9. PERFORMANCE OPTIMIZATION INDEXES
CREATE INDEX IF NOT EXISTS idx_qattempts_student_correct ON public.question_attempts(student_id, is_correct, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qattempts_topic_correct ON public.question_attempts(topic_id, is_correct);
CREATE INDEX IF NOT EXISTS idx_topic_prog_student_status ON public.topic_progress(student_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_student_status_date ON public.study_tasks(student_id, status, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_results_student_eval ON public.exam_results(student_id, evaluated_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_student_status ON public.exam_attempts(student_id, status);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY POLICIES
-- ------------------------------------------------------------

ALTER TABLE public.student_study_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_job_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_weak_area_dismissals ENABLE ROW LEVEL SECURITY;

-- Recommendations: Student owns recommendations; Admins can view
CREATE POLICY "Students manage own recommendations" ON public.student_study_recommendations
    FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Admins view all recommendations" ON public.student_study_recommendations
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Notifications: Student can view, update, delete own notifications
CREATE POLICY "Students manage own notifications" ON public.student_notifications
    FOR ALL USING (auth.uid() = student_id);

-- Preferences: Student owns preferences
CREATE POLICY "Students manage own preferences" ON public.student_notification_preferences
    FOR ALL USING (auth.uid() = student_id);

-- Reminder Job Runs: Admin view only; service role inserts
CREATE POLICY "Admins view reminder runs" ON public.reminder_job_runs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Admin Audit Logs: Admins can view all; Admins can insert
CREATE POLICY "Admins view audit logs" ON public.admin_audit_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins insert audit logs" ON public.admin_audit_logs
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Student AI Interactions: Student owns AI history
CREATE POLICY "Students manage own AI interactions" ON public.student_ai_interactions
    FOR ALL USING (auth.uid() = student_id);

-- Weak Area Dismissals: Student owns dismissals
CREATE POLICY "Students manage own weak area dismissals" ON public.student_weak_area_dismissals
    FOR ALL USING (auth.uid() = student_id);
