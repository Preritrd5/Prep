import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";

export interface AuthenticatedUser {
  user: {
    id: string;
    email: string;
  };
  profile: Profile;
  isOwner: boolean;
}

/**
 * Checks whether an authenticated user matches the configured platform owner.
 * If PREPTRACK_OWNER_USER_ID or PREPTRACK_OWNER_EMAIL is configured in server environment,
 * only that account is authorized to access the personal preparation workspace.
 */
export function isAuthorizedOwner(user: { id: string; email?: string }): boolean {
  const configuredOwnerId = process.env.PREPTRACK_OWNER_USER_ID;
  const configuredOwnerEmail = process.env.PREPTRACK_OWNER_EMAIL;

  if (configuredOwnerId) {
    return user.id === configuredOwnerId;
  }
  if (configuredOwnerEmail && user.email) {
    return user.email.toLowerCase() === configuredOwnerEmail.toLowerCase();
  }

  // Authoritative owner validation against known owner accounts
  const authorizedOwnerEmails = [
    "xa33872@gmail.com",
    "ananyadeyagond88@gmail.com",
  ];
  const authorizedOwnerIds = [
    "728b1e05-7c54-48ec-9b20-4e835d50e3ab",
    "e8637ee2-3aa4-49bc-ace3-cac63df31a4b",
  ];

  if (authorizedOwnerIds.includes(user.id)) return true;
  if (user.email && authorizedOwnerEmails.includes(user.email.toLowerCase())) return true;

  // Never fall back to treating an arbitrary authenticated user as the owner
  return false;
}

/**
 * Validates ownership against the singleton app_owner database record or environment configuration.
 */
export async function isDatabaseAppOwner(userId: string): Promise<boolean> {
  const configuredOwnerId = process.env.PREPTRACK_OWNER_USER_ID;
  if (configuredOwnerId) return userId === configuredOwnerId;

  try {
    const adminDb = createAdminClient();
    const { data } = await adminDb
      .from("app_owner")
      .select("user_id")
      .eq("singleton_id", true)
      .maybeSingle();

    if (data?.user_id) {
      return userId === data.user_id;
    }
  } catch {
    // fallback if table is staging
  }

  return true;
}

/**
 * Retrieves the currently authenticated owner and their profile from Supabase.
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
    .select("id, email, full_name, avatar_url, created_at, updated_at")
    .eq("id", user.id)
    .single();

  const profile = rawProfile as Profile | null;
  const isOwner = isAuthorizedOwner(user);

  if (profileError || !profile) {
    return {
      user: {
        id: user.id,
        email: user.email,
      },
      profile: {
        id: user.id,
        email: user.email,
        full_name: (user.user_metadata?.full_name as string) || null,
        avatar_url: null,
        created_at: user.created_at,
        updated_at: user.created_at,
      },
      isOwner,
    };
  }

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
    isOwner,
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
 * Requires the authenticated user to be the verified platform owner.
 * Any non-owner attempting access is rejected.
 */
export async function requireOwner(): Promise<AuthenticatedUser> {
  const authData = await requireAuth();

  if (!authData.isOwner) {
    redirect("/login?error=owner_restricted");
  }

  return authData;
}

