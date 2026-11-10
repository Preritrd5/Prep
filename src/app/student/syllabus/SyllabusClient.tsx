"use client";

import { useState } from "react";
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
  Bookmark,
  Sparkles,
  BarChart3,
  Search,
  ExternalLink,
} from "lucide-react";
import {
  updateTopicProgressAction,
  createPersonalTopicAction,
  savePersonalNoteAction,
} from "@/app/actions/syllabus";
import type { Exam, Subject, Chapter, Topic, TopicProgressStatus } from "@/lib/types";

interface SyllabusClientProps {
  currentExam: Exam | null;
  allExams: Exam[];
  subjects: Subject[];
}

export default function SyllabusClient({
  currentExam,
  allExams,
  subjects,
}: SyllabusClientProps) {
  const router = useRouter();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ""
  );
  const [openChapterIds, setOpenChapterIds] = useState<Set<string>>(
    new Set(subjects[0]?.chapters?.map((c) => c.id) || [])
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopicForNote, setSelectedTopicForNote] = useState<Topic | null>(null);
  const [selectedChapterForPersonal, setSelectedChapterForPersonal] = useState<Chapter | null>(null);

  // Note form state
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isNotePending, setIsNotePending] = useState(false);

  // Personal topic state
  const [personalTitle, setPersonalTitle] = useState("");
  const [personalDesc, setPersonalDesc] = useState("");
  const [personalDuration, setPersonalDuration] = useState(60);
  const [isPersonalPending, setIsPersonalPending] = useState(false);

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

  const overallPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const handleStatusChange = async (topicId: string, currentStatus?: TopicProgressStatus) => {
    let nextStatus: TopicProgressStatus = "In Progress";
    if (!currentStatus || currentStatus === "Not Started") {
      nextStatus = "In Progress";
    } else if (currentStatus === "In Progress") {
      nextStatus = "Completed";
    } else {
      nextStatus = "Not Started";
    }

    const formData = new FormData();
    formData.append("topicId", topicId);
    if (currentExam) formData.append("examId", currentExam.id);
    formData.append("status", nextStatus);

    await updateTopicProgressAction(formData);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopicForNote || !noteTitle || !noteContent) return;

    setIsNotePending(true);
    const formData = new FormData();
    formData.append("topicId", selectedTopicForNote.id);
    if (currentExam) formData.append("examId", currentExam.id);
    formData.append("title", noteTitle);
    formData.append("content", noteContent);

    await savePersonalNoteAction(formData);
    setIsNotePending(false);
    setSelectedTopicForNote(null);
    setNoteTitle("");
    setNoteContent("");
  };

  const handleCreatePersonalTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapterForPersonal || !personalTitle) return;

    setIsPersonalPending(true);
    const formData = new FormData();
    formData.append("chapterId", selectedChapterForPersonal.id);
    formData.append("title", personalTitle);
    formData.append("description", personalDesc);
    formData.append("estimatedMinutes", personalDuration.toString());

    await createPersonalTopicAction(formData);
    setIsPersonalPending(false);
    setSelectedChapterForPersonal(null);
    setPersonalTitle("");
    setPersonalDesc("");
  };

  return (
    <div className="space-y-6">
      {/* Exam Selector and Overall Progress Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Select Examination Syllabus
            </label>
            <select
              value={currentExam?.id || ""}
              onChange={(e) => router.push(`/student/syllabus?examId=${e.target.value}`)}
              className="w-full md:w-auto min-w-[320px] rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm font-bold text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            >
              {allExams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.category})
                </option>
              ))}
            </select>
          </div>

          {/* Overall Progress Widget */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500">Overall Syllabus Progress</span>
              <p className="text-xl font-extrabold text-slate-900">
                {overallPercent}%{" "}
                <span className="text-xs font-medium text-slate-500">
                  ({completedTopics}/{totalTopics} topics)
                </span>
              </p>
            </div>
            <div className="h-12 w-12 rounded-full border-4 border-indigo-600 border-t-indigo-200 flex items-center justify-center font-bold text-xs text-indigo-700 bg-white">
              {overallPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Syllabus Workspace: Subject Tabs on Left, Chapters/Topics on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Subjects List */}
        <div className="lg:col-span-1 space-y-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 mb-2">
            Curriculum Subjects ({subjects.length})
          </h2>

          <div className="space-y-1">
            {subjects.map((subj) => {
              let sTotal = 0;
              let sCompleted = 0;
              (subj.chapters || []).forEach((c) => {
                (c.topics || []).forEach((t) => {
                  sTotal++;
                  if (t.progress?.status === "Completed") sCompleted++;
                });
              });
              const sPercent = sTotal > 0 ? Math.round((sCompleted / sTotal) * 100) : 0;
              const isSelected = subj.id === activeSubject?.id;

              return (
                <button
                  key={subj.id}
                  onClick={() => {
                    setSelectedSubjectId(subj.id);
                    setOpenChapterIds(new Set(subj.chapters?.map((c) => c.id) || []));
                  }}
                  className={`w-full text-left rounded-xl p-3 transition flex flex-col gap-1.5 ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm truncate">{subj.name}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {sPercent}%
                    </span>
                  </div>

                  {subj.weightage_percent && (
                    <span
                      className={`text-[11px] ${
                        isSelected ? "text-indigo-200" : "text-slate-500"
                      }`}
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
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{activeSubject.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{activeSubject.description}</p>
                </div>

                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-lg border border-slate-300 py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* Chapters List */}
              <div className="space-y-4">
                {(activeSubject.chapters || []).map((chapter) => {
                  const isOpen = openChapterIds.has(chapter.id);
                  const topics = (chapter.topics || []).filter((t) =>
                    searchQuery
                      ? t.title.toLowerCase().includes(searchQuery.toLowerCase())
                      : true
                  );

                  let cTotal = chapter.topics?.length || 0;
                  let cCompleted =
                    chapter.topics?.filter((t) => t.progress?.status === "Completed")
                      .length || 0;
                  let cPercent = cTotal > 0 ? Math.round((cCompleted / cTotal) * 100) : 0;

                  return (
                    <div
                      key={chapter.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden"
                    >
                      {/* Chapter Accordion Header */}
                      <div
                        onClick={() => toggleChapter(chapter.id)}
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-100/60 transition bg-slate-50 border-b border-slate-100"
                      >
                        <div className="flex items-center gap-2.5">
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-slate-500" />
                          )}
                          <h4 className="font-bold text-sm text-slate-900">{chapter.title}</h4>
                          <span className="text-xs text-slate-400 font-medium">
                            ({topics.length} topics)
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-slate-600">
                            {cPercent}% done
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedChapterForPersonal(chapter);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded"
                            title="Add personal topic to chapter"
                          >
                            <Plus className="h-3 w-3" />
                            Personal Topic
                          </button>
                        </div>
                      </div>

                      {/* Topics Table / Cards */}
                      {isOpen && (
                        <div className="divide-y divide-slate-100 bg-white">
                          {topics.length > 0 ? (
                            topics.map((topic) => {
                              const status = topic.progress?.status || "Not Started";

                              return (
                                <div
                                  key={topic.id}
                                  className="p-4 hover:bg-slate-50/60 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleStatusChange(topic.id, status)}
                                        className="focus:outline-none"
                                        title={`Status: ${status}. Click to change.`}
                                      >
                                        {status === "Completed" ? (
                                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        ) : status === "In Progress" ? (
                                          <Clock className="h-5 w-5 text-amber-500" />
                                        ) : (
                                          <Circle className="h-5 w-5 text-slate-300 hover:text-slate-400" />
                                        )}
                                      </button>

                                      <span
                                        className={`font-semibold text-sm ${
                                          status === "Completed"
                                            ? "text-slate-500 line-through"
                                            : "text-slate-900"
                                        }`}
                                      >
                                        {topic.title}
                                      </span>

                                      {topic.is_personal && (
                                        <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                                          Personal
                                        </span>
                                      )}
                                    </div>

                                    {topic.description && (
                                      <p className="text-xs text-slate-500 mt-1 pl-7">
                                        {topic.description}
                                      </p>
                                    )}

                                    {/* References: Separate Official Syllabus vs Textbook */}
                                    <div className="mt-2 pl-7 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-slate-400" />
                                        {topic.estimated_minutes} mins
                                      </span>

                                      {topic.official_syllabus_ref && (
                                        <span className="rounded bg-indigo-50/70 px-2 py-0.5 text-indigo-700 border border-indigo-100">
                                          Official Ref: {topic.official_syllabus_ref}
                                        </span>
                                      )}

                                      {topic.textbook_ref && (
                                        <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700 border border-slate-200 flex items-center gap-1">
                                          <BookOpen className="h-3 w-3 text-slate-500" />
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
                                  <div className="flex items-center gap-2 pl-7 md:pl-0">
                                    <button
                                      type="button"
                                      onClick={() => handleStatusChange(topic.id, status)}
                                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition ${
                                        status === "Completed"
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : status === "In Progress"
                                          ? "bg-amber-50 text-amber-700 border-amber-200"
                                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                      }`}
                                    >
                                      {status}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setSelectedTopicForNote(topic)}
                                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                                      title="Add personal study note"
                                    >
                                      <FileText className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-4 text-center text-xs text-slate-400">
                              No matching topics found.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              No subjects available for this examination.
            </div>
          )}
        </div>
      </div>

      {/* Note Modal */}
      {selectedTopicForNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Add Personal Note: {selectedTopicForNote.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Save key formulas, revision points, and summaries directly to your topic record.
            </p>

            <form onSubmit={handleSaveNote} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Note Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Critical Formulas & Exception Cases"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Note Content
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type your study notes here..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTopicForNote(null)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isNotePending}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isNotePending ? "Saving..." : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Personal Topic Modal */}
      {selectedChapterForPersonal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Add Personal Topic to {selectedChapterForPersonal.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Personal topics are private to your preparation and count toward your study schedule.
            </p>

            <form onSubmit={handleCreatePersonalTopic} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Topic Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Previous Year Numerical Questions"
                  value={personalTitle}
                  onChange={(e) => setPersonalTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Solved 2018-2023 papers"
                  value={personalDesc}
                  onChange={(e) => setPersonalDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Estimated Minutes
                </label>
                <input
                  type="number"
                  min={15}
                  step={15}
                  value={personalDuration}
                  onChange={(e) => setPersonalDuration(parseInt(e.target.value, 10))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedChapterForPersonal(null)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPersonalPending}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isPersonalPending ? "Creating..." : "Create Topic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
