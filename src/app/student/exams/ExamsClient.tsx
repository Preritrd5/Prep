"use client";

import { Card, Badge, Button, Modal, Input, Select, Textarea, Alert, EmptyState } from "@/components/ui";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Tag,
  Star,
} from "lucide-react";
import { enrollStudentExamAction, removeStudentExamAction } from "@/app/actions/exams";
import type { Exam, StudentExam } from "@/lib/types";

interface ExamsClientProps {
  allExams: Exam[];
  enrolledExams: StudentExam[];
}

export default function ExamsClient({ allExams, enrolledExams }: ExamsClientProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedExamToEnroll, setSelectedExamToEnroll] = useState<Exam | null>(null);
  const [targetDate, setTargetDate] = useState<string>("");
  const [priority, setPriority] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const categories = ["All", ...Array.from(new Set(allExams.map((e) => e.category)))];

  const enrolledExamIds = new Set(enrolledExams.map((se) => se.exam_id));

  const filteredExams = allExams.filter((e) => {
    if (selectedCategory === "All") return true;
    return e.category === selectedCategory;
  });

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamToEnroll) return;

    setIsPending(true);
    setErrorMsg(null);
    setPageError(null);

    const formData = new FormData();
    formData.append("examId", selectedExamToEnroll.id);
    formData.append("targetDate", targetDate);
    formData.append("priority", priority.toString());
    formData.append("notes", notes);

    const res = await enrollStudentExamAction(formData);
    setIsPending(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setSelectedExamToEnroll(null);
      setTargetDate("");
      setNotes("");
      setErrorMsg(null);
      router.refresh();
    }
  };

  const handleRemove = async (examId: string) => {
    if (!confirm("Remove this examination from your active preparation list?")) return;
    setIsPending(true);
    setPageError(null);
    const formData = new FormData();
    formData.append("examId", examId);
    const res = await removeStudentExamAction(formData);
    setIsPending(false);

    if (res?.error) {
      setPageError(res.error);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
      {pageError && (
        <Alert variant="error" onClose={() => setPageError(null)} title="Action Failed">
          {pageError}
        </Alert>
      )}

      {/* Enrolled Examinations Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">
            My Selected Examinations ({enrolledExams.length})
          </h2>
          <p className="text-xs text-text-muted">
            Your active preparation targets. Set target dates and priorities to drive your study schedules.
          </p>
        </div>

        {enrolledExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledExams.map((se) => {
              const exam = se.exam || allExams.find((e) => e.id === se.exam_id);
              if (!exam) return null;

              return (
                <Card
                  key={se.id}
                  className="p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="primary">
                        {exam.category}
                      </Badge>
                      <Badge
                        variant={
                          se.priority === 1
                            ? "error"
                            : se.priority === 2
                            ? "warning"
                            : "secondary"
                        }
                      >
                        <Star className="h-2.5 w-2.5 mr-1" />
                        Priority {se.priority}
                      </Badge>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-text-primary leading-snug">
                      {exam.name}
                    </h3>
                    {exam.sub_category && (
                      <p className="text-xs text-text-muted mt-0.5">{exam.sub_category}</p>
                    )}

                    <div className="mt-4 space-y-1.5 text-xs text-text-secondary border-t border-border pt-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-text-muted" />
                        <span>
                          Target:{" "}
                          <strong className="text-text-primary">
                            {se.target_date
                              ? new Date(se.target_date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Not Set"}
                          </strong>
                        </span>
                      </div>
                      {se.notes && (
                        <p className="text-[11px] text-text-muted italic truncate">
                          &quot;{se.notes}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                    <Link
                      href={`/student/syllabus?examId=${exam.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover"
                    >
                      Browse Syllabus
                      <ExternalLink className="h-3 w-3" />
                    </Link>

                    <button
                      onClick={() => handleRemove(exam.id)}
                      className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-error transition-colors"
                      title="Remove exam"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No Examinations Selected Yet"
            description="Select one or multiple competitive examinations below to activate your syllabus, routine planner, and preparation progress tracking."
          />
        )}
      </section>

      {/* Available Examinations Directory */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border pt-8">
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Available Examination Catalog
            </h2>
            <p className="text-xs text-text-muted">
              Explore competitive examinations and enroll to unlock their full syllabus hierarchy.
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-sm"
                    : "bg-card border border-border text-text-secondary hover:bg-secondary-bg"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((exam) => {
            const isEnrolled = enrolledExamIds.has(exam.id);

            return (
              <Card
                key={exam.id}
                className="p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      <Tag className="h-3 w-3 mr-1" />
                      {exam.category}
                    </Badge>
                    <span className="font-mono text-[10px] text-text-muted font-bold">
                      {exam.code}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-text-primary leading-snug">
                    {exam.name}
                  </h3>
                  {exam.sub_category && (
                    <p className="text-xs text-primary font-medium mt-0.5">
                      {exam.sub_category}
                    </p>
                  )}
                  {exam.description && (
                    <p className="text-xs text-text-muted mt-2 line-clamp-2">
                      {exam.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                  {isEnrolled ? (
                    <Badge variant="success">
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Enrolled
                    </Badge>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedExamToEnroll(exam)}
                      className="gap-1.5 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Enroll Exam
                    </Button>
                  )}

                  <Link
                    href={`/student/syllabus?examId=${exam.id}`}
                    className="text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
                  >
                    View Syllabus
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Enrollment Modal */}
      {selectedExamToEnroll && (
        <Modal
          isOpen={!!selectedExamToEnroll}
          onClose={() => setSelectedExamToEnroll(null)}
          title={`Enroll in ${selectedExamToEnroll.name}`}
          description="Configure your personal target timeline and priority for this examination."
        >
          {errorMsg && (
            <div className="mb-4">
              <Alert variant="error" title={errorMsg} onClose={() => setErrorMsg(null)} />
            </div>
          )}

          <form onSubmit={handleEnrollSubmit} className="space-y-4">
            <Input
              label="Target Examination Date (Optional)"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />

            <Select
              label="Preparation Priority"
              value={priority.toString()}
              onChange={(e) => setPriority(parseInt(e.target.value, 10))}
              options={[
                { value: "1", label: "Priority 1 (Highest Focus)" },
                { value: "2", label: "Priority 2 (Secondary Target)" },
                { value: "3", label: "Priority 3 (General Revision)" },
              ]}
            />

            <Textarea
              label="Personal Study Notes (Optional)"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Aiming for 65+ marks in Paper 1..."
            />

            <div className="mt-6 flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedExamToEnroll(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isPending}
              >
                Confirm Enrollment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
