"use client";

import { Card, Badge, Button, Alert, Input, Textarea, Select, Spinner } from "@/components/ui";
import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Clock,
} from "lucide-react";
import type { Exam, Subject, AIQuestionGenerationJob } from "@/lib/types";
import { generateAIQuestionsAction } from "@/app/actions/questions";

interface AIGeneratorClientProps {
  exams: Exam[];
  subjects: Subject[];
  recentJobs: AIQuestionGenerationJob[];
}

export default function AIGeneratorClient({
  exams,
  subjects,
  recentJobs,
}: AIGeneratorClientProps) {
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [topicName, setTopicName] = useState("");
  const [count, setCount] = useState("5");
  const [difficulty, setDifficulty] = useState("Medium");
  const [language, setLanguage] = useState("English");
  const [instructions, setInstructions] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [useMock, setUseMock] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success?: boolean;
    count?: number;
    totalRequested?: number;
    error?: string;
  } | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    const formData = new FormData();
    const chosenSubject = subjects.find((s) => s.id === selectedSubjectId);
    const chosenExam = exams.find((e) => e.id === selectedExamId);

    if (selectedExamId) formData.append("exam_id", selectedExamId);
    if (chosenExam) formData.append("exam_name", chosenExam.name);
    if (selectedSubjectId) formData.append("subject_id", selectedSubjectId);
    formData.append("subject_name", chosenSubject?.name || "General Knowledge");
    if (topicName) formData.append("topic_name", topicName);

    formData.append("count", count);
    formData.append("difficulty", difficulty);
    formData.append("language", language);
    if (instructions) formData.append("instructions", instructions);
    if (sourceText) formData.append("source_text", sourceText);
    formData.append("use_mock", useMock ? "true" : "false");

    startTransition(async () => {
      const res = await generateAIQuestionsAction(formData);
      setResult(res);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <Link href="/admin/questions">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-text-muted hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" /> Back to Question Bank
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Generator Controls (Left Column) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-accent/10 text-accent">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Gemini 2.5 Flash MCQ Generator</h2>
                  <p className="text-xs text-text-muted">
                    Generates syllabus-aligned multiple-choice questions with 4 options and verified rationales.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Exam & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Target Examination (Optional)"
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  options={[
                    { value: "", label: "Any / General Competitive" },
                    ...exams.map((exam) => ({ value: exam.id, label: exam.name })),
                  ]}
                />

                <Select
                  label="Subject *"
                  required
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  options={[
                    { value: "", label: "Select Target Subject" },
                    ...subjects.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                />
              </div>

              {/* Specific Topic / Subtopic */}
              <Input
                label="Specific Topic / Focus Area (Optional)"
                type="text"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="e.g. Fundamental Rights, Shear Force Diagrams, Vijayanagara Empire"
              />

              {/* Count & Difficulty & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="Number of Questions"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  options={[
                    { value: "5", label: "5 Questions" },
                    { value: "10", label: "10 Questions" },
                    { value: "20", label: "20 Questions" },
                    { value: "30", label: "30 Questions" },
                    { value: "50", label: "50 Questions" },
                  ]}
                />

                <Select
                  label="Difficulty Level"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  options={[
                    { value: "Easy", label: "Easy" },
                    { value: "Medium", label: "Medium" },
                    { value: "Hard", label: "Hard" },
                    { value: "Mixed", label: "Mixed (Adaptive)" },
                  ]}
                />

                <Select
                  label="Language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  options={[
                    { value: "English", label: "English" },
                    { value: "Kannada", label: "Kannada (ಕನ್ನಡ)" },
                  ]}
                />
              </div>

              {/* Custom Prompt Instructions */}
              <Textarea
                label="Custom Generation Prompt / Instructions (Optional)"
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Focus on case law precedents, include numerical questions on deflection, etc."
              />

              {/* Source Text Context */}
              <Textarea
                label="Source Reference / Syllabus Text Snippet (Optional)"
                rows={3}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste text notes, official notification excerpts, or syllabus points to ground question generation..."
              />

              {/* Test Mode Mock Toggle */}
              <div className="p-3 bg-secondary-bg rounded-xl border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-text-primary block">
                    Fast Test Mode (Mock Engine)
                  </span>
                  <span className="text-[11px] text-text-muted">
                    Generates valid sample questions instantly without consuming Gemini API tokens.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useMock}
                    onChange={(e) => setUseMock(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-bg border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!selectedSubjectId || isPending}
                  className="w-full gap-2 text-xs"
                >
                  {isPending ? (
                    <>
                      <Spinner size="sm" color="white" label="Generating questions..." />
                      Generating {count} MCQs with Gemini 2.5 Flash...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate {count} MCQs & Stage for Review
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Results Feedback */}
            {result && (
              <div className="mt-4 pt-4 border-t border-border">
                {result.error ? (
                  <Alert variant="error" title={result.error} />
                ) : (
                  <div className="space-y-3">
                    <Alert
                      variant="success"
                      title={`Successfully generated ${result.count} questions! All items are staged under Pending Review.`}
                    />

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-text-muted">
                        Admin approval is required before questions appear in student practice.
                      </span>
                      <Link
                        href="/admin/questions/review"
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Open Review Queue ({result.count} items) →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Specifications & Recent Jobs (Right Column) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" /> Module 5 Safety Workflow
            </h3>
            <ul className="text-xs text-text-secondary space-y-2 pl-4 list-disc">
              <li>
                <strong>Draft Only:</strong> AI generated questions never publish directly to student practice sessions.
              </li>
              <li>
                <strong>Strict 4 Options:</strong> Every generated question conforms to four distinct options (A, B, C, D).
              </li>
              <li>
                <strong>Protected Answers:</strong> Answer keys and pedagogical rationales are saved to the isolated <code className="text-primary font-mono">question_answer_keys</code> table.
              </li>
              <li>
                <strong>Admin Approval:</strong> Admins can inspect questions, tweak distractors, and publish selectively from the Review Queue.
              </li>
            </ul>
          </Card>

          {/* Recent AI Generation Jobs */}
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-muted" /> Recent AI Generation Jobs
            </h3>

            {recentJobs.length === 0 ? (
              <p className="text-xs text-text-muted">No AI generation jobs recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3 rounded-xl border border-border bg-secondary-bg/50 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text-primary truncate max-w-[200px]">
                        {job.prompt || "MCQ Batch"}
                      </span>
                      <Badge
                        variant={
                          job.status === "Completed"
                            ? "success"
                            : job.status === "Failed"
                            ? "error"
                            : "warning"
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-text-muted text-[11px]">
                      <span>{job.generated_count} / {job.requested_count} generated ({job.difficulty})</span>
                      <span>{new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
