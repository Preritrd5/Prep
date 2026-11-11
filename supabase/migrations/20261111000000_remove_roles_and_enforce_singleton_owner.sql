-- ==============================================================================
-- PREPTRACK SINGLE-OWNER ARCHITECTURE MIGRATION
-- Migration: 20261111000000_remove_roles_and_enforce_singleton_owner.sql
-- 
-- 1. Creates singleton public.app_owner table
-- 2. Creates secure public.is_app_owner() function
-- 3. Seeds verified owner from auth.users
-- 4. Replaces all role-based policies with is_app_owner()
-- 5. Removes protect_profile_role trigger & is_admin() function
-- 6. Drops role column from public.profiles
-- ==============================================================================

-- 1. Create Singleton App Owner Table
CREATE TABLE IF NOT EXISTS public.app_owner (
    singleton_id BOOLEAN PRIMARY KEY DEFAULT true,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    configured_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT app_owner_singleton_check CHECK (singleton_id = true)
);

ALTER TABLE public.app_owner ENABLE ROW LEVEL SECURITY;

-- Deny all client mutations to app_owner; only service_role can configure
DROP POLICY IF EXISTS "Deny client mutations to app_owner" ON public.app_owner;
CREATE POLICY "Deny client mutations to app_owner"
    ON public.app_owner
    FOR ALL
    USING (false);

-- 2. Seed primary owner account if present
DO $$
DECLARE
    owner_uuid UUID;
BEGIN
    SELECT id INTO owner_uuid FROM auth.users WHERE email = 'xa33872@gmail.com' LIMIT 1;
    IF owner_uuid IS NULL THEN
        SELECT id INTO owner_uuid FROM auth.users ORDER BY created_at ASC LIMIT 1;
    END IF;

    IF owner_uuid IS NOT NULL THEN
        INSERT INTO public.app_owner (singleton_id, user_id, configured_at)
        VALUES (true, owner_uuid, now())
        ON CONFLICT (singleton_id) DO UPDATE SET user_id = EXCLUDED.user_id;
    END IF;
END $$;

-- 3. Create Secure is_app_owner() function
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
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_app_owner() TO authenticated, anon;

-- 4. Drop role protection triggers and helper functions
DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
DROP FUNCTION IF EXISTS public.protect_profile_role();

-- 5. Update auth.users signup trigger to not reference role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_name TEXT;
BEGIN
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');

    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        user_name
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);

    RETURN NEW;
END;
$$;

-- 6. Migrate Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service and Admins can insert profiles" ON public.profiles;

CREATE POLICY "Owner can view profile"
    ON public.profiles FOR SELECT
    USING (public.is_app_owner() AND auth.uid() = id);

CREATE POLICY "Owner can update profile"
    ON public.profiles FOR UPDATE
    USING (public.is_app_owner() AND auth.uid() = id)
    WITH CHECK (public.is_app_owner() AND auth.uid() = id);

CREATE POLICY "Service or Owner can insert profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id OR public.is_app_owner());

-- 7. Migrate Syllabus & Study Management Policies
DROP POLICY IF EXISTS "Active exams are viewable by all authenticated users" ON public.exams;
DROP POLICY IF EXISTS "Admins can manage exams" ON public.exams;
CREATE POLICY "Owner can view exams" ON public.exams FOR SELECT USING (public.is_app_owner());
CREATE POLICY "Owner can manage exams" ON public.exams FOR ALL USING (public.is_app_owner()) WITH CHECK (public.is_app_owner());

DROP POLICY IF EXISTS "Students can view their own exam enrollments" ON public.student_exams;
DROP POLICY IF EXISTS "Students can manage their own exam enrollments" ON public.student_exams;
CREATE POLICY "Owner can view enrollments" ON public.student_exams FOR SELECT USING (public.is_app_owner() AND student_id = auth.uid());
CREATE POLICY "Owner can manage enrollments" ON public.student_exams FOR ALL USING (public.is_app_owner() AND student_id = auth.uid()) WITH CHECK (public.is_app_owner() AND student_id = auth.uid());

