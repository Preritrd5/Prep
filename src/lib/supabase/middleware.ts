import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do not run code between createServerClient and
  // supabase.auth.getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Static assets and internal routes should be bypassed
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return supabaseResponse;
  }

  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isStudentRoute = pathname.startsWith("/student");
  const isAdminRoute = pathname.startsWith("/admin");
  const isProfileRoute = pathname.startsWith("/profile");
  const isProtectedRoute = isStudentRoute || isAdminRoute || isProfileRoute;

  // Unauthenticated user trying to access protected routes
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // If user is authenticated, retrieve their role to handle routing logic
  if (user) {
    let role: string = "student";
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role) {
        role = profile.role;
      }
    } catch {
      role = "student";
    }

    // Authenticated user attempting to access login or register
    if (isAuthRoute) {
      const target = role === "admin" ? "/admin/dashboard" : "/student/dashboard";
      return NextResponse.redirect(new URL(target, request.url));
    }

    // Direct root access redirects
    if (pathname === "/student" || pathname === "/student/") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
    if (pathname === "/admin" || pathname === "/admin/") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    // Role-based protection: Student trying to access Admin routes
    if (isAdminRoute && role !== "admin") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }

    // Role-based protection: Admin trying to access Student routes (redirect to admin dashboard)
    if (isStudentRoute && role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return supabaseResponse;
}
