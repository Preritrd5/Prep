"use client";

import { Card, CardContent, Button, Badge, Alert } from "@/components/ui";
import { useActionState, useState } from "react";
import Link from "next/link";
import { registerStudentAction, type AuthActionResult } from "@/app/auth/actions";
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Info,
} from "lucide-react";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    registerStudentAction,
    null as AuthActionResult | null
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setClientError(null);
    const pwd = formData.get("password") as string;
    const confirmPwd = formData.get("confirmPassword") as string;

    if (pwd !== confirmPwd) {
      setClientError("Passwords do not match.");
      return;
    }
    if (pwd.length < 6) {
      setClientError("Password must be at least 6 characters long.");
      return;
    }

    formAction(formData);
  };

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
            <span>Student Onboarding</span>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-text-primary tracking-tight">
            PrepTrack
          </h1>
          <p className="text-xs text-text-secondary">
            Structured Preparation &bull; Real-Time Analytics &bull; Mock Examinations
          </p>
        </div>

        {/* Main Card with Top Accent Strip */}
        <Card className="w-full bg-card border-border shadow-md rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-primary-gradient" />

          <CardContent className="p-6 sm:p-8 space-y-5">
            {/* Header Title */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-heading text-text-primary">
                  Create Account
                </h2>
                <Badge variant="outline" className="text-[10px] border-primary/40 text-primary bg-primary/5 font-mono">
                  Student Tier
                </Badge>
              </div>
              <p className="text-xs text-text-secondary">
                Get started with your personalized exam preparation workspace.
              </p>
            </div>

            {/* Email Confirmation Notice */}
            {state?.requiresEmailConfirmation && (
              <Alert variant="success" className="py-3 rounded-xl text-xs">
                <div className="space-y-2">
                  <p className="font-semibold">{state.message}</p>
                  <div>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1 font-bold text-success hover:underline"
                    >
                      Proceed to Sign In
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </Alert>
            )}

            {/* Error Banners */}
            {(clientError || state?.error) && !state?.requiresEmailConfirmation && (
              <Alert variant="error" className="py-2.5 rounded-xl text-xs">
                {clientError || state?.error}
              </Alert>
            )}

            {/* Registration Form */}
            {!state?.requiresEmailConfirmation && (
              <form action={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-semibold text-text-primary"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      className="block w-full h-10 rounded-xl border border-border bg-input py-2 pl-10 pr-3.5 text-xs text-text-primary placeholder:text-text-muted shadow-xs transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                    />
                  </div>
                </div>

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
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-text-primary"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="block w-full h-10 rounded-xl border border-border bg-input py-2 pl-10 pr-3.5 text-xs text-text-primary placeholder:text-text-muted shadow-xs transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-semibold text-text-primary"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="block w-full h-10 rounded-xl border border-border bg-input py-2 pl-10 pr-3.5 text-xs text-text-primary placeholder:text-text-muted shadow-xs transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-surface-secondary/70 p-3 text-xs text-text-muted border border-border/80 flex items-start gap-2.5">
                  <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                  <span className="text-[11px] leading-relaxed">
                    Student accounts receive access to practice questions, custom mock tests, syllabus tracking, and study schedules.
                  </span>
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
                    Create Student Account
                  </Button>
                </div>
              </form>
            )}

            {/* Footer Navigation */}
            <div className="pt-3 text-center border-t border-border/70">
              <p className="text-xs text-text-secondary">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}