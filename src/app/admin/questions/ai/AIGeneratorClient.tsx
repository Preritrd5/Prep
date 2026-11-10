"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  Check,
  X,
  FileText,
  Loader2,
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
        <Link
          href="/admin/questions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Question Bank
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Generator Controls (Left Column) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-violet-100 text-violet-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Gemini 2.5 Flash MCQ Generator</h2>
                  <p className="text-xs text-slate-500">
                    Generates syllabus-aligned multiple-choice questions with 4 options and verified rationales.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Exam & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Target Examination (Optional)
                  </label>
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Any / General Competitive</option>
                    {exams.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Subject *
                  </label>
                  <select
                    required
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Select Target Subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Specific Topic / Subtopic */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Specific Topic / Focus Area (Optional)
                </label>
                <input
                  type="text"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  placeholder="e.g. Fundamental Rights, Shear Force Diagrams, Vijayanagara Empire"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Count & Difficulty & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Number of Questions
                  </label>
                  <select
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="5">5 Questions</option>
                    <option value="10">10 Questions</option>
                    <option value="20">20 Questions</option>
                    <option value="30">30 Questions</option>
                    <option value="50">50 Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Mixed">Mixed (Adaptive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="English">English</option>
                    <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                  </select>
                </div>
              </div>

              {/* Custom Prompt Instructions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Custom Generation Prompt / Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Focus on case law precedents, include numerical questions on deflection, etc."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Source Text Context */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Source Reference / Syllabus Text Snippet (Optional)
                </label>
                <textarea
                  rows={3}
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Paste text notes, official notification excerpts, or syllabus points to ground question generation..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Test Mode Mock Toggle */}
              <div className="p-3 bg-violet-50 rounded-lg border border-violet-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-violet-900 block">
                    Fast Test Mode (Mock Engine)
                  </span>
                  <span className="text-[11px] text-violet-700">
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
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!selectedSubjectId || isPending}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 shadow-sm transition disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating {count} MCQs with Gemini 2.5 Flash...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate {count} MCQs & Stage for Review
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Results Feedback */}
            {result && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                {result.error ? (
                  <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{result.error}</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>
                        Successfully generated <strong>{result.count}</strong> questions! All items are staged under <strong>Pending Review</strong>.
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500">
                        Admin approval is required before questions appear in student practice.
                      </span>
                      <Link
                        href="/admin/questions/review"
                        className="text-xs font-bold text-violet-700 hover:underline"
                      >
                        Open Review Queue ({result.count} items) →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Specifications & Recent Jobs (Right Column) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" /> Module 5 Safety Workflow
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 pl-4 list-disc">
              <li>
                <strong>Draft Only:</strong> AI generated questions never publish directly to student practice sessions.
              </li>
              <li>
                <strong>Strict 4 Options:</strong> Every generated question conforms to four distinct options (A, B, C, D).
              </li>
              <li>
                <strong>Protected Answers:</strong> Answer keys and pedagogical rationales are saved to the isolated <code className="text-indigo-600 font-mono">question_answer_keys</code> table.
              </li>
              <li>
                <strong>Admin Approval:</strong> Admins can inspect questions, tweak distractors, and publish selectively from the Review Queue.
              </li>
            </ul>
          </div>

          {/* Recent AI Generation Jobs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" /> Recent AI Generation Jobs
            </h3>

            {recentJobs.length === 0 ? (
              <p className="text-xs text-slate-400">No AI generation jobs recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                        {job.prompt || "MCQ Batch"}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          job.status === "Completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : job.status === "Failed"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>{job.generated_count} / {job.requested_count} generated ({job.difficulty})</span>
                      <span>{new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
