import { requireAuth } from "@/lib/auth";
import { getStudentPracticeSessions } from "@/lib/data/questions";
import AppLayout from "@/components/layout/AppLayout";
import PracticeNavTabs from "@/components/practice/PracticeNavTabs";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  CheckSquare,
  Layers,
  Award,
  FileQuestion,
  Bookmark,
  AlertCircle,
  History,
  ArrowRight,
  Target,
  Zap,
} from "lucide-react";

export default async function PracticeHubPage() {
  const { profile, user } = await requireAuth();
  const sessions = await getStudentPracticeSessions(user.id);

  const totalAttempted = sessions.reduce((sum, s) => sum + (s.total_questions || 0), 0);
  const totalCorrect = sessions.reduce((sum, s) => sum + (s.correct_answers || 0), 0);
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  const practiceModes = [
    {
      title: "Topic-Wise Drill",
      description: "Laser-focused MCQ drill mapped to a single syllabus chapter or micro-topic.",
      href: "/practice/topic",
      icon: CheckSquare,
      badge: "High Yield",
      color: "text-primary",
      bg: "bg-[var(--color-primary-subtle)]",
    },
    {
      title: "Subject-Wise Practice",
      description: "Comprehensive mixed question drills covering entire subjects like Polity, History or Engineering.",
      href: "/practice/subject",
      icon: Layers,
      badge: "Core Review",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Exam-Wise Practice",
      description: "Targeted question practice tailored to specific patterns of GATE, KAS, UPSC, and KEA.",
      href: "/practice/exam",
      icon: Award,
      badge: "Exam Specific",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      title: "Previous Year Questions",
      description: "Practice verified authentic questions from previous years' competitive question papers.",
      href: "/practice/pyq",
      icon: FileQuestion,
      badge: "Authentic PYQs",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Saved Bookmarks",
      description: "Quick revision of difficult questions you pinned during test practice.",
      href: "/practice/bookmarks",
      icon: Bookmark,
      badge: "Revision",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Mistakes Notebook",
      description: "Target questions you previously answered incorrectly until mastered.",
      href: "/practice/incorrect",
      icon: AlertCircle,
      badge: "Weak Areas",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <AppLayout profile={profile}>
      <PageHeader
        title="MCQ Practice Hub"
        description="Master competitive syllabus topics through adaptive Learn and Test modes, topic drills, and mistake correction."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "MCQ Practice" },
        ]}
      />

      <PracticeNavTabs />

      {/* Accuracy & Volume KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-mono text-text-muted uppercase">Total MCQs Practiced</p>
              <p className="font-heading text-xl font-bold text-text-primary">{totalAttempted}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-mono text-text-muted uppercase">Overall Drill Accuracy</p>
              <p className="font-heading text-xl font-bold text-text-primary">{overallAccuracy}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <History className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-mono text-text-muted uppercase">Sessions Completed</p>
              <p className="font-heading text-xl font-bold text-text-primary">{sessions.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Practice Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {practiceModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <Link key={mode.title} href={mode.href} className="group">
              <Card className="h-full p-5 bg-card border-border hover:border-primary/50 transition-all shadow-xs hover:shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${mode.bg} ${mode.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {mode.badge}
                    </Badge>
                  </div>
                  <h3 className="font-heading text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                    {mode.title}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {mode.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Start Practice</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-text-primary">Recent Practice Sessions</h3>
            <Link href="/practice/history" className="text-xs text-primary hover:underline font-semibold">
              View all history
            </Link>
          </div>
          <div className="space-y-2">
            {sessions.slice(0, 4).map((s) => {
              const acc = s.total_questions > 0 ? Math.round((s.correct_answers / s.total_questions) * 100) : 0;
              return (
                <div key={s.id} className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-text-primary">{s.topic?.title || "Practice Session"}</p>
                    <p className="text-[10px] text-text-muted font-mono mt-0.5">
                      {s.mode} Mode • {s.total_questions} Questions • {new Date(s.started_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{acc}%</span>
                    <p className="text-[10px] text-text-muted">{s.correct_answers}/{s.total_questions} correct</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
