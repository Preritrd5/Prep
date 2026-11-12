"use client";

import { Card, CardContent, Button, Badge, Alert, InitialAppLoading } from "@/components/ui";
import { useActionState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction, type AuthActionResult } from "@/app/auth/actions";
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "";
  const errorParam = searchParams.get("error");

  const [state, formAction, isPending] = useActionState(
    loginAction,
    null as AuthActionResult | null
  );

  return (
    <div className="min-h-screen w-full bg-background text-text-primary flex flex-col items-center justify-start py-8 sm:py-12 px-4 sm:px-6 lg:px-8 selection:bg-primary selection:text-white overflow-y-auto">
      <div className="w-full max-w-md my-auto space-y-6">
        {/* Platform Branding Header (UrPlaced Standard) */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Link
              href="/"
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-gradient text-white shadow-md transition-transform hover:scale-105 active:scale-95"
              aria-label="PrepTrack Home"
            >
              <GraduationCap className="h-6 w-6" />
            </Link>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold font-mono tracking-wider uppercase">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Personal Workspace</span>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-text-primary tracking-tight">
            PrepTrack
          </h1>
          <p className="text-xs text-text-secondary">
            Personal Examination Preparation Workspace
          </p>
        </div>

        {/* Main Login Card with Top Accent Strip */}
        <Card className="w-full bg-card border-border shadow-md rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-primary-gradient" />

          <CardContent className="p-6 sm:p-8 space-y-5">
            {/* Header Title */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-heading text-text-primary">
                  Sign In
                </h2>
                <Badge variant="outline" className="text-[10px] border-primary/40 text-primary bg-primary/5 font-mono">
                  Personal Owner
                </Badge>
              </div>
              <p className="text-xs text-text-secondary">
                Enter your owner credentials to access your preparation workspace.
              </p>
            </div>

            {/* Error Banners */}
            {errorParam === "owner_restricted" && (
              <Alert variant="error" className="py-2.5 rounded-xl text-xs">
                Access restricted. PrepTrack is configured for the single authorized owner only.
              </Alert>
            )}

            {errorParam === "auth_callback_failed" && (
              <Alert variant="error" className="py-2.5 rounded-xl text-xs">
                Authentication session verification failed. Please try signing in again.
              </Alert>
            )}

            {state?.error && (
              <Alert variant="error" className="py-2.5 rounded-xl text-xs">
                {state.error}
              </Alert>
            )}

            {/* Form */}
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="redirectTo" value={redirectTo} />

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-text-primary"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="name@example.com"
                    className="block w-full h-10 rounded-xl border border-border bg-input py-2 pl-10 pr-3.5 text-xs text-text-primary placeholder:text-text-muted shadow-xs transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-text-primary"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    className="block w-full h-10 rounded-xl border border-border bg-input py-2 pl-10 pr-3.5 text-xs text-text-primary placeholder:text-text-muted shadow-xs transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full h-10 rounded-xl font-semibold text-xs shadow-xs"
                  isLoading={isPending}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Sign In
                </Button>
              </div>
            </form>

            {/* Informational notice & Privacy */}
            <div className="space-y-3 pt-3 border-t border-border/70">
              <div className="rounded-xl bg-surface-secondary/70 p-3 text-xs text-text-muted border border-border/80">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <span className="font-semibold text-text-primary">Single-Owner Architecture:</span>{" "}
                    PrepTrack is a private personal workspace. Only the configured owner is authorized to sign in.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <InitialAppLoading message="Preparing secure login..." />
      }
    >
      <LoginForm />
    </Suspense>
  );
}