import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

export interface AuthenticatedUser {
  user: {
    id: string;
    email: string;
  };
  profile: Profile;
}

/**
 * Retrieves the currently authenticated user and their profile from Supabase.
 * Returns null if not authenticated or if the profile is missing.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    return null;
  }

  const { data: rawProfile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = rawProfile as Profile | null;

  if (profileError || !profile) {
    // If the trigger hasn't fired yet or profile wasn't found, fallback with user data
    return {
      user: {
        id: user.id,
        email: user.email,
      },
      profile: {
        id: user.id,
        email: user.email,
        full_name: (user.user_metadata?.full_name as string) || null,
        role: "student",
        avatar_url: null,
        created_at: user.created_at,
        updated_at: user.created_at,
      },
    };
  }

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
  };
}

/**
 * Defense-in-depth: Requires authentication for Server Components and Server Actions.
 * Redirects to /login if unauthenticated.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const authData = await getCurrentUser();
  if (!authData) {
    redirect("/login");
  }
  return authData;
}

/**
 * Defense-in-depth: Requires specific role authorization.
 * Redirects unauthorized users to their respective dashboard.
 */
export async function requireRole(expectedRole: UserRole): Promise<AuthenticatedUser> {
  const authData = await requireAuth();

  if (authData.profile.role !== expectedRole) {
    if (authData.profile.role === "admin") {
      redirect("/admin/dashboard");
    } else {
      redirect("/student/dashboard");
    }
  }

  return authData;
}
