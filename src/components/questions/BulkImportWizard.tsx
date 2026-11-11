"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  Layers,
  ArrowRight,
  Trash2,
  Check,
  RefreshCw,
  Plus,
  Play,
  Copy,
  ChevronDown,
  ChevronUp,
  Sliders,
  ShieldAlert,
  Clock,
  BookOpen,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  parseUploadedFilesAction,
  convertNonMCQAction,
  saveImportedQuestionsAction,
  createExamFromQuestionsAction,
  type FileProcessingSummary,
} from "@/app/actions/bulk-import";
import type { ExtractedQuestionItem } from "@/lib/ai/bulk-extractor";
import type { Subject, Exam, OptionLabel, DifficultyLevel } from "@/lib/types";

interface BulkImportWizardProps {
  subjects: Subject[];
  exams: Exam[];
}

export default function BulkImportWizard({ subjects, exams }: BulkImportWizardProps) {
  // Step 1: Uploading & Extraction
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileSummaries, setFileSummaries] = useState<FileProcessingSummary[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 2-7: Questions State
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestionItem[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Step 4: AI Conversion
  const [isConverting, setIsConverting] = useState(false);

  // Step 8: Saving
  const [isSaving, setIsSaving] = useState(false);
  const [savedBatchId, setSavedBatchId] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState<number>(0);

  // Step 9: Create Exam Modal
  const [showExamModal, setShowExamModal] = useState(false);
  const [examTitle, setExamTitle] = useState("Custom Mock Test");
  const [examDuration, setExamDuration] = useState(60);
  const [examMarksPerQ, setExamMarksPerQ] = useState(1);
  const [examNegative, setExamNegative] = useState(0.25);
  const [examPracticeMode, setExamPracticeMode] = useState<"Practice" | "Examination">("Examination");
  const [isCreatingExam, setIsCreatingExam] = useState(false);
  const [createdExamId, setCreatedExamId] = useState<string | null>(null);

  // Default mappings
  const [defaultSubjectId, setDefaultSubjectId] = useState<string>(subjects[0]?.id || "");
  const [defaultExamId, setDefaultExamId] = useState<string>(exams[0]?.id || "");

  // File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
      setErrorMessage(null);
    }
  };

  // STEP 1 & 2: Process & Extract
  const handleStartExtraction = async () => {
    if (selectedFiles.length === 0) return;
    setIsExtracting(true);
    setErrorMessage(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    try {
      const res = await parseUploadedFilesAction(formData);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to extract questions.");
      } else {
        setExtractedQuestions(res.questions);
        setFileSummaries(res.fileSummaries);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred during extraction.");
    } finally {
      setIsExtracting(false);
    }
  };

  // STEP 4: Convert non-MCQ Questions with Gemini AI
  const handleConvertNonMCQs = async () => {
    const nonMCQs = extractedQuestions.filter(
      (q) => q.questionType === "NON_MCQ" || q.questionType === "INCOMPLETE_MCQ"
    );
    if (nonMCQs.length === 0) return;

    setIsConverting(true);
    try {
      const res = await convertNonMCQAction(nonMCQs);
      if (res.success && res.convertedQuestions) {
        const convertedMap = new Map(res.convertedQuestions.map((c) => [c.tempId, c]));
        setExtractedQuestions((prev) =>
          prev.map((q) => convertedMap.get(q.tempId) || q)
        );
      } else {
        setErrorMessage(res.error || "Failed to convert questions.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Conversion failed.");
    } finally {
      setIsConverting(false);
    }
  };

  // STEP 6: Correction & Verification Helpers
  const updateQuestionField = (tempId: string, field: keyof ExtractedQuestionItem, value: any) => {
    setExtractedQuestions((prev) =>
      prev.map((q) => (q.tempId === tempId ? { ...q, [field]: value } : q))
    );
  };

  const updateOptionText = (tempId: string, label: "A" | "B" | "C" | "D", text: string) => {
    setExtractedQuestions((prev) =>
      prev.map((q) =>
        q.tempId === tempId
          ? { ...q, options: { ...q.options, [label]: text } }
          : q
      )
    );
  };

  const toggleSelectForImport = (tempId: string) => {
    setExtractedQuestions((prev) =>
      prev.map((q) =>
        q.tempId === tempId
          ? { ...q, isSelectedForImport: !q.isSelectedForImport }
          : q
      )
    );
  };

  const markAnswerVerified = (tempId: string) => {
    setExtractedQuestions((prev) =>
      prev.map((q) =>
        q.tempId === tempId
          ? { ...q, isVerifiedAnswer: true }
          : q
      )
    );
  };

  const removeQuestion = (tempId: string) => {
    setExtractedQuestions((prev) => prev.filter((q) => q.tempId !== tempId));
  };

  // Counts & Categories
  const totalCount = extractedQuestions.length;
  const existingMCQCount = extractedQuestions.filter((q) => q.questionType === "EXISTING_MCQ").length;
  const nonMCQCount = extractedQuestions.filter((q) => q.questionType === "NON_MCQ").length;
  const incompleteCount = extractedQuestions.filter((q) => q.questionType === "INCOMPLETE_MCQ").length;
  const duplicateCount = extractedQuestions.filter((q) => q.isDuplicate).length;
  const unverifiedCount = extractedQuestions.filter((q) => !q.isVerifiedAnswer).length;
  const selectedCount = extractedQuestions.filter((q) => q.isSelectedForImport).length;

  // Filtered list
  const displayQuestions = extractedQuestions.filter((q) => {
    if (activeCategoryFilter === "MCQ") return q.questionType === "EXISTING_MCQ";
    if (activeCategoryFilter === "NON_MCQ") return q.questionType === "NON_MCQ";
    if (activeCategoryFilter === "INCOMPLETE") return q.questionType === "INCOMPLETE_MCQ";
    if (activeCategoryFilter === "UNVERIFIED") return !q.isVerifiedAnswer;
    if (activeCategoryFilter === "DUPLICATES") return q.isDuplicate;
    return true;
  });

  // STEP 8: Save to Question Bank
  const handleSaveToBank = async () => {
    if (selectedCount === 0) return;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await saveImportedQuestionsAction(
        extractedQuestions,
        defaultSubjectId,
        defaultExamId
      );
      if (res.success) {
        setSavedBatchId(res.batchId || "saved");
        setSavedCount(res.savedCount || selectedCount);
      } else {
        setErrorMessage(res.error || "Failed to save questions.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to save questions to database.");
    } finally {
      setIsSaving(false);
    }
  };

  // STEP 9: Create MCQ Examination
  const handleCreateExam = async () => {
    const selectedIds = extractedQuestions
      .filter((q) => q.isSelectedForImport)
      .map((q) => q.tempId);

    if (selectedIds.length === 0) return;
    setIsCreatingExam(true);

    try {
      const res = await createExamFromQuestionsAction({
        title: examTitle,
        category: "Bulk Import Mock",
        subjectId: defaultSubjectId,
        durationMinutes: examDuration,
        totalMarks: selectedIds.length * examMarksPerQ,
        marksPerQuestion: examMarksPerQ,
        negativeMarking: examNegative,
        randomizeOrder: true,
        practiceMode: examPracticeMode,
        questionIds: selectedIds,
      });

      if (res.success && res.examId) {
        setCreatedExamId(res.examId);
      } else {
        setErrorMessage(res.error || "Failed to create examination.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Exam creation error.");
    } finally {
      setIsCreatingExam(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error alert */}
      {errorMessage && (
        <Alert variant="error" className="py-3 rounded-xl text-xs">
          {errorMessage}
        </Alert>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* STAGE 1: UPLOAD MATERIAL */}
      {/* ---------------------------------------------------------------- */}
      {extractedQuestions.length === 0 && (
        <Card className="p-6 sm:p-8 border-dashed border-2 border-primary/30 bg-card">
          <div className="max-w-xl mx-auto text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-subtle)] text-primary">
              <Upload className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h2 className="font-heading text-lg font-bold text-text-primary">
                Upload Question Paper or Material
              </h2>
              <p className="text-xs text-text-secondary">
                Upload past question papers, scans, or question sets. The pipeline extracts questions, detects options, and identifies answer keys.
              </p>
            </div>

            {/* Supported Formats Grid */}
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {["PDF", "DOCX (Word)", "XLSX (Excel)", "CSV", "TXT", "JPG / PNG Scans"].map((fmt) => (
                <span
                  key={fmt}
                  className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-surface border border-border text-text-secondary"
                >
                  {fmt}
                </span>
              ))}
            </div>

            {/* File Input */}
            <div className="pt-3">
              <input
                id="file-upload-input"
                type="file"
                multiple
                accept=".pdf,.docx,.xlsx,.csv,.txt,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload-input"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-hover-surface font-semibold text-xs text-text-primary cursor-pointer transition shadow-xs"
              >
                <FileText className="h-4 w-4 text-primary" />
                <span>
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} file(s) selected`
                    : "Select Question Paper Files"}
                </span>
              </label>
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2 text-left pt-2 border-t border-border">
                <span className="text-[11px] font-mono font-bold text-text-secondary uppercase">
                  Selected Files:
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {selectedFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border text-xs"
                    >
                      <span className="font-medium text-text-primary truncate max-w-xs">
                        {f.name}
                      </span>
                      <span className="font-mono text-text-muted text-[11px]">
                        {(f.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-center">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleStartExtraction}
                    isLoading={isExtracting}
                    className="w-full sm:w-auto"
                    rightIcon={<Sparkles className="h-4 w-4" />}
                  >
                    Extract Questions &amp; Answer Keys
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* STAGE 2: EXTRACTION REVIEW & WORKFLOW */}
      {/* ---------------------------------------------------------------- */}
      {extractedQuestions.length > 0 && (
        <div className="space-y-6">
          {/* Top Summary Banner */}
          <Card className="p-5 bg-card">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-[var(--color-primary-subtle)] border border-primary/20">
                    EXTRACTION COMPLETE
                  </span>
                  <span className="text-xs text-text-muted">
                    {extractedQuestions.length} total questions identified
                  </span>
                </div>
                <h3 className="font-heading text-base font-bold text-text-primary">
                  Review &amp; Verify Extracted Question Bank
                </h3>
                <p className="text-xs text-text-secondary">
                  Review questions, verify answer keys, convert non-MCQs, and save directly to your question bank.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {nonMCQCount > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleConvertNonMCQs}
                    isLoading={isConverting}
                    leftIcon={<Sparkles className="h-4 w-4 text-primary" />}
                    title="Generate 4-option MCQs from non-MCQs using Gemini"
                  >
                    Convert {nonMCQCount} Non-MCQs with AI
                  </Button>
                )}

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveToBank}
                  isLoading={isSaving}
                  disabled={savedBatchId !== null}
                  leftIcon={<Check className="h-4 w-4" />}
                >
                  {savedBatchId ? "Saved to Question Bank" : `Save ${selectedCount} Questions`}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExamModal(true)}
                  leftIcon={<Play className="h-4 w-4 text-accent" />}
                >
                  Create Mock Test
                </Button>
              </div>
            </div>

            {/* Category Filter Pills (Step 3: Question Types) */}
            <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setActiveCategoryFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeCategoryFilter === "ALL"
                    ? "bg-primary text-white"
                    : "bg-surface border border-border text-text-secondary hover:text-text-primary"
                }`}
              >
                All ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveCategoryFilter("MCQ")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeCategoryFilter === "MCQ"
                    ? "bg-primary text-white"
                    : "bg-surface border border-border text-text-secondary hover:text-text-primary"
                }`}
              >
                Existing 4-Option MCQs ({existingMCQCount})
              </button>
              {nonMCQCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter("NON_MCQ")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                    activeCategoryFilter === "NON_MCQ"
                      ? "bg-primary text-white"
                      : "bg-surface border border-border text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Non-MCQ Items ({nonMCQCount})
                </button>
              )}
              {unverifiedCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter("UNVERIFIED")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                    activeCategoryFilter === "UNVERIFIED"
                      ? "bg-primary text-white"
                      : "bg-surface border border-border text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Unverified Keys ({unverifiedCount})
                </button>
              )}
              {duplicateCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter("DUPLICATES")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                    activeCategoryFilter === "DUPLICATES"
                      ? "bg-primary text-white"
                      : "bg-surface border border-border text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Duplicates Detected ({duplicateCount})
                </button>
              )}
            </div>
          </Card>

          {/* Success Banner if Saved */}
          {savedBatchId && (
            <Card className="p-4 bg-success/10 border-success/30 text-success flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <div>
                  <h4 className="font-bold text-xs">Successfully Saved to Question Bank</h4>
                  <p className="text-[11px] text-text-secondary">
                    {savedCount} questions have been added to your personal repository.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/question-bank">
                  <Button variant="outline" size="sm" className="text-xs border-success/40">
                    View in Question Bank →
                  </Button>
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowExamModal(true)}
                  leftIcon={<Play className="h-3.5 w-3.5" />}
                >
                  Attempt as Test
                </Button>
              </div>
            </Card>
          )}

          {/* Questions Review List */}
          <div className="space-y-4">
            {displayQuestions.map((q, idx) => {
              const isExpanded = expandedId === q.tempId;

              return (
                <Card
                  key={q.tempId}
                  className={`p-4 transition-all ${
                    !q.isSelectedForImport ? "opacity-60 bg-surface/50" : "bg-card"
                  } ${q.isDuplicate ? "border-warning/50" : "border-border"}`}
                >
                  {/* Item Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={q.isSelectedForImport}
                        onChange={() => toggleSelectForImport(q.tempId)}
                        className="mt-1 h-4 w-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
                        title="Include in import"
                      />

                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-text-muted">
                            #{q.questionNumber || idx + 1}
                          </span>

                          <Badge
                            variant={
                              q.questionType === "EXISTING_MCQ"
                                ? "primary"
                                : q.questionType === "NON_MCQ"
                                ? "warning"
                                : "outline"
                            }
                            size="sm"
                          >
                            {q.questionType === "EXISTING_MCQ"
                              ? q.isConvertedFromNonMCQ
                                ? "Converted MCQ"
                                : "4-Option MCQ"
                              : q.questionType}
                          </Badge>

                          {/* Critical Answer Verification Badge */}
                          <Badge
                            variant={q.isVerifiedAnswer ? "success" : "warning"}
                            size="sm"
                          >
                            {q.isVerifiedAnswer
                              ? "Source Key Verified"
                              : "AI Suggested / Unverified"}
                          </Badge>

                          {q.isDuplicate && (
                            <Badge variant="error" size="sm">
                              Duplicate Stem
                            </Badge>
                          )}

                          <span className="text-[11px] font-mono text-text-muted truncate">
                            {q.sourceFileName}
                          </span>
                        </div>

                        {/* Editable Question Text */}
                        <p className="text-xs font-semibold text-text-primary leading-relaxed pt-1">
                          {q.questionText}
                        </p>
                      </div>
                    </div>

                    {/* Expand / Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : q.tempId)}
                        className="p-1.5 text-text-muted hover:text-text-primary rounded-lg transition"
                        title={isExpanded ? "Collapse" : "Edit & Details"}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeQuestion(q.tempId)}
                        className="p-1.5 text-text-muted hover:text-error rounded-lg transition"
                        title="Discard question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Options Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 pl-7">
                    {(["A", "B", "C", "D"] as const).map((opt) => {
                      const isCorrect = q.correctOption === opt;
                      return (
                        <div
                          key={opt}
                          className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                            isCorrect
                              ? "bg-success/10 border-success/40 text-text-primary font-semibold"
                              : "bg-surface border-border text-text-secondary"
                          }`}
                        >
                          <span className="truncate">
                            <strong className="mr-1.5 font-mono">{opt}.</strong>
                            {q.options[opt] || <span className="italic text-text-muted">Empty</span>}
                          </span>
                          {isCorrect && (
                            <span className="text-[10px] font-mono font-bold text-success px-1.5 py-0.2 rounded bg-success/20">
                              KEY
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Expanded Editor Form (Step 6: Preview & Correction) */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4 pl-7 text-xs bg-surface/40 p-3 rounded-xl">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-text-secondary font-mono">
                          Edit Question Stem
                        </label>
                        <textarea
                          rows={2}
                          value={q.questionText}
                          onChange={(e) => updateQuestionField(q.tempId, "questionText", e.target.value)}
                          className="w-full rounded-xl border border-border p-2 bg-input text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                        />
                      </div>

                      {/* Options input */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(["A", "B", "C", "D"] as const).map((opt) => (
                          <div key={opt} className="space-y-1">
                            <label className="block text-[11px] font-bold text-text-secondary font-mono">
                              Option {opt}
                            </label>
                            <input
                              type="text"
                              value={q.options[opt]}
                              onChange={(e) => updateOptionText(q.tempId, opt, e.target.value)}
                              className="w-full rounded-xl border border-border px-3 py-1.5 bg-input text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Correct Option Selector & Verification */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-bold text-text-secondary font-mono">
                            Correct Answer Key:
                          </label>
                          <select
                            value={q.correctOption}
                            onChange={(e) => updateQuestionField(q.tempId, "correctOption", e.target.value as OptionLabel)}
                            className="rounded-lg border border-border bg-input px-2.5 py-1 text-xs font-bold text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary/25"
                          >
                            <option value="A">Option A</option>
                            <option value="B">Option B</option>
                            <option value="C">Option C</option>
                            <option value="D">Option D</option>
                          </select>

                          {!q.isVerifiedAnswer && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAnswerVerified(q.tempId)}
                              leftIcon={<Check className="h-3 w-3 text-success" />}
                              className="text-xs"
                            >
                              Confirm Answer Key
                            </Button>
                          )}
                        </div>

                        {/* Subject mapping */}
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-bold text-text-secondary font-mono">
                            Subject:
                          </label>
                          <select
                            value={q.subjectId || defaultSubjectId}
                            onChange={(e) => updateQuestionField(q.tempId, "subjectId", e.target.value)}
                            className="rounded-lg border border-border bg-input px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                          >
                            {subjects.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-text-secondary font-mono">
                          Explanation / Solution Rationale
                        </label>
                        <textarea
                          rows={2}
                          value={q.explanation}
                          onChange={(e) => updateQuestionField(q.tempId, "explanation", e.target.value)}
                          placeholder="Provide the rationale or textbook reference..."
                          className="w-full rounded-xl border border-border p-2 bg-input text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                        />
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* STEP 9: CREATE MCQ EXAMINATION MODAL */}
      {/* ---------------------------------------------------------------- */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <Card className="w-full max-w-lg bg-card border-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                <h3 className="font-heading text-base font-bold text-text-primary">
                  Create Examination from Imported Questions
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExamModal(false)}
                className="text-text-muted hover:text-text-primary text-xs"
              >
                ✕
              </button>
            </div>

            {createdExamId ? (
              <div className="text-center py-6 space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-success/20 text-success">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="font-heading text-sm font-bold text-text-primary">
                  Examination Created Successfully!
                </h4>
                <p className="text-xs text-text-secondary">
                  Your custom MCQ test is ready for immediate timed simulation.
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <Link href={`/online-exams/${createdExamId}/instructions`}>
                    <Button variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      Start Test Now
                    </Button>
                  </Link>
                  <Button variant="outline" size="md" onClick={() => setShowExamModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-text-secondary font-mono">
                    Examination Title
                  </label>
                  <input
                    type="text"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    className="w-full rounded-xl border border-border px-3 py-2 bg-input text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-text-secondary font-mono">
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={300}
                      value={examDuration}
                      onChange={(e) => setExamDuration(Number(e.target.value))}
                      className="w-full rounded-xl border border-border px-3 py-2 bg-input text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-text-secondary font-mono">
                      Negative Marking
                    </label>
                    <select
                      value={examNegative}
                      onChange={(e) => setExamNegative(Number(e.target.value))}
                      className="w-full rounded-xl border border-border px-3 py-2 bg-input text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                    >
                      <option value={0}>No Negative Marking (0.0)</option>
                      <option value={0.25}>1/4 Mark (-0.25)</option>
                      <option value={0.33}>1/3 Mark (-0.33)</option>
                      <option value={0.5}>1/2 Mark (-0.50)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-border space-y-1 text-xs">
                  <span className="font-semibold text-text-primary">Questions Selected:</span>{" "}
                  <strong className="text-primary font-mono">{selectedCount} Questions</strong>
                  <p className="text-[11px] text-text-muted">
                    Total Marks: {selectedCount * examMarksPerQ} | Random Question Shuffling: Enabled
                  </p>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowExamModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCreateExam}
                    isLoading={isCreatingExam}
                    rightIcon={<Play className="h-4 w-4" />}
                  >
                    Confirm &amp; Create Test
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
