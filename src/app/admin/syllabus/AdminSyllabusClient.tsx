"use client";

import React, { useState } from "react";
import {
  Plus,
  BookOpen,
  Clock,
  Link as LinkIcon,
  Layers,
} from "lucide-react";
import {
  adminCreateChapterAction,
  adminCreateTopicAction,
  adminMapSubjectToExamAction,
} from "@/app/actions/syllabus";
import type { Subject, Exam, Chapter } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";

interface AdminSyllabusClientProps {
  subjects: Subject[];
  exams: Exam[];
}

export default function AdminSyllabusClient({
  subjects,
  exams,
}: AdminSyllabusClientProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ""
  );
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

  const activeSubject =
    subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

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
      <Card>
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-text-secondary uppercase">
              Active Subject:
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="rounded-xl border border-input-border bg-card px-3.5 py-2 text-sm font-bold text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id} className="bg-card text-text-primary">
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMapModalOpen(true)}
              leftIcon={<LinkIcon className="h-4 w-4 text-primary" />}
            >
              Map to Examination
            </Button>
            <Button
              size="sm"
              onClick={() => setIsChapterModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Chapter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chapters & Topics List */}
      {activeSubject ? (
        <Card>
          <CardHeader className="border-b border-border/70 pb-4">
            <CardTitle className="text-xl font-bold">
              {activeSubject.name}
            </CardTitle>
            {activeSubject.description && (
              <p className="text-xs text-text-secondary mt-0.5">
                {activeSubject.description}
              </p>
            )}
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            {(activeSubject.chapters || []).length > 0 ? (
              (activeSubject.chapters || []).map((chap) => (
                <div
                  key={chap.id}
                  className="rounded-xl border border-border bg-background-secondary/40 overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 bg-background-secondary/70 border-b border-border/70">
                    <div>
                      <h4 className="font-bold text-sm text-text-primary">
                        {chap.title}
                      </h4>
                      {chap.description && (
                        <p className="text-xs text-text-secondary mt-0.5">
                          {chap.description}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTargetChapter(chap);
                        setIsTopicModalOpen(true);
                      }}
                      leftIcon={<Plus className="h-3.5 w-3.5" />}
                    >
                      Add Topic
                    </Button>
                  </div>

                  <div className="p-4 bg-card">
                    {(chap.topics || []).length > 0 ? (
                      <div className="divide-y divide-border/60">
                        {(chap.topics || []).map((t) => (
                          <div
                            key={t.id}
                            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-1">
                              <h5 className="font-bold text-xs text-text-primary">
                                {t.title}
                              </h5>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {t.estimated_minutes}m
                                </span>
                                {t.official_syllabus_ref && (
                                  <Badge variant="secondary" size="sm">
                                    Official: {t.official_syllabus_ref}
                                  </Badge>
                                )}
                                {t.textbook_ref && (
                                  <span className="flex items-center gap-1 text-text-secondary">
                                    <BookOpen className="h-3 w-3 text-text-muted" />
                                    {t.textbook_ref}{" "}
                                    {t.textbook_page_start
                                      ? `(p. ${t.textbook_page_start})`
                                      : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-text-muted py-2">
                        No topics authored for this chapter yet.
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={<Layers className="h-6 w-6" />}
                title="No chapters created yet"
                description="Start authoring the curriculum structure for this subject."
                action={
                  <Button
                    size="sm"
                    onClick={() => setIsChapterModalOpen(true)}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Add Chapter
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Chapter Creation Modal */}
      <Modal
        isOpen={isChapterModalOpen}
        onClose={() => setIsChapterModalOpen(false)}
        title={`Add Chapter to ${activeSubject?.name || "Subject"}`}
        description="Chapters organize individual topics into thematic curriculum modules."
      >
        {errorMsg && (
          <Alert variant="error" className="mb-4">
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={handleCreateChapter} className="space-y-4">
          <Input
            label="Chapter Title"
            required
            placeholder="e.g. Water Demand & Population Forecasting"
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
          />

          <Textarea
            label="Description (Optional)"
            rows={3}
            placeholder="Brief scope of topics in this chapter..."
            value={chapterDesc}
            onChange={(e) => setChapterDesc(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/70">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsChapterModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Create Chapter
            </Button>
          </div>
        </form>
      </Modal>

      {/* Topic Creation Modal */}
      <Modal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        title={`Add Topic to ${targetChapter?.title || "Chapter"}`}
        description="Define fine-grained topics with verifiable syllabus and textbook references."
      >
        {errorMsg && (
          <Alert variant="error" className="mb-4">
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={handleCreateTopic} className="space-y-4">
          <Input
            label="Topic Title"
            required
            placeholder="e.g. Design of Rapid Sand Gravity Filters"
            value={topicTitle}
            onChange={(e) => setTopicTitle(e.target.value)}
          />

          <Textarea
            label="Description"
            rows={2}
            placeholder="Key concepts, equations, and problem archetypes..."
            value={topicDesc}
            onChange={(e) => setTopicDesc(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Estimated Study Minutes"
              type="number"
              min={15}
              step={15}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10))}
            />

            <Input
              label="Official Syllabus Code/Ref"
              placeholder="e.g. GATE-CE-Sec4.2"
              value={officialRef}
              onChange={(e) => setOfficialRef(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <Input
                label="Textbook Ref"
                placeholder="Garg / Peavy"
                value={textbookRef}
                onChange={(e) => setTextbookRef(e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Page Start"
                placeholder="112"
                value={pageStart}
                onChange={(e) => setPageStart(e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Page End"
                placeholder="145"
                value={pageEnd}
                onChange={(e) => setPageEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/70">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsTopicModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Create Topic
            </Button>
          </div>
        </form>
      </Modal>

      {/* Map Subject to Exam Modal */}
      <Modal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        title={`Map ${activeSubject?.name || "Subject"} to Examination`}
        description="Associate this curriculum subject with an examination catalog entry and assign weightage."
      >
        {errorMsg && (
          <Alert variant="error" className="mb-4">
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={handleMapSubject} className="space-y-4">
          <Select
            label="Target Examination"
            value={targetExamId}
            onChange={(e) => setTargetExamId(e.target.value)}
            options={exams.map((ex) => ({
              label: `${ex.name} (${ex.category})`,
              value: ex.id,
            }))}
          />

          <Input
            label="Estimated Exam Weightage (%)"
            type="number"
            min={1}
            max={100}
            value={weightage}
            onChange={(e) => setWeightage(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/70">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsMapModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Map to Exam
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