DROP POLICY IF EXISTS "Published subjects are viewable by all authenticated users" ON public.subjects;
DROP POLICY IF EXISTS "Admins can manage subjects" ON public.subjects;
CREATE POLICY "Owner can view subjects" ON public.subjects FOR SELECT USING (public.is_app_owner());
CREATE POLICY "Owner can manage subjects" ON public.subjects FOR ALL USING (public.is_app_owner()) WITH CHECK (public.is_app_owner());

DROP POLICY IF EXISTS "Published chapters are viewable by all authenticated users" ON public.chapters;
DROP POLICY IF EXISTS "Admins can manage chapters" ON public.chapters;
CREATE POLICY "Owner can view chapters" ON public.chapters FOR SELECT USING (public.is_app_owner());
CREATE POLICY "Owner can manage chapters" ON public.chapters FOR ALL USING (public.is_app_owner()) WITH CHECK (public.is_app_owner());

DROP POLICY IF EXISTS "Published or personal topics are viewable" ON public.topics;
DROP POLICY IF EXISTS "Admins can manage topics" ON public.topics;
CREATE POLICY "Owner can view topics" ON public.topics FOR SELECT USING (public.is_app_owner());
CREATE POLICY "Owner can manage topics" ON public.topics FOR ALL USING (public.is_app_owner()) WITH CHECK (public.is_app_owner());

DROP POLICY IF EXISTS "Students can view their own topic progress" ON public.student_topic_progress;
DROP POLICY IF EXISTS "Students can manage their own topic progress" ON public.student_topic_progress;
CREATE POLICY "Owner can view progress" ON public.student_topic_progress FOR SELECT USING (public.is_app_owner() AND student_id = auth.uid());
CREATE POLICY "Owner can manage progress" ON public.student_topic_progress FOR ALL USING (public.is_app_owner() AND student_id = auth.uid()) WITH CHECK (public.is_app_owner() AND student_id = auth.uid());

DROP POLICY IF EXISTS "Students can view their own tasks" ON public.student_tasks;
DROP POLICY IF EXISTS "Students can manage their own tasks" ON public.student_tasks;
CREATE POLICY "Owner can view tasks" ON public.student_tasks FOR SELECT USING (public.is_app_owner() AND student_id = auth.uid());
CREATE POLICY "Owner can manage tasks" ON public.student_tasks FOR ALL USING (public.is_app_owner() AND student_id = auth.uid()) WITH CHECK (public.is_app_owner() AND student_id = auth.uid());

DROP POLICY IF EXISTS "Students can view their own routine templates" ON public.routine_templates;
DROP POLICY IF EXISTS "Students can manage their own routine templates" ON public.routine_templates;
CREATE POLICY "Owner can view routine" ON public.routine_templates FOR SELECT USING (public.is_app_owner() AND student_id = auth.uid());
CREATE POLICY "Owner can manage routine" ON public.routine_templates FOR ALL USING (public.is_app_owner() AND student_id = auth.uid()) WITH CHECK (public.is_app_owner() AND student_id = auth.uid());

DROP POLICY IF EXISTS "Students can view their own study preferences" ON public.study_preferences;
DROP POLICY IF EXISTS "Students can manage their own study preferences" ON public.study_preferences;
CREATE POLICY "Owner can view preferences" ON public.study_preferences FOR SELECT USING (public.is_app_owner() AND student_id = auth.uid());
CREATE POLICY "Owner can manage preferences" ON public.study_preferences FOR ALL USING (public.is_app_owner() AND student_id = auth.uid()) WITH CHECK (public.is_app_owner() AND student_id = auth.uid());

