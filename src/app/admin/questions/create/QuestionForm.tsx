"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  BookOpen,
  Calendar,
} from "lucide-react";
import type { Exam, Subject, DifficultyLevel, QuestionSource, QuestionStatus, OptionLabel } from "@/lib/types";
import { adminCreateQuestionAction } from "@/app/actions/questions";

interface QuestionFormProps {
  exams: Exam[];
  subjects: Subject[];
}

export default function QuestionForm({ exams, subjects }: QuestionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [questionText, setQuestionText] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Medium");
  const [sourceType, setSourceType] = useState<QuestionSource>("Manual");
  const [pyqExamName, setPyqExamName] = useState("");
  const [pyqYear, setPyqYear] = useState<string>("");
  const [sourceReference, setSourceReference] = useState("");
  const [status, setStatus] = useState<QuestionStatus>("Published");

  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState<OptionLabel>("A");
  const [explanation, setExplanation] = useState("");

  const [selectedExamIds, setSelectedExamIds] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(true);

  const toggleExam = (examId: string) => {
    if (selectedExamIds.includes(examId)) {
      setSelectedExamIds(selectedExamIds.filter((id) => id !== examId));
    } else {
      setSelectedExamIds([...selectedExamIds, examId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("question_text", questionText);
    formData.append("subject_id", subjectId);
    formData.append("difficulty", difficulty);
    formData.append("source_type", sourceType);
    if (pyqExamName) formData.append("pyq_exam_name", pyqExamName);
    if (pyqYear) formData.append("pyq_year", pyqYear);
    if (sourceReference) formData.append("source_reference", sourceReference);
    formData.append("status", status);

    formData.append("option_a", optionA);
    formData.append("option_b", optionB);
    formData.append("option_c", optionC);
    formData.append("option_d", optionD);
    formData.append("correct_option", correctOption);
    formData.append("explanation", explanation);
    formData.append("applicable_exams", JSON.stringify(selectedExamIds));

    startTransition(async () => {
      const res = await adminCreateQuestionAction(formData);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        router.push("/admin/questions");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/questions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Question Bank
        </Link>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          {showPreview ? "Hide Student Preview" : "Show Student Preview"}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Authoring Form */}
        <div className={showPreview ? "lg:col-span-7 space-y-6" : "lg:col-span-12 space-y-6"}>
          {/* Card 1: Question Stem */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" /> Question Content
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Question Statement / Stem *
              </label>
              <textarea
                required
                rows={4}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Type the full multiple choice question text here..."
                className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Subject
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Source Type
                </label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as QuestionSource)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Manual">Manual</option>
                  <option value="Previous Year Question">Previous Year Question</option>
                  <option value="AI Generated">AI Generated</option>
                  <option value="CSV Import">CSV Import</option>
                  <option value="Excel Import">Excel Import</option>
                </select>
              </div>
            </div>

            {sourceType === "Previous Year Question" && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-purple-900 mb-1">
                    PYQ Exam Name (e.g. UPSC CSE, KAS, GATE CE)
                  </label>
                  <input
                    type="text"
                    value={pyqExamName}
                    onChange={(e) => setPyqExamName(e.target.value)}
                    placeholder="e.g. UPSC Civil Services Prelims"
                    className="w-full px-3 py-1.5 border border-purple-200 rounded-md text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-purple-900 mb-1">
                    PYQ Year (e.g. 2022)
                  </label>
                  <input
                    type="number"
                    value={pyqYear}
                    onChange={(e) => setPyqYear(e.target.value)}
                    placeholder="2022"
                    className="w-full px-3 py-1.5 border border-purple-200 rounded-md text-sm bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Source Reference / Textbook Citation
              </label>
              <input
                type="text"
                value={sourceReference}
                onChange={(e) => setSourceReference(e.target.value)}
                placeholder="e.g. NCERT Class 11 History Ch. 4 / Section 21 of Indian Contract Act"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Card 2: Four Options & Answer Key */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Options & Answer Key
              </span>
              <span className="text-xs font-normal text-slate-500">
                Mark the radio next to the correct answer
              </span>
            </h2>

            {/* Option A */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="correct_option"
                  value="A"
                  checked={correctOption === "A"}
                  onChange={() => setCorrectOption("A")}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-800 border">
                  A
                </span>
              </label>
              <input
                type="text"
                required
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                placeholder="Option A text..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Option B */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="correct_option"
                  value="B"
                  checked={correctOption === "B"}
                  onChange={() => setCorrectOption("B")}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-800 border">
                  B
                </span>
              </label>
              <input
                type="text"
                required
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                placeholder="Option B text..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Option C */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="correct_option"
                  value="C"
                  checked={correctOption === "C"}
                  onChange={() => setCorrectOption("C")}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-800 border">
                  C
                </span>
              </label>
              <input
                type="text"
                required
                value={optionC}
                onChange={(e) => setOptionC(e.target.value)}
                placeholder="Option C text..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Option D */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="correct_option"
                  value="D"
                  checked={correctOption === "D"}
                  onChange={() => setCorrectOption("D")}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-800 border">
                  D
                </span>
              </label>
              <input
                type="text"
                required
                value={optionD}
                onChange={(e) => setOptionD(e.target.value)}
                placeholder="Option D text..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Pedagogical Explanation */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Pedagogical Explanation & Rationale *
              </label>
              <textarea
                rows={3}
                required
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain why the marked option is correct and dispel common distractors..."
                className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Card 3: Multi-Exam Mapping & Publication Status */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Applicable Examination Mappings
            </h2>
            <p className="text-xs text-slate-500">
              Select all competitive examinations where this question is relevant (M-to-N reusable mapping):
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {exams.map((exam) => {
                const isChecked = selectedExamIds.includes(exam.id);
                return (
                  <button
                    type="button"
                    key={exam.id}
                    onClick={() => toggleExam(exam.id)}
                    className={`p-2.5 rounded-lg border text-left text-xs font-medium transition flex items-center justify-between ${
                      isChecked
                        ? "bg-indigo-50 border-indigo-400 text-indigo-900"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="truncate">{exam.name}</span>
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Publication Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as QuestionStatus)}
                  className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white text-slate-700 focus:outline-none"
                >
                  <option value="Published">Published (Active in Practice)</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending Review">Pending Review</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isPending ? "Saving Question..." : "Save Question"}
              </button>
            </div>
          </div>
        </div>

        {/* Live Student Practice Preview */}
        {showPreview && (
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-6">
              <div className="bg-slate-900 text-white rounded-xl shadow-lg p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Student Practice View
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300">
                    {difficulty}
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-100">
                    {questionText || "Question statement preview will appear here..."}
                  </p>

                  <div className="space-y-2">
                    {[
                      { label: "A", text: optionA },
                      { label: "B", text: optionB },
                      { label: "C", text: optionC },
                      { label: "D", text: optionD },
                    ].map((opt) => (
                      <div
                        key={opt.label}
                        className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 transition ${
                          correctOption === opt.label
                            ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-200"
                            : "bg-slate-800/60 border-slate-700/60 text-slate-300"
                        }`}
                      >
                        <span className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs">
                          {opt.label}
                        </span>
                        <span className="flex-1">{opt.text || `Option ${opt.label} text`}</span>
                        {correctOption === opt.label && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-300">
                            Key
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {explanation && (
                    <div className="mt-4 p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 space-y-1">
                      <span className="font-semibold block text-indigo-300 uppercase text-[10px] tracking-wide">
                        Pedagogical Explanation:
                      </span>
                      <p>{explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
