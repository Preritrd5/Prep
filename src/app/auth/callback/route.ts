import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Determine user role and redirect to dashboard
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role = (profile as { role?: string } | null)?.role;

        if (role === "admin") {
          return NextResponse.redirect(`${origin}/admin/dashboard`);
        }
        return NextResponse.redirect(`${origin}/student/dashboard`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to login with an error message
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
