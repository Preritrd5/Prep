import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  // Immediate redirect for register -> login (public registration disabled)
  if (pathname === "/register") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Canonical mapping for all legacy /student/* and /admin/* routes
  const legacyMap: Record<string, string> = {
    "/student": "/dashboard",
    "/student/dashboard": "/dashboard",
    "/student/exams": "/examinations",
    "/student/syllabus": "/syllabus",
    "/student/routine": "/routine",
    "/student/tasks": "/tasks",
    "/student/planner": "/study-planner",
    "/student/calendar": "/calendar",
    "/student/schedule": "/calendar",
    "/student/practice": "/practice",
    "/student/practice/topic": "/practice/topic",
    "/student/practice/subject": "/practice/subject",
    "/student/practice/exam": "/practice/exam",
    "/student/practice/pyq": "/practice/pyq",
    "/student/practice/bookmarks": "/practice/bookmarks",
    "/student/practice/incorrect": "/practice/incorrect",
    "/student/practice/history": "/practice/history",
    "/student/questions": "/question-bank",
    "/student/questions/create": "/question-bank/create",
    "/student/questions/ai": "/question-bank/ai",
    "/student/questions/import": "/question-import",
    "/student/exams/online": "/online-exams/create",
    "/student/exams/create": "/online-exams/create",
    "/student/exams/online/history": "/attempts",
    "/student/assistant": "/assistant",
    "/student/revisions": "/revisions",
    "/student/analytics": "/analytics",
    "/student/reports": "/analytics",
    "/student/notifications": "/notifications",
    "/admin": "/dashboard",
    "/admin/dashboard": "/dashboard",
    "/admin/exams": "/examinations",
    "/admin/exams/create": "/online-exams/create",
    "/admin/exams/manage": "/online-exams",
    "/admin/exams/monitor": "/online-exams",
    "/admin/questions": "/question-bank",
    "/admin/questions/create": "/question-bank/create",
    "/admin/questions/import": "/question-import",
    "/admin/questions/ai": "/question-bank/ai",
    "/admin/questions/review": "/question-bank",
    "/admin/questions/quality": "/question-bank",
    "/admin/subjects": "/syllabus",
    "/admin/syllabus": "/syllabus",
    "/admin/events": "/calendar",
    "/admin/analytics": "/analytics",
    "/admin/audit-logs": "/dashboard",
  };

  if (pathname.startsWith("/student") || pathname.startsWith("/admin")) {
    const cleanPath = pathname.replace(/\/$/, "");
    const target = legacyMap[cleanPath] || legacyMap[pathname] || "/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  let user = null;
  try {
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

    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) {
      user = data.user;
    }
  } catch (authErr) {
    console.warn("[Middleware] Supabase auth check failed safely:", authErr);
    user = null;
  }

  // Static assets and internal routes should be bypassed
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return supabaseResponse;
  }

  const isAuthRoute = pathname === "/login";
  const protectedPrefixes = [
    "/dashboard",
    "/examinations",
    "/syllabus",
    "/study-planner",
    "/planner",
    "/routine",
    "/tasks",
    "/calendar",
    "/practice",
    "/question-bank",
    "/question-import",
    "/online-exams",
    "/attempts",
    "/results",
    "/assistant",
    "/revisions",
    "/analytics",
    "/reports",
    "/notifications",
    "/profile",
    "/student",
    "/admin",
  ];
  const isProtectedRoute = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  // Unauthenticated user trying to access protected routes
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Personal Workspace routing for authenticated owner
  if (user) {
    // Authenticated owner attempting to access login
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}
