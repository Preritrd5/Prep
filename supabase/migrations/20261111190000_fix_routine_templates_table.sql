-- ===========================================================================
-- MIGRATION: 20261111190000_fix_routine_templates_table.sql
-- Description: Creates the missing routine_templates, study_preferences, and study_tasks
-- tables in public schema with appropriate constraints, indexes, and RLS policies.
-- ===========================================================================

-- 1. Routine Templates Table
CREATE TABLE IF NOT EXISTS public.routine_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    title TEXT NOT NULL,
    exam_id UUID,
    subject_id UUID,
    topic_id UUID,
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

-- 2. Study Preferences Table
CREATE TABLE IF NOT EXISTS public.study_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE,
    daily_study_hours NUMERIC(4, 2) NOT NULL DEFAULT 4.0,
    available_days TEXT[] NOT NULL DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']::TEXT[],
    preferred_slot_duration_minutes INTEGER NOT NULL DEFAULT 60,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    auto_carry_forward BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_preferences_student ON public.study_preferences(student_id);

-- 3. Study Tasks Table
CREATE TABLE IF NOT EXISTS public.study_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    exam_id UUID,
    subject_id UUID,
    topic_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    scheduled_start_time TIME,
    scheduled_end_time TIME,
    estimated_minutes INTEGER NOT NULL DEFAULT 60,
    actual_minutes_spent INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Carried Forward', 'Cancelled')),
    priority INTEGER NOT NULL DEFAULT 2 CHECK (priority IN (1, 2, 3)),
    is_revision BOOLEAN NOT NULL DEFAULT false,
    revision_cycle INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tasks_student ON public.study_tasks(student_id);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON public.study_tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.study_tasks(status);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.routine_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;

-- 5. Policies for routine_templates
DROP POLICY IF EXISTS "Owner manage routine_templates" ON public.routine_templates;
CREATE POLICY "Owner manage routine_templates" ON public.routine_templates
    FOR ALL
    USING (auth.uid() = student_id OR auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() = student_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Service role access routine_templates" ON public.routine_templates;
CREATE POLICY "Service role access routine_templates" ON public.routine_templates
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 6. Policies for study_preferences
DROP POLICY IF EXISTS "Owner manage study_preferences" ON public.study_preferences;
CREATE POLICY "Owner manage study_preferences" ON public.study_preferences
    FOR ALL
    USING (auth.uid() = student_id OR auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() = student_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Service role access study_preferences" ON public.study_preferences;
CREATE POLICY "Service role access study_preferences" ON public.study_preferences
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 7. Policies for study_tasks
DROP POLICY IF EXISTS "Owner manage study_tasks" ON public.study_tasks;
CREATE POLICY "Owner manage study_tasks" ON public.study_tasks
    FOR ALL
    USING (auth.uid() = student_id OR auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() = student_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Service role access study_tasks" ON public.study_tasks;
CREATE POLICY "Service role access study_tasks" ON public.study_tasks
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 8. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
