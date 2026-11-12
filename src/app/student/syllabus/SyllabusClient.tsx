"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Plus,
  FileText,
  Search,
  Sparkles,
} from "lucide-react";
import {
  updateTopicProgressAction,
  createPersonalTopicAction,
  savePersonalNoteAction,
} from "@/app/actions/syllabus";
import type { Exam, Subject, Chapter, Topic, TopicProgressStatus } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/Spinner";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface SyllabusClientProps {
  currentExam: Exam | null;
  allExams: Exam[];
  subjects: Subject[];
}

export default function SyllabusClient({
  currentExam,
  allExams,
  subjects: initialSubjects,
}: SyllabusClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local state for immediate optimistic updates
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjects[0]?.id || ""
  );
  const [openChapterIds, setOpenChapterIds] = useState<Set<string>>(
    new Set(initialSubjects[0]?.chapters?.map((c) => c.id) || [])
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopicForNote, setSelectedTopicForNote] = useState<Topic | null>(null);
  const [selectedChapterForPersonal, setSelectedChapterForPersonal] = useState<Chapter | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  // Note form state
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isNotePending, setIsNotePending] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  // Personal topic state
  const [personalTitle, setPersonalTitle] = useState("");
  const [personalDesc, setPersonalDesc] = useState("");
  const [personalDuration, setPersonalDuration] = useState(60);
  const [isPersonalPending, setIsPersonalPending] = useState(false);
  const [personalError, setPersonalError] = useState<string | null>(null);

  // Synchronize state when initialSubjects prop changes (e.g. when changing exam)
  useEffect(() => {
    setSubjects(initialSubjects);
    if (initialSubjects.length > 0) {
      const match = initialSubjects.find((s) => s.id === selectedSubjectId);
      const nextActiveId = match ? match.id : initialSubjects[0].id;
      setSelectedSubjectId(nextActiveId);
      const active = initialSubjects.find((s) => s.id === nextActiveId);
      if (active?.chapters) {
        setOpenChapterIds(new Set(active.chapters.map((c) => c.id)));
      }
    }
  }, [initialSubjects, selectedSubjectId]);

  // Sync with localStorage on initial mount if URL does not specify examId
  useEffect(() => {
    try {
      const savedExamId = localStorage.getItem("preptrack_active_exam_id");
      if (savedExamId && currentExam?.id && savedExamId !== currentExam.id) {
        const exists = allExams.some((e) => e.id === savedExamId);
        if (exists && typeof window !== "undefined" && !window.location.search.includes("examId=")) {
          router.replace(`/syllabus?examId=${encodeURIComponent(savedExamId)}`);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeSubject =
    subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Auto-open chapters when searching
  useEffect(() => {
    if (searchQuery.trim().length > 0 && activeSubject?.chapters) {
      const q = searchQuery.toLowerCase();
      const matchingChapterIds = new Set<string>();
      activeSubject.chapters.forEach((chap) => {
        const hasMatch = (chap.topics || []).some(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.description && t.description.toLowerCase().includes(q))
        );
        if (hasMatch) {
          matchingChapterIds.add(chap.id);
        }
      });
      if (matchingChapterIds.size > 0) {
        setOpenChapterIds(matchingChapterIds);
      }
    }
  }, [searchQuery, activeSubject]);

  const toggleChapter = (chapterId: string) => {
    setOpenChapterIds((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  // Calculate Overall Exam Progress
  let totalTopics = 0;
  let completedTopics = 0;

  subjects.forEach((s) => {
    (s.chapters || []).forEach((c) => {
      (c.topics || []).forEach((t) => {
        totalTopics++;
        if (t.progress?.status === "Completed") {
          completedTopics++;
        }
      });
    });
  });

  const overallPercent =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Handle Exam Switching
  const handleExamChange = (newExamId: string) => {
    if (!newExamId) return;
    try {
      localStorage.setItem("preptrack_active_exam_id", newExamId);
    } catch {}

    startTransition(() => {
      router.push(`/syllabus?examId=${encodeURIComponent(newExamId)}`);
    });
  };

  // Optimistic Topic Completion Cycling: Not Started -> In Progress -> Completed -> Not Started
  const handleStatusChange = async (
    topicId: string,
    currentStatus: TopicProgressStatus
  ) => {
    const cycle: Record<TopicProgressStatus, TopicProgressStatus> = {
      "Not Started": "In Progress",
      "In Progress": "Completed",
      Completed: "Not Started",
    };
    const nextStatus = cycle[currentStatus] || "In Progress";

    // 1. Instant Optimistic UI Update
    setSubjects((prev) =>
      prev.map((subj) => ({
        ...subj,
        chapters: (subj.chapters || []).map((chap) => ({
          ...chap,
          topics: (chap.topics || []).map((top) => {
            if (top.id === topicId) {
              return {
                ...top,
                progress: {
                  ...(top.progress || {
                    id: `local-${topicId}`,
                    student_id: "",
                    topic_id: topicId,
                    exam_id: currentExam?.id || null,
                    scheduled_date: null,
                    started_date: null,
                    revision_count: 0,
                    notes: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  }),
                  status: nextStatus,
                  actual_minutes: top.progress?.actual_minutes || 0,
                  last_studied_date: new Date().toISOString(),
                  completed_date:
                    nextStatus === "Completed"
                      ? new Date().toISOString()
                      : null,
                },
              };
            }
            return top;
          }),
        })),
      }))
    );

    // 2. Persist to Server Action
    const formData = new FormData();
    formData.append("topicId", topicId);
    if (currentExam?.id) formData.append("examId", currentExam.id);
    formData.append("status", nextStatus);

    const res = await updateTopicProgressAction(formData);
    if (res?.error) {
      setPageError(res.error);
    }
  };

  // Save Note with Optimistic Feedback
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopicForNote || !noteTitle) return;

    setIsNotePending(true);
    setNoteError(null);
    const formData = new FormData();
    formData.append("topicId", selectedTopicForNote.id);
    if (currentExam?.id) formData.append("examId", currentExam.id);
    formData.append("title", noteTitle);
    formData.append("content", noteContent);

    const res = await savePersonalNoteAction(formData);
    setIsNotePending(false);
    if (res?.error) {
      setNoteError(res.error);
    } else {
      setSelectedTopicForNote(null);
      setNoteTitle("");
      setNoteContent("");
      setNoteError(null);
      router.refresh();
    }
  };

  // Create Personal Topic with Optimistic UI insertion
  const handleCreatePersonalTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapterForPersonal || !personalTitle) return;

    setIsPersonalPending(true);
    setPersonalError(null);
    const newTopicId = `topic-${Date.now()}`;
    const newTopic: Topic = {
      id: newTopicId,
      chapter_id: selectedChapterForPersonal.id,
      title: personalTitle.trim(),
      description: personalDesc.trim() || null,
      estimated_minutes: personalDuration || 60,
      official_syllabus_ref: null,
      textbook_ref: null,
      textbook_page_start: null,
      textbook_page_end: null,
      order_index: (selectedChapterForPersonal.topics?.length || 0) + 1,
      is_published: true,
      is_personal: true,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      progress: {
        id: `prog-${newTopicId}`,
        student_id: "",
        topic_id: newTopicId,
        exam_id: currentExam?.id || null,
        status: "Not Started",
        actual_minutes: 0,
        scheduled_date: null,
        started_date: null,
        completed_date: null,
        last_studied_date: null,
        revision_count: 0,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    // Optimistically insert into chapter
    setSubjects((prev) =>
      prev.map((subj) => ({
        ...subj,
        chapters: (subj.chapters || []).map((chap) => {
          if (chap.id === selectedChapterForPersonal.id) {
            return {
              ...chap,
              topics: [...(chap.topics || []), newTopic],
            };
          }
          return chap;
        }),
      }))
    );

    const formData = new FormData();
    formData.append("chapterId", selectedChapterForPersonal.id);
    formData.append("title", personalTitle);
    formData.append("description", personalDesc);
    formData.append("estimatedMinutes", personalDuration.toString());

    const res = await createPersonalTopicAction(formData);
    setIsPersonalPending(false);
    if (res?.error) {
      setPersonalError(res.error);
    } else {
      setSelectedChapterForPersonal(null);
      setPersonalTitle("");
      setPersonalDesc("");
      setPersonalError(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {pageError && (
        <Alert variant="error" onClose={() => setPageError(null)} title="Syllabus Notice">
          {pageError}
        </Alert>
      )}

      {/* Exam Selector and Overall Progress Header */}
      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 space-y-1.5 max-w-xl">
              <label
                htmlFor="exam-selector"
                className="block text-xs font-semibold text-text-secondary uppercase tracking-wider"
              >
                Target Examination Syllabus
              </label>
              <div className="relative">
                <select
                  id="exam-selector"
                  value={currentExam?.id || ""}
                  onChange={(e) => handleExamChange(e.target.value)}
                  disabled={isPending}
                  className="w-full h-11 appearance-none rounded-xl border border-input-border bg-card px-3.5 py-2 pr-10 text-sm font-bold text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer disabled:opacity-60 transition"
                  style={{ colorScheme: "dark" }}
                >
                  {allExams.map((e) => (
                    <option
                      key={e.id}
                      value={e.id}
                      className="bg-[#0e1726] text-white py-1.5"
                    >
                      {e.name} ({e.category})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3.5 top-3.5 flex items-center text-text-muted">
                  {isPending ? (
                    <Spinner size="sm" color="primary" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>
              {isPending && (
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-primary font-medium">
                  <Spinner size="sm" color="primary" />
                  <span>Loading examination curriculum...</span>
                </div>
              )}
            </div>

            {/* Overall Progress Widget */}
            <div className="flex items-center gap-4 bg-background-secondary/80 p-4 rounded-xl border border-border">
              <div className="text-right">
                <span className="text-xs font-semibold text-text-secondary">
                  Overall Syllabus Progress
                </span>
                <p className="text-xl font-extrabold text-text-primary">
                  {overallPercent}%{" "}
                  <span className="text-xs font-medium text-text-muted">
                    ({completedTopics}/{totalTopics} topics)
                  </span>
                </p>
              </div>
              <div className="h-12 w-12 rounded-full border-4 border-primary border-t-primary-soft flex items-center justify-center font-bold text-xs text-primary bg-card shrink-0">
                {overallPercent}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Syllabus Workspace: Subject Tabs on Left, Chapters/Topics on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Subjects List */}
        <div className="lg:col-span-1 space-y-2">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-1 mb-2">
            Curriculum Subjects ({subjects.length})
          </h2>

          <div className="space-y-1.5">
            {subjects.map((subj) => {
              let sTotal = 0;
              let sCompleted = 0;
              (subj.chapters || []).forEach((c) => {
                (c.topics || []).forEach((t) => {
                  sTotal++;
                  if (t.progress?.status === "Completed") sCompleted++;
                });
              });
              const sPercent =
                sTotal > 0 ? Math.round((sCompleted / sTotal) * 100) : 0;
              const isSelected = subj.id === activeSubject?.id;

              return (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => {
                    setSelectedSubjectId(subj.id);
                    setOpenChapterIds(
                      new Set(subj.chapters?.map((c) => c.id) || [])
                    );
                  }}
                  className={cn(
                    "w-full text-left rounded-xl p-3.5 transition flex flex-col gap-1.5 border cursor-pointer",
                    isSelected
                      ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                      : "bg-card border-border text-text-primary hover:bg-background-secondary"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm truncate">{subj.name}</span>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-background-secondary text-text-secondary border border-border"
                      )}
                    >
                      {sPercent}%
                    </span>
                  </div>

                  {subj.weightage_percent && (
                    <span
                      className={cn(
                        "text-[11px]",
                        isSelected ? "text-white/80" : "text-text-muted"
                      )}
                    >
                      Weightage: ~{subj.weightage_percent}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chapters & Topics Hierarchy View */}
        <div className="lg:col-span-3 space-y-4">
          {activeSubject ? (
            <Card>
              <CardHeader className="border-b border-border/70 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl font-bold">
                      {activeSubject.name}
                    </CardTitle>
                    {activeSubject.description && (
                      <p className="text-xs text-text-secondary mt-0.5">
                        {activeSubject.description}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-2.5 text-text-muted" />
                    <input
                      type="text"
                      placeholder="Search topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="rounded-lg border border-input-border bg-card py-1.5 pl-9 pr-3 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 w-48 sm:w-64"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-5 space-y-4">
                {/* Chapters List */}
                {(activeSubject.chapters || []).map((chapter) => {
                  const isOpen = openChapterIds.has(chapter.id);
                  const q = searchQuery.toLowerCase().trim();
                  const topics = (chapter.topics || []).filter((t) => {
                    if (!q) return true;
                    return (
                      t.title.toLowerCase().includes(q) ||
                      (t.description && t.description.toLowerCase().includes(q)) ||
                      (t.official_syllabus_ref && t.official_syllabus_ref.toLowerCase().includes(q))
                    );
                  });

                  let cTotal = chapter.topics?.length || 0;
                  let cCompleted =
                    chapter.topics?.filter(
                      (t) => t.progress?.status === "Completed"
                    ).length || 0;
                  let cPercent =
                    cTotal > 0 ? Math.round((cCompleted / cTotal) * 100) : 0;

                  return (
                    <div
                      key={chapter.id}
                      className="rounded-xl border border-border bg-background-secondary/30 overflow-hidden"
                    >
                      {/* Chapter Accordion Header */}
                      <div
                        onClick={() => toggleChapter(chapter.id)}
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-background-secondary/70 transition bg-background-secondary/50 border-b border-border/70 select-none"
                      >
                        <div className="flex items-center gap-2.5">
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4 text-text-muted" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-text-muted" />
                          )}
                          <h4 className="font-bold text-sm text-text-primary">
                            {chapter.title}
                          </h4>
                          <span className="text-xs text-text-muted font-medium">
                            ({topics.length} topics)
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-text-secondary">
                            {cPercent}% done
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedChapterForPersonal(chapter);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline bg-primary-soft px-2.5 py-1 rounded-md border border-primary/20 cursor-pointer"
                            title="Add personal topic to chapter"
                          >
                            <Plus className="h-3 w-3" />
                            Personal Topic
                          </button>
                        </div>
                      </div>

                      {/* Topics Table / Cards */}
                      {isOpen && (
                        <div className="divide-y divide-border/60 bg-card">
                          {topics.length > 0 ? (
                            topics.map((topic) => {
                              const status =
                                topic.progress?.status || "Not Started";

                              return (
                                <div
                                  key={topic.id}
                                  className="p-4 hover:bg-background-secondary/40 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
                                >
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2.5">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleStatusChange(topic.id, status)
                                        }
                                        className="focus:outline-none shrink-0 cursor-pointer"
                                        title={`Status: ${status}. Click to cycle.`}
                                      >
                                        {status === "Completed" ? (
                                          <CheckCircle2 className="h-5 w-5 text-success" />
                                        ) : status === "In Progress" ? (
                                          <Clock className="h-5 w-5 text-warning" />
                                        ) : (
                                          <Circle className="h-5 w-5 text-text-muted hover:text-text-primary" />
                                        )}
                                      </button>

                                      <span
                                        className={cn(
                                          "font-semibold text-sm",
                                          status === "Completed"
                                            ? "text-text-muted line-through"
                                            : "text-text-primary"
                                        )}
                                      >
                                        {topic.title}
                                      </span>

                                      {topic.is_personal && (
                                        <Badge variant="primary" size="sm">
                                          Personal
                                        </Badge>
                                      )}
                                    </div>

                                    {topic.description && (
                                      <p className="text-xs text-text-secondary pl-7">
                                        {topic.description}
                                      </p>
                                    )}

                                    {/* References: Separate Official Syllabus vs Textbook */}
                                    <div className="pl-7 flex flex-wrap items-center gap-2.5 text-[11px] text-text-muted pt-1">
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {topic.estimated_minutes} mins
                                      </span>

                                      {topic.official_syllabus_ref && (
                                        <span className="rounded bg-primary-soft px-2 py-0.5 text-primary border border-primary/20 font-medium">
                                          Official Ref: {topic.official_syllabus_ref}
                                        </span>
                                      )}

                                      {topic.textbook_ref && (
                                        <span className="rounded bg-background-secondary px-2 py-0.5 text-text-secondary border border-border flex items-center gap-1">
                                          <BookOpen className="h-3 w-3 text-text-muted" />
                                          Textbook: {topic.textbook_ref}
                                          {topic.textbook_page_start && (
                                            <span>
                                              (p. {topic.textbook_page_start}
                                              {topic.textbook_page_end
                                                ? `-${topic.textbook_page_end}`
                                                : ""}
                                              )
                                            </span>
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right Controls: Status button & Add Note */}
                                  <div className="flex items-center gap-2 pl-7 md:pl-0 shrink-0">
                                    <Badge
                                      variant={
                                        status === "Completed"
                                          ? "success"
                                          : status === "In Progress"
                                          ? "warning"
                                          : "secondary"
                                      }
                                      size="sm"
                                      className="cursor-pointer select-none"
                                      onClick={() =>
                                        handleStatusChange(topic.id, status)
                                      }
                                    >
                                      {status}
                                    </Badge>

                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        setSelectedTopicForNote(topic)
                                      }
                                      title="Add personal study note"
                                    >
                                      <FileText className="h-4 w-4 text-text-secondary" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="p-4 text-center text-xs text-text-muted">
                              No matching topics found.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={<BookOpen className="h-6 w-6" />}
              title="No subjects available"
              description="No subjects have been mapped to this examination yet."
            />
          )}
        </div>
      </div>

      {/* Note Modal */}
      <Modal
        isOpen={Boolean(selectedTopicForNote)}
        onClose={() => {
          setSelectedTopicForNote(null);
          setNoteError(null);
        }}
        title={
          selectedTopicForNote
            ? `Personal Note: ${selectedTopicForNote.title}`
            : "Add Personal Note"
        }
        description="Save key formulas, revision points, and summaries directly to your topic record."
      >
        {noteError && (
          <div className="mb-4">
            <Alert variant="error" title={noteError} onClose={() => setNoteError(null)} />
          </div>
        )}

        <form onSubmit={handleSaveNote} className="space-y-4">
          <Input
            label="Note Title"
            required
            placeholder="e.g. Critical Formulas & Exception Cases"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
          />

          <Textarea
            label="Note Content"
            required
            rows={5}
            placeholder="Type your study notes here..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/70">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setSelectedTopicForNote(null);
                setNoteError(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isNotePending}>
              Save Note
            </Button>
          </div>
        </form>
      </Modal>

      {/* Personal Topic Modal */}
      <Modal
        isOpen={Boolean(selectedChapterForPersonal)}
        onClose={() => {
          setSelectedChapterForPersonal(null);
          setPersonalError(null);
        }}
        title={
          selectedChapterForPersonal
            ? `Add Personal Topic to ${selectedChapterForPersonal.title}`
            : "Add Personal Topic"
        }
        description="Personal topics are private to your preparation and count toward your study schedule."
      >
        {personalError && (
          <div className="mb-4">
            <Alert variant="error" title={personalError} onClose={() => setPersonalError(null)} />
          </div>
        )}

        <form onSubmit={handleCreatePersonalTopic} className="space-y-4">
          <Input
            label="Topic Title"
            required
            placeholder="e.g. Previous Year Numerical Questions"
            value={personalTitle}
            onChange={(e) => setPersonalTitle(e.target.value)}
          />

          <Input
            label="Description (Optional)"
            placeholder="e.g. Solved 2018-2023 papers"
            value={personalDesc}
            onChange={(e) => setPersonalDesc(e.target.value)}
          />

          <Input
            label="Estimated Minutes"
            type="number"
            min={15}
            step={15}
            value={personalDuration}
            onChange={(e) => setPersonalDuration(parseInt(e.target.value, 10))}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/70">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setSelectedChapterForPersonal(null);
                setPersonalError(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isPersonalPending}>
              Create Topic
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