DROP POLICY IF EXISTS "Official events are viewable by all authenticated users" ON public.exam_schedule_events;
DROP POLICY IF EXISTS "Admins can manage schedule events" ON public.exam_schedule_events;
CREATE POLICY "Owner can view events" ON public.exam_schedule_events FOR SELECT USING (public.is_app_owner());
CREATE POLICY "Owner can manage events" ON public.exam_schedule_events FOR ALL USING (public.is_app_owner()) WITH CHECK (public.is_app_owner());

DROP POLICY IF EXISTS "Students can view their own revision schedules" ON public.revision_schedules;
DROP POLICY IF EXISTS "Students can manage their own revision schedules" ON public.revision_schedules;
CREATE POLICY "Owner can view revisions" ON public.revision_schedules FOR SELECT USING (public.is_app_owner() AND student_id = auth.uid());
CREATE POLICY "Owner can manage revisions" ON public.revision_schedules FOR ALL USING (public.is_app_owner() AND student_id = auth.uid()) WITH CHECK (public.is_app_owner() AND student_id = auth.uid());

DROP POLICY IF EXISTS "Students can view their own notes" ON public.personal_notes;
DROP POLICY IF EXISTS "Students can manage their own notes" ON public.personal_notes;
CREATE POLICY "Owner can view notes" ON public.personal_notes FOR SELECT USING (public.is_app_owner() AND student_id = auth.uid());
CREATE POLICY "Owner can manage notes" ON public.personal_notes FOR ALL USING (public.is_app_owner() AND student_id = auth.uid()) WITH CHECK (public.is_app_owner() AND student_id = auth.uid());

-- 8. Migrate Question Bank Policies
DROP POLICY IF EXISTS "Published or personal questions are viewable" ON public.questions;
DROP POLICY IF EXISTS "Admins can manage all questions" ON public.questions;
CREATE POLICY "Owner can view questions" ON public.questions FOR SELECT USING (public.is_app_owner());
CREATE POLICY "Owner can manage questions" ON public.questions FOR ALL USING (public.is_app_owner()) WITH CHECK (public.is_app_owner());

DROP POLICY IF EXISTS "Options viewable with question" ON public.question_options;
DROP POLICY IF EXISTS "Admins can manage question options" ON public.question_options;
CREATE POLICY "Owner can view options" ON public.question_options FOR SELECT USING (public.is_app_owner());
CREATE POLICY "Owner can manage options" ON public.question_options FOR ALL USING (public.is_app_owner()) WITH CHECK (public.is_app_owner());

DROP POLICY IF EXISTS "Answer keys restricted to admins and evaluations" ON public.question_answer_keys;
DROP POLICY IF EXISTS "Admins can manage answer keys" ON public.question_answer_keys;
CREATE POLICY "Owner can manage answer keys" ON public.question_answer_keys FOR ALL USING (public.is_app_owner()) WITH CHECK (public.is_app_owner());

DROP POLICY IF EXISTS "Students can view question bookmarks" ON public.question_bookmarks;
DROP POLICY IF EXISTS "Students can manage question bookmarks" ON public.question_bookmarks;
CREATE POLICY "Owner can manage bookmarks" ON public.question_bookmarks FOR ALL USING (public.is_app_owner() AND student_id = auth.uid()) WITH CHECK (public.is_app_owner() AND student_id = auth.uid());

DROP POLICY IF EXISTS "Students can view question mistakes" ON public.question_mistakes;
DROP POLICY IF EXISTS "Students can manage question mistakes" ON public.question_mistakes;
CREATE POLICY "Owner can manage mistakes" ON public.question_mistakes FOR ALL USING (public.is_app_owner() AND student_id = auth.uid()) WITH CHECK (public.is_app_owner() AND student_id = auth.uid());

