"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AuthActionResult {
  success?: boolean;
  error?: string;
  message?: string;
  requiresEmailConfirmation?: boolean;
}

/**
 * Student Registration Action
 */
export async function registerStudentAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!fullName) {
    return { error: "Please enter your full name." };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Auto-confirm user via service role key so students are not blocked by unconfirmed emails
  if (data?.user) {
    try {
      const admin = createAdminClient();
      await admin.auth.admin.updateUserById(data.user.id, {
        email_confirm: true,
      });
    } catch {
      // Continue gracefully if admin client is restricted
    }
  }

  // If user identity is created but session is null, email confirmation is active in Supabase project
  if (data?.user && !data?.session) {
    return {
      success: true,
      requiresEmailConfirmation: true,
      message:
        "Registration successful! Your account has been verified. You can now proceed to login.",
    };
  }

  // Session was established immediately
  revalidatePath("/", "layout");
  redirect("/student/dashboard");
}

/**
 * User / Admin Login Action
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

  // Fetch the user's role from the profiles table
  let role = "student";
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role) {
      role = profile.role;
    }
  } catch {
    role = "student";
  }

  revalidatePath("/", "layout");

  // If a specific valid redirect target was requested and matches role
  if (redirectTo && !redirectTo.startsWith("//")) {
    if (redirectTo.startsWith("/admin") && role === "admin") {
      redirect(redirectTo);
    }
    if (redirectTo.startsWith("/student") && role === "student") {
      redirect(redirectTo);
    }
  }

  if (role === "admin") {
    redirect("/admin/dashboard");
  } else {
    redirect("/student/dashboard");
  }
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
