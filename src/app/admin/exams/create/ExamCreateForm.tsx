"use client";

import { Card, Button, Alert, Input, Textarea, Select } from "@/components/ui";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  BookOpen,
  Layers,
  Clock,
} from "lucide-react";
import type {
  Exam,
  Subject,
  ExamCategory,
  OnlineExamType,
  ResultReleasePolicy,
  ExamTemplateStatus,
  Question,
} from "@/lib/types";
import { adminCreateExamTemplateAction } from "@/app/actions/exams-online";

interface ExamCreateFormProps {
  exams: Exam[];
  subjects: Subject[];
  availableQuestions: Question[];
}

export default function ExamCreateForm({
  exams,
}: ExamCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [examCategory, setExamCategory] = useState<ExamCategory>("UPSC");
  const [examId, setExamId] = useState("");
  const [examType, setExamType] = useState<OnlineExamType>("Full-Length Mock Test");
  const [instructions, setInstructions] = useState(
    "1. Test duration is timed according to standard official guidelines.\n2. Mark questions for review and navigate using the question palette.\n3. Negative marking applies for incorrect options as specified.\n4. Click Submit Examination when completed."
  );
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [totalMarks, setTotalMarks] = useState(20);
  const [passingMarks, setPassingMarks] = useState<number | "">("");
  const [maxAttempts, setMaxAttempts] = useState(2);
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);
  const [randomizeOptions, setRandomizeOptions] = useState(false);
  const [hasNegativeMarking, setHasNegativeMarking] = useState(true);
  const [correctMarks, setCorrectMarks] = useState(2.0);
  const [negativeMarks, setNegativeMarks] = useState(0.66);
  const [resultReleasePolicy, setResultReleasePolicy] = useState<ResultReleasePolicy>("Immediate");
  const [status, setStatus] = useState<ExamTemplateStatus>("Published");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("exam_category", examCategory);
    if (examId) fd.append("exam_id", examId);
    fd.append("exam_type", examType);
    fd.append("instructions", instructions);
    fd.append("duration_minutes", durationMinutes.toString());
    fd.append("total_questions", totalQuestions.toString());
    fd.append("total_marks", totalMarks.toString());
    if (passingMarks !== "") fd.append("passing_marks", passingMarks.toString());
    fd.append("max_attempts", maxAttempts.toString());
    fd.append("randomize_questions", randomizeQuestions ? "true" : "false");
    fd.append("randomize_options", randomizeOptions ? "true" : "false");
    fd.append("has_negative_marking", hasNegativeMarking ? "true" : "false");
    fd.append("correct_marks", correctMarks.toString());
    fd.append("negative_marks", negativeMarks.toString());
    fd.append("result_release_policy", resultReleasePolicy);
    fd.append("status", status);

    startTransition(async () => {
      const res = await adminCreateExamTemplateAction(fd);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        router.push("/admin/exams/manage");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/exams/manage">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-text-muted hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" /> Back to Examinations List
          </Button>
        </Link>
      </div>

      {errorMsg && (
        <Alert variant="error" title={errorMsg} onClose={() => setErrorMsg(null)} />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Core Details */}
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> Basic Information
          </h2>

          <Input
            label="Examination Title *"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. UPSC CSE Prelims 2026 — All India Mock Test #1"
          />

          <Textarea
            label="Description / Examination Scope"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of coverage, syllabus topics, and target aspirants..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Examination Category"
              value={examCategory}
              onChange={(e) => setExamCategory(e.target.value as ExamCategory)}
              options={[
                { value: "UPSC", label: "UPSC" },
                { value: "KAS", label: "KAS" },
                { value: "GATE", label: "GATE" },
                { value: "Railway Examinations", label: "Railway Examinations" },
                { value: "KEA Examinations", label: "KEA Examinations" },
                { value: "AE Civil Engineering", label: "AE Civil Engineering" },
                { value: "General Knowledge", label: "General Knowledge" },
                { value: "Custom", label: "Custom" },
              ]}
            />

            <Select
              label="Examination Type"
              value={examType}
              onChange={(e) => setExamType(e.target.value as OnlineExamType)}
              options={[
                { value: "Full-Length Mock Test", label: "Full-Length Mock Test" },
                { value: "Sectional Test", label: "Sectional Test" },
                { value: "Subject Test", label: "Subject Test" },
                { value: "Chapter Test", label: "Chapter Test" },
                { value: "Previous Year Question Test", label: "Previous Year Question Test" },
                { value: "Custom Test", label: "Custom Test" },
              ]}
            />

            <Select
              label="Linked Syllabus Exam"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              options={[
                { value: "", label: "Select official exam" },
                ...exams.map((ex) => ({ value: ex.id, label: ex.name })),
              ]}
            />
          </div>
        </Card>

        {/* Card 2: Timing, Marks & Negative Rules */}
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Clock className="w-4 h-4 text-success" /> Timing, Marks & Evaluation Rules
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Duration (Minutes)"
              type="number"
              required
              min={5}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />

            <Input
              label="Total Questions"
              type="number"
              required
              min={1}
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
            />

            <Input
              label="Total Marks"
              type="number"
              required
              min={1}
              value={totalMarks}
              onChange={(e) => setTotalMarks(Number(e.target.value))}
            />

            <Input
              label="Max Attempts Allowed"
              type="number"
              min={1}
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(Number(e.target.value))}
            />
          </div>

          <div className="p-4 bg-secondary-bg/50 rounded-xl border border-border grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Marks per Correct Answer"
              type="number"
              step="0.1"
              value={correctMarks}
              onChange={(e) => setCorrectMarks(Number(e.target.value))}
            />

            <Input
              label="Negative Marks per Incorrect"
              type="number"
              step="0.01"
              value={negativeMarks}
              onChange={(e) => setNegativeMarks(Number(e.target.value))}
            />

            <Select
              label="Result Release Policy"
              value={resultReleasePolicy}
              onChange={(e) => setResultReleasePolicy(e.target.value as ResultReleasePolicy)}
              options={[
                { value: "Immediate", label: "Immediate (On Submit)" },
                { value: "Delayed", label: "Delayed Release" },
                { value: "Admin Controlled", label: "Admin Controlled Review" },
              ]}
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text-primary">
              <input
                type="checkbox"
                checked={randomizeQuestions}
                onChange={(e) => setRandomizeQuestions(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-border"
              />
              <span>Randomize Question Order per Student Attempt</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text-primary">
              <input
                type="checkbox"
                checked={randomizeOptions}
                onChange={(e) => setRandomizeOptions(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-border"
              />
              <span>Randomize Answer Options (A/B/C/D) Order</span>
            </label>
          </div>
        </Card>

        {/* Card 3: Instructions & Publication */}
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" /> Instructions & Publication
          </h2>

          <Textarea
            label="Examination Instructions (Shown on pre-test screen)"
            rows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ExamTemplateStatus)}
              options={[
                { value: "Published", label: "Published (Active for Students)" },
                { value: "Draft", label: "Draft" },
                { value: "Archived", label: "Archived" },
              ]}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isPending}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isPending ? "Creating Examination..." : "Save & Publish Examination"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
