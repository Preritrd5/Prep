-- ============================================================
-- PREPTRACK DATABASE FOUNDATION MIGRATION: PROFILES & RLS
-- Phase 1: Foundation
-- ============================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Helper function to check if the current user is an Admin
-- Marked SECURITY DEFINER and fixed search_path to prevent infinite RLS recursion and privilege escalation attacks.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- 5. RLS Policies for Profiles
-- Policy A: Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Policy B: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (public.is_admin());

-- Policy C: Users can update their own profile (name, avatar), but NOT their role
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy D: Admins can update any profile
CREATE POLICY "Admins can update all profiles"
    ON public.profiles
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Policy E: Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
    ON public.profiles
    FOR DELETE
    USING (public.is_admin());

-- Policy F: Inserts handled by system triggers or admin
CREATE POLICY "Service and Admins can insert profiles"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id OR public.is_admin());

-- 6. Trigger to prevent non-admins from changing their role
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If role is modified
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        -- Allow change ONLY if caller is service_role or an admin
        IF (current_setting('request.jwt.claim.role', true) <> 'service_role') AND NOT public.is_admin() THEN
            RAISE EXCEPTION 'Unauthorized: Only administrators can modify user roles.';
        END IF;
    END IF;

    -- Update updated_at timestamp
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_role();

-- 7. Trigger to automatically create a profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_name TEXT;
BEGIN
    -- Extract full_name from raw_user_meta_data if available
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');

    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        user_name,
        'student' -- All public registrations are strictly initialized as student
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ADMINISTRATIVE PROVISIONING HELPER
-- Run this query manually in Supabase SQL editor to promote a specific user to Admin:
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'admin@yourdomain.com';
-- ============================================================
