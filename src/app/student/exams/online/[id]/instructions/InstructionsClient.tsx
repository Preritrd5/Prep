"use client";

import { Card, Badge, Button, Alert } from "@/components/ui";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Award,
  Play,
  ArrowLeft,
  FileText,
} from "lucide-react";
import type { ExamTemplate, ExamAttempt } from "@/lib/types";
import { studentStartExamAttemptAction } from "@/app/actions/exams-online";

interface InstructionsClientProps {
  template: ExamTemplate;
  pastAttempts: ExamAttempt[];
}

export default function InstructionsClient({
  template,
  pastAttempts,
}: InstructionsClientProps) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const completedAttempts = pastAttempts.filter((a) =>
    ["Submitted", "Auto Submitted", "Evaluated", "Results Released"].includes(a.status)
  ).length;

  const attemptsRemaining =
    template.max_attempts > 0 ? Math.max(0, template.max_attempts - completedAttempts) : "Unlimited";

  const handleStartExam = () => {
    if (!agreed) {
      setErrorMsg("Please acknowledge and accept the examination instructions before proceeding.");
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      const res = await studentStartExamAttemptAction(template.id);
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.attemptId) {
        router.push(`/student/exams/online/attempt/${res.attemptId}`);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link href="/student/exams/online">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-text-muted hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" /> Back to Examination Portal
          </Button>
        </Link>
      </div>

      {errorMsg && (
        <Alert variant="error" title={errorMsg} onClose={() => setErrorMsg(null)} />
      )}

      {/* Main Instructions Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div>
          <Badge variant="primary">
            {template.exam_category} • {template.exam_type}
          </Badge>
          <h1 className="text-2xl font-bold text-text-primary mt-2">{template.title}</h1>
          <p className="text-sm text-text-muted mt-1">{template.description}</p>
        </div>

        {/* Vital Exam Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-secondary-bg rounded-2xl border border-border">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-text-muted block">Total Duration</span>
            <span className="text-lg font-bold text-text-primary flex items-center justify-center gap-1 mt-0.5">
              <Clock className="w-4 h-4 text-text-muted" /> {template.duration_minutes} Mins
            </span>
          </div>

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-text-muted block">Total Questions</span>
            <span className="text-lg font-bold text-text-primary flex items-center justify-center gap-1 mt-0.5">
              <BookOpen className="w-4 h-4 text-text-muted" /> {template.total_questions} Questions
            </span>
          </div>

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-text-muted block">Total Marks</span>
            <span className="text-lg font-bold text-text-primary flex items-center justify-center gap-1 mt-0.5">
              <Award className="w-4 h-4 text-text-muted" /> {template.total_marks} Marks
            </span>
          </div>

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-text-muted block">Attempts Left</span>
            <span className="text-lg font-bold text-primary mt-0.5">{attemptsRemaining}</span>
          </div>
        </div>

        {/* Marking Scheme Box */}
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-text-primary space-y-2">
          <h3 className="font-bold uppercase tracking-wider text-[11px] text-primary">
            Official Marking Scheme:
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-text-secondary">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success shrink-0" />
              <span>Correct Answer: <strong>+{template.correct_marks} Marks</strong></span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-error shrink-0" />
              <span>
                Incorrect Answer:{" "}
                <strong>
                  {template.has_negative_marking ? `-${template.negative_marks} Marks` : "0 (No penalty)"}
                </strong>
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-text-muted shrink-0" />
              <span>Unattempted Question: <strong>0 Marks</strong></span>
            </li>
          </ul>
        </div>

        {/* Detailed Instructions */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <FileText className="w-4 h-4 text-text-muted" /> General Candidate Instructions:
          </h3>

          <div className="text-xs text-text-secondary space-y-2 leading-relaxed bg-card border border-border rounded-2xl p-4">
            <p>1. The countdown timer displayed on top is strictly synchronized with the server clock. When the timer reaches zero, the examination will automatically submit.</p>
            <p>2. You can navigate freely between questions using the Question Palette on the right.</p>
            <p>3. Question Palette Color Indicators:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 pb-1">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-secondary-bg border border-border" />
                <span className="text-[11px]">Not Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-error text-white text-[10px] flex items-center justify-center font-bold">1</span>
                <span className="text-[11px]">Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-success text-white text-[10px] flex items-center justify-center font-bold">1</span>
                <span className="text-[11px]">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-accent text-white text-[10px] flex items-center justify-center font-bold">1</span>
                <span className="text-[11px]">Marked Review</span>
              </div>
            </div>
            <p>4. All selected answers autosave immediately to the server upon selection. You can change your chosen answer at any time prior to final submission.</p>
            <p>5. Closing or refreshing your browser window will NOT lose your progress or extend your examination timer.</p>
            {template.instructions && (
              <div className="mt-3 pt-3 border-t border-border whitespace-pre-line">
                <strong className="text-text-primary">Special Instructions from Examiner:</strong>
                <p className="mt-1">{template.instructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Declaration & Confirmation */}
        <div className="pt-4 border-t border-border space-y-4">
          <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-border bg-secondary-bg/40 hover:bg-secondary-bg transition-colors">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-primary rounded border-border focus:ring-primary"
            />
            <span className="text-xs text-text-primary font-medium leading-snug">
              I have read, understood, and agree to abide by all the examination instructions stated above. I understand that the timer is server-enforced and my responses will be submitted automatically upon expiry.
            </span>
          </label>

          <div className="flex items-center justify-between">
            <Link
              href="/student/exams/online"
              className="text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
            >
              Cancel
            </Link>

            <Button
              variant="primary"
              size="md"
              onClick={handleStartExam}
              disabled={!agreed || isPending}
              className="gap-2 text-xs bg-success hover:bg-success/90"
            >
              <Play className="w-4 h-4 fill-current" />
              {isPending ? "Starting Examination..." : "I am Ready — Begin Examination"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
