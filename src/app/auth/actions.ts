"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  // If user identity is created but session is null, email confirmation is active in Supabase project
  if (data?.user && !data?.session) {
    return {
      success: true,
      requiresEmailConfirmation: true,
      message:
        "Registration successful! Please check your email to verify your account before logging in.",
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

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data?.user) {
    return { error: "Unable to authenticate. Please check your credentials." };
  }

  // Fetch the user's role from the profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role = (profile as { role?: string } | null)?.role || "student";

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
    return { error: "Name cannot be empty." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized session." };
  }

  // Row Level Security strictly enforces that non-admins cannot modify their role
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      updated_at: new Date().toISOString(),
    } as Record<string, unknown>)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: true, message: "Profile successfully updated." };
}