DROP POLICY IF EXISTS "Students can view practice sessions" ON public.student_practice_sessions;
DROP POLICY IF EXISTS "Students can manage practice sessions" ON public.student_practice_sessions;
CREATE POLICY "Owner can manage practice sessions" ON public.student_practice_sessions FOR ALL USING (public.is_app_owner() AND student_id = auth.uid()) WITH CHECK (public.is_app_owner() AND student_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view import batches" ON public.question_import_batches;
DROP POLICY IF EXISTS "Admins can manage import batches" ON public.question_import_batches;
CREATE POLICY "Owner can manage import batches" ON public.question_import_batches FOR ALL USING (public.is_app_owner()) WITH CHECK (public.is_app_owner());

DROP POLICY IF EXISTS "Admins can view ai jobs" ON public.ai_generation_jobs;
DROP POLICY IF EXISTS "Admins can manage ai jobs" ON public.ai_generation_jobs;
CREATE POLICY "Owner can manage ai jobs" ON public.ai_generation_jobs FOR ALL USING (public.is_app_owner()) WITH CHECK (public.is_app_owner());

-- 9. Migrate Examination System Policies
DROP POLICY IF EXISTS "Published exam templates are viewable" ON public.exam_templates;
DROP POLICY IF EXISTS "Admins can manage exam templates" ON public.exam_templates;
CREATE POLICY "Owner can view exam templates" ON public.exam_templates FOR SELECT USING (public.is_app_owner());
CREATE POLICY "Owner can manage exam templates" ON public.exam_templates FOR ALL USING (public.is_app_owner()) WITH CHECK (public.is_app_owner());

DROP POLICY IF EXISTS "Admins can manage exam blueprints" ON public.exam_question_blueprints;
CREATE POLICY "Owner can manage exam blueprints" ON public.exam_question_blueprints FOR ALL USING (public.is_app_owner()) WITH CHECK (public.is_app_owner());

DROP POLICY IF EXISTS "Students can view their own exam attempts" ON public.exam_attempts;
DROP POLICY IF EXISTS "Students can update their own in-progress attempts" ON public.exam_attempts;
CREATE POLICY "Owner can view exam attempts" ON public.exam_attempts FOR SELECT USING (public.is_app_owner() AND student_id = auth.uid());
CREATE POLICY "Owner can manage exam attempts" ON public.exam_attempts FOR ALL USING (public.is_app_owner() AND student_id = auth.uid()) WITH CHECK (public.is_app_owner() AND student_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view exam audit events" ON public.exam_audit_events;
CREATE POLICY "Owner can view exam audit events" ON public.exam_audit_events FOR ALL USING (public.is_app_owner()) WITH CHECK (public.is_app_owner());

-- 10. Migrate Analytics & Notifications Policies
DROP POLICY IF EXISTS "Students can view own AI interactions" ON public.student_ai_interactions;
DROP POLICY IF EXISTS "Students can insert own AI interactions" ON public.student_ai_interactions;
CREATE POLICY "Owner can manage AI interactions" ON public.student_ai_interactions FOR ALL USING (public.is_app_owner() AND student_id = auth.uid()) WITH CHECK (public.is_app_owner() AND student_id = auth.uid());

DROP POLICY IF EXISTS "Students can view own notifications" ON public.student_notifications;
DROP POLICY IF EXISTS "Students can update own notifications" ON public.student_notifications;
CREATE POLICY "Owner can manage notifications" ON public.student_notifications FOR ALL USING (public.is_app_owner() AND student_id = auth.uid()) WITH CHECK (public.is_app_owner() AND student_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Owner can view audit logs" ON public.admin_audit_logs FOR ALL USING (public.is_app_owner()) WITH CHECK (public.is_app_owner());

-- 11. Drop legacy is_admin() function
DROP FUNCTION IF EXISTS public.is_admin();

-- 12. Drop role index and role column from profiles
DROP INDEX IF EXISTS public.idx_profiles_role;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- 13. Owner-Restricted Private Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('question-papers', 'question-papers', false), ('study-materials', 'study-materials', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Owner manage private storage" ON storage.objects;
CREATE POLICY "Owner manage private storage" ON storage.objects
    FOR ALL
    USING (bucket_id IN ('question-papers', 'study-materials') AND public.is_app_owner())
    WITH CHECK (bucket_id IN ('question-papers', 'study-materials') AND public.is_app_owner());

