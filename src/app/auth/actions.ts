"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAuthorizedOwner } from "@/lib/auth";

export interface AuthActionResult {
  success?: boolean;
  error?: string;
  message?: string;
  requiresEmailConfirmation?: boolean;
}

/**
 * Single-Owner Login Action
 */
export async function loginAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "";

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  const supabase = await createClient();

  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // If email is not confirmed, automatically confirm via admin client and retry sign in
  if (error && error.message.toLowerCase().includes("email not confirmed")) {
    try {
      const admin = createAdminClient();
      const { data: usersData } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      const userRecord = usersData?.users.find(
        (u) => u.email?.toLowerCase() === email
      );
      if (userRecord) {
        await admin.auth.admin.updateUserById(userRecord.id, {
          email_confirm: true,
        });

        // Retry sign in immediately
        const retry = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        data = retry.data;
        error = retry.error;
      }
    } catch (adminErr) {
      console.error("[Auth] Auto-confirmation attempt failed:", adminErr);
    }
  }

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return {
        error:
          "Your email address is not yet confirmed. Please verify your inbox for the confirmation link, or contact your administrator.",
      };
    }
    return { error: error.message };
  }

  if (!data?.user) {
    return { error: "Unable to authenticate. Please check your credentials." };
  }

  // Validate single-owner access
  if (!isAuthorizedOwner(data.user)) {
    await supabase.auth.signOut();
    return {
      error:
        "Access restricted. PrepTrack is a private workspace configured for the authorized owner only.",
    };
  }

  revalidatePath("/", "layout");

  // Redirect to personal preparation dashboard
  if (redirectTo && !redirectTo.startsWith("//") && !redirectTo.startsWith("/admin") && !redirectTo.startsWith("/student")) {
    redirect(redirectTo);
  }

  redirect("/dashboard");
}

/**
 * Logout Action
 */
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Profile Update Action (Name only - Role modification is prohibited)
 */
export async function updateProfileAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const fullName = (formData.get("fullName") as string)?.trim();

  if (!fullName) {
    return { error: "Full name cannot be blank." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication session expired. Please sign in again." };
  }

  // Update profile record in PostgreSQL
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    return { error: `Failed to update profile: ${error.message}` };
  }

  // Also update metadata in Supabase Auth user record
  await supabase.auth.updateUser({
    data: { full_name: fullName },
  });

  revalidatePath("/profile");
  return { success: true, message: "Profile updated successfully." };
}
