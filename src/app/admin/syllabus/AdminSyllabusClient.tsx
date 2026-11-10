"use client";

import { useState } from "react";
import {
  Layers,
  Plus,
  BookOpen,
  Clock,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  FileText,
  Link as LinkIcon,
} from "lucide-react";
import {
  adminCreateChapterAction,
  adminCreateTopicAction,
  adminMapSubjectToExamAction,
} from "@/app/actions/syllabus";
import type { Subject, Exam, Chapter } from "@/lib/types";

interface AdminSyllabusClientProps {
  subjects: Subject[];
  exams: Exam[];
}

export default function AdminSyllabusClient({ subjects, exams }: AdminSyllabusClientProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || "");
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [targetChapter, setTargetChapter] = useState<Chapter | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Chapter Form State
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterDesc, setChapterDesc] = useState("");

  // Topic Form State
  const [topicTitle, setTopicTitle] = useState("");
  const [topicDesc, setTopicDesc] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [officialRef, setOfficialRef] = useState("");
  const [textbookRef, setTextbookRef] = useState("");
  const [pageStart, setPageStart] = useState("");
  const [pageEnd, setPageEnd] = useState("");

  // Mapping Form State
  const [targetExamId, setTargetExamId] = useState(exams[0]?.id || "");
  const [weightage, setWeightage] = useState("15");

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubject) return;

    setIsPending(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("subjectId", activeSubject.id);
    formData.append("title", chapterTitle);
    formData.append("description", chapterDesc);

    const res = await adminCreateChapterAction(formData);
    setIsPending(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setIsChapterModalOpen(false);
      setChapterTitle("");
      setChapterDesc("");
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetChapter) return;

    setIsPending(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("chapterId", targetChapter.id);
    formData.append("title", topicTitle);
    formData.append("description", topicDesc);
    formData.append("estimatedMinutes", estimatedMinutes.toString());
    formData.append("officialSyllabusRef", officialRef);
    formData.append("textbookRef", textbookRef);
    formData.append("textbookPageStart", pageStart);
    formData.append("textbookPageEnd", pageEnd);

    const res = await adminCreateTopicAction(formData);
    setIsPending(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setIsTopicModalOpen(false);
      setTopicTitle("");
      setTopicDesc("");
      setOfficialRef("");
      setTextbookRef("");
      setPageStart("");
      setPageEnd("");
    }
  };

  const handleMapSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubject) return;

    setIsPending(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("examId", targetExamId);
    formData.append("subjectId", activeSubject.id);
    formData.append("weightage", weightage);

    const res = await adminMapSubjectToExamAction(formData);
    setIsPending(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setIsMapModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Selector & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase">Active Subject:</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-1.5 text-sm font-bold text-slate-800"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMapModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <LinkIcon className="h-3.5 w-3.5 text-purple-600" />
            Map to Examination
          </button>
          <button
            onClick={() => setIsChapterModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Chapter
          </button>
        </div>
      </div>

      {/* Chapters & Topics List */}
      {activeSubject ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-900">{activeSubject.name}</h3>
            <p className="text-xs text-slate-500">{activeSubject.description}</p>
          </div>

          <div className="space-y-4">
            {(activeSubject.chapters || []).map((chap) => (
              <div key={chap.id} className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border-b border-slate-100">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{chap.title}</h4>
                    {chap.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{chap.description}</p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setTargetChapter(chap);
                      setIsTopicModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 rounded bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 hover:bg-purple-100"
                  >
                    <Plus className="h-3 w-3" />
                    Add Topic
                  </button>
                </div>

                <div className="divide-y divide-slate-100 p-2">
                  {(chap.topics || []).map((top) => (
                    <div key={top.id} className="p-3 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{top.title}</span>
                        {top.description && (
                          <p className="text-slate-500 text-[11px] mt-0.5">{top.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span>Est: {top.estimated_minutes}m</span>
                          {top.official_syllabus_ref && (
                            <span className="text-indigo-600">
                              Ref: {top.official_syllabus_ref}
                            </span>
                          )}
                          {top.textbook_ref && (
                            <span className="text-slate-600">Book: {top.textbook_ref}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!chap.topics || chap.topics.length === 0) && (
                    <div className="p-3 text-center text-xs text-slate-400">
                      No topics added yet. Click &quot;Add Topic&quot; to author topics with references.
                    </div>
                  )}
                </div>
              </div>
            ))}

            {(!activeSubject.chapters || activeSubject.chapters.length === 0) && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No chapters added to this subject. Click &quot;Add Chapter&quot; above to begin hierarchy setup.
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Add Chapter Modal */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Add Chapter to {activeSubject?.name}</h3>
            <form onSubmit={handleCreateChapter} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Chapter Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Indian History"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Chapter focus area..."
                  value={chapterDesc}
                  onChange={(e) => setChapterDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsChapterModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-60"
                >
                  {isPending ? "Saving..." : "Add Chapter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {isTopicModalOpen && targetChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Add Topic to {targetChapter.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Maintain separate official syllabus codes and verified textbook page references.
            </p>

            <form onSubmit={handleCreateTopic} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Topic Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1857 Revolt & British Administrative Changes"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Est. Study Minutes
                  </label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Official Syllabus Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UPSC-GS1-HIST-04"
                    value={officialRef}
                    onChange={(e) => setOfficialRef(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Textbook Title / Author
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spectrum Modern India by Rajiv Ahir"
                  value={textbookRef}
                  onChange={(e) => setTextbookRef(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Textbook Start Page
                  </label>
                  <input
                    type="number"
                    placeholder="120"
                    value={pageStart}
                    onChange={(e) => setPageStart(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Textbook End Page
                  </label>
                  <input
                    type="number"
                    placeholder="145"
                    value={pageEnd}
                    onChange={(e) => setPageEnd(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-60"
                >
                  {isPending ? "Saving..." : "Save Topic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Map Subject to Exam Modal */}
      {isMapModalOpen && activeSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Map {activeSubject.name} to Examination
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Reuses this subject in multiple examinations with a custom weightage.
            </p>

            <form onSubmit={handleMapSubject} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Exam</label>
                <select
                  value={targetExamId}
                  onChange={(e) => setTargetExamId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                >
                  {exams.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Weightage Percentage (%)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={weightage}
                  onChange={(e) => setWeightage(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-60"
                >
                  {isPending ? "Mapping..." : "Save Mapping"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
