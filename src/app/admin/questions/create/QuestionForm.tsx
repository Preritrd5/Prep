"use client";

import { Card, Badge, Button, Alert, Input, Textarea, Select } from "@/components/ui";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  CheckCircle2,
  BookOpen,
  Layers,
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
        <Link href="/admin/questions">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-text-muted hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" /> Back to Question Bank
          </Button>
        </Link>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="gap-1.5 text-xs"
        >
          <Eye className="w-3.5 h-3.5" />
          {showPreview ? "Hide Student Preview" : "Show Student Preview"}
        </Button>
      </div>

      {errorMsg && (
        <Alert variant="error" title={errorMsg} onClose={() => setErrorMsg(null)} />
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Authoring Form */}
        <div className={showPreview ? "lg:col-span-7 space-y-6" : "lg:col-span-12 space-y-6"}>
          {/* Card 1: Question Stem */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Question Content
            </h2>

            <Textarea
              label="Question Statement / Stem *"
              required
              rows={4}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Type the full multiple choice question text here..."
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                options={[
                  { value: "", label: "Select Subject" },
                  ...subjects.map((s) => ({ value: s.id, label: s.name })),
                ]}
              />

              <Select
                label="Difficulty Level"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                options={[
                  { value: "Easy", label: "Easy" },
                  { value: "Medium", label: "Medium" },
                  { value: "Hard", label: "Hard" },
                ]}
              />

              <Select
                label="Source Type"
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as QuestionSource)}
                options={[
                  { value: "Manual", label: "Manual" },
                  { value: "Previous Year Question", label: "Previous Year Question" },
                  { value: "AI Generated", label: "AI Generated" },
                  { value: "CSV Import", label: "CSV Import" },
                  { value: "Excel Import", label: "Excel Import" },
                ]}
              />
            </div>

            {sourceType === "Previous Year Question" && (
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="PYQ Exam Name"
                  type="text"
                  value={pyqExamName}
                  onChange={(e) => setPyqExamName(e.target.value)}
                  placeholder="e.g. UPSC Civil Services Prelims"
                />
                <Input
                  label="PYQ Year"
                  type="number"
                  value={pyqYear}
                  onChange={(e) => setPyqYear(e.target.value)}
                  placeholder="2022"
                />
              </div>
            )}

            <Input
              label="Source Reference / Textbook Citation"
              type="text"
              value={sourceReference}
              onChange={(e) => setSourceReference(e.target.value)}
              placeholder="e.g. NCERT Class 11 History Ch. 4 / Section 21 of Indian Contract Act"
            />
          </Card>

          {/* Card 2: Four Options & Answer Key */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" /> Options & Answer Key
              </h2>
              <span className="text-xs text-text-muted">
                Mark the radio next to the correct answer
              </span>
            </div>

            {[
              { label: "A", val: optionA, setter: setOptionA },
              { label: "B", val: optionB, setter: setOptionB },
              { label: "C", val: optionC, setter: setOptionC },
              { label: "D", val: optionD, setter: setOptionD },
            ].map((opt) => (
              <div key={opt.label} className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="correct_option"
                    value={opt.label}
                    checked={correctOption === opt.label}
                    onChange={() => setCorrectOption(opt.label as OptionLabel)}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="w-7 h-7 rounded-lg bg-secondary-bg flex items-center justify-center font-bold text-xs text-text-primary border border-border">
                    {opt.label}
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={opt.val}
                  onChange={(e) => opt.setter(e.target.value)}
                  placeholder={`Option ${opt.label} text...`}
                  className="flex-1 px-3 py-2 border border-border rounded-xl text-sm bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))}

            {/* Pedagogical Explanation */}
            <div className="pt-2">
              <Textarea
                label="Pedagogical Explanation & Rationale *"
                rows={3}
                required
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain why the marked option is correct and dispel common distractors..."
              />
            </div>
          </Card>

          {/* Card 3: Multi-Exam Mapping & Publication Status */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" /> Applicable Examination Mappings
            </h2>
            <p className="text-xs text-text-muted">
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
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                      isChecked
                        ? "bg-primary/10 border-primary text-text-primary"
                        : "bg-secondary-bg border-border text-text-secondary hover:bg-secondary-bg/80"
                    }`}
                  >
                    <span className="truncate">{exam.name}</span>
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary uppercase mb-1">
                  Publication Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as QuestionStatus)}
                  className="border border-border rounded-xl px-3 py-1.5 text-sm bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Published">Published (Active in Practice)</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending Review">Pending Review</option>
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isPending}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isPending ? "Saving Question..." : "Save Question"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Live Student Practice Preview */}
        {showPreview && (
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-6">
              <Card className="bg-secondary-bg border-border p-5 space-y-4 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Student Practice View
                  </span>
                  <Badge variant="secondary">
                    {difficulty}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-text-primary">
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
                        className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                          correctOption === opt.label
                            ? "bg-success-light border-success text-success font-medium"
                            : "bg-card border-border text-text-secondary"
                        }`}
                      >
                        <span className="w-6 h-6 rounded-lg bg-secondary-bg border border-border flex items-center justify-center font-bold text-xs text-text-primary">
                          {opt.label}
                        </span>
                        <span className="flex-1">{opt.text || `Option ${opt.label} text`}</span>
                        {correctOption === opt.label && (
                          <Badge variant="success" className="text-[10px]">
                            Key
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>

                  {explanation && (
                    <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-text-primary space-y-1">
                      <span className="font-semibold block text-primary uppercase text-[10px] tracking-wide">
                        Pedagogical Explanation:
                      </span>
                      <p>{explanation}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
