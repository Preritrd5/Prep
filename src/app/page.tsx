import { Card, Badge, Button } from "@/components/ui";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookMarked,
  BarChart3,
  Lock,
  Layers,
  Calendar,
  Award,
  Database,
  BrainCircuit,
  Clock,
  Target,
  Zap,
} from "lucide-react";

export default async function HomePage() {
  const authData = await getCurrentUser();

  // If user is already authenticated, redirect to their role dashboard
  if (authData) {
    if (authData.profile.role === "admin") {
      redirect("/admin/dashboard");
    } else {
      redirect("/student/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text-primary transition-colors">
      <Navbar profile={null} />

      {/* Hero Section */}
      <main id="main-content" className="min-w-0 flex-1">
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-[var(--color-primary-subtle)] px-4 py-1.5 text-xs font-mono font-semibold text-primary shadow-xs mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                <span>EXAMINATION PREPARATION & CBT PLATFORM</span>
              </div>

              <h1 className="font-heading text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl lg:text-6xl leading-[1.1]">
                Master Competitive Exams with{" "}
                <span className="text-primary bg-clip-text text-transparent bg-primary-gradient">
                  Structured Precision
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
                PrepTrack delivers an enterprise-grade preparation workspace. Interactive hierarchical syllabus tracking, smart daily routines, high-yield MCQ question banks, and authentic Computer-Based Testing.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Start Student Preparation
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Existing User Sign In
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators Bar */}
              <div className="mt-12 pt-8 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary-subtle)] text-primary shrink-0 border border-primary/20">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm text-text-primary">3-Tier Hierarchy</div>
                    <div className="text-[11px] text-text-muted">Subject & Topics</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-success-subtle)] text-[var(--color-success-text)] shrink-0 border border-[var(--color-success-border)]">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm text-text-primary">100% Real CBT</div>
                    <div className="text-[11px] text-text-muted">Authoritative Timers</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-warning-subtle)] text-[var(--color-warning-text)] shrink-0 border border-[var(--color-warning-border)]">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm text-text-primary">Spaced Review</div>
                    <div className="text-[11px] text-text-muted">1-3-7-15-30 Cycles</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-info-subtle)] text-[var(--color-info-text)] shrink-0 border border-[var(--color-info-border)]">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm text-text-primary">Enterprise RLS</div>
                    <div className="text-[11px] text-text-muted">Role Protected</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="mt-16 sm:mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6 flex flex-col justify-between hover:border-primary/40 transition-colors">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-subtle)] text-primary mb-4 border border-primary/20">
                    <Layers className="h-5 w-5" />
                  </div>
                  <h2 className="font-heading text-lg font-bold text-text-primary">Syllabus Tracker</h2>
                  <p className="mt-2 text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Interactive hierarchical syllabus management covering subjects, chapters, and topics with progress percentages and confidence ratings.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-primary font-semibold">
                  <span>Track Competency</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Card>

              <Card className="p-6 flex flex-col justify-between hover:border-primary/40 transition-colors">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-secondary-subtle)] text-accent mb-4 border border-accent/20">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <h2 className="font-heading text-lg font-bold text-text-primary">Smart Study Planner</h2>
                  <p className="mt-2 text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Personalized 4-slot routine builder, spaced repetition review cycles (1-3-7-15-30 days), and calendar schedule synchronization.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-accent font-semibold">
                  <span>Build Routine</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Card>

              <Card className="p-6 flex flex-col justify-between hover:border-primary/40 transition-colors">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-info-subtle)] text-[var(--color-info-text)] mb-4 border border-[var(--color-info-border)]">
                    <BookMarked className="h-5 w-5" />
                  </div>
                  <h2 className="font-heading text-lg font-bold text-text-primary">MCQ Question Bank & PYQ</h2>
                  <p className="mt-2 text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Extensive repository of past year questions, subject and topic drilling, mistake notebook revision, and personal question bookmarks.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-info font-semibold">
                  <span>Practice Questions</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Card>

              <Card className="p-6 flex flex-col justify-between hover:border-primary/40 transition-colors">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-warning-subtle)] text-[var(--color-warning-text)] mb-4 border border-[var(--color-warning-border)]">
                    <Award className="h-5 w-5" />
                  </div>
                  <h2 className="font-heading text-lg font-bold text-text-primary">Full-Length CBT Mocks</h2>
                  <p className="mt-2 text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Authentic exam simulation with server-authoritative timers, negative marking, 5-state question palettes, and auto-recovery.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-warning font-semibold">
                  <span>Launch Simulator</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Card>

              <Card className="p-6 flex flex-col justify-between hover:border-primary/40 transition-colors">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-success-subtle)] text-[var(--color-success-text)] mb-4 border border-[var(--color-success-border)]">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <h2 className="font-heading text-lg font-bold text-text-primary">Diagnostic Analytics</h2>
                  <p className="mt-2 text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Deep subject accuracy metrics, identified weak areas, percentile estimates, and one-click data portability.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-success font-semibold">
                  <span>Analyze Results</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Card>

              <Card className="p-6 flex flex-col justify-between hover:border-primary/40 transition-colors">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-subtle)] text-primary mb-4 border border-primary/20">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h2 className="font-heading text-lg font-bold text-text-primary">Enterprise Governance</h2>
                  <p className="mt-2 text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Row Level Security (RLS) enforcement, immutable audit logging, and administrative question bank ingestion tools.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-primary font-semibold">
                  <span>Admin Oversight</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary-gradient text-white">
              <GraduationCap className="h-3.5 w-3.5" />
            </div>
            <span className="font-heading font-bold text-text-primary">PrepTrack</span>
            <span>&bull;</span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-primary transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-primary transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
