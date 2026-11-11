"use client";

import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { useState, useMemo } from "react";
import type { Exam, Subject, Question, PracticeMode } from "@/lib/types";
import PracticeRunner from "@/components/practice/PracticeRunner";
import { BookOpen, Layers, CheckCircle2, Play, Sparkles } from "lucide-react";

interface TopicPracticeClientProps {
  exams: Exam[];
  subjects: Subject[];
  allQuestions: Question[];
  bookmarkedIds: string[];
}

export default function TopicPracticeClient({
  exams,
  subjects,
  allQuestions,
  bookmarkedIds,
}: TopicPracticeClientProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || "All");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("All");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("Learn");
  const [questionCount, setQuestionCount] = useState<number>(20);

  // Active subject, chapters and topics
  const activeSubject = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectId),
    [subjects, selectedSubjectId]
  );

  const availableChapters = useMemo(
    () => activeSubject?.chapters || [],
    [activeSubject]
  );

  const activeChapter = useMemo(
    () => availableChapters.find((c) => c.id === selectedChapterId),
    [availableChapters, selectedChapterId]
  );

  const availableTopics = useMemo(
    () => activeChapter?.topics || [],
    [activeChapter]
  );

  const activeTopic = useMemo(
    () => availableTopics.find((t) => t.id === selectedTopicId),
    [availableTopics, selectedTopicId]
  );

  // Filter questions according to selections
  const filteredQuestions = useMemo(() => {
    return allQuestions
      .filter((q) => {
        if (q.status !== "Published") return false;
        if (selectedSubjectId !== "All" && q.subject_id !== selectedSubjectId) return false;
        if (selectedChapterId !== "All" && q.chapter_id && q.chapter_id !== selectedChapterId) return false;
        if (selectedTopicId !== "All" && q.topic_id && q.topic_id !== selectedTopicId) return false;
        if (selectedDifficulty !== "All" && q.difficulty !== selectedDifficulty) return false;
        return true;
      })
      .slice(0, questionCount === 0 ? undefined : questionCount);
  }, [allQuestions, selectedSubjectId, selectedChapterId, selectedTopicId, selectedDifficulty, questionCount]);

  const handleSubjectChange = (subjId: string) => {
    setSelectedSubjectId(subjId);
    setSelectedChapterId("All");
    setSelectedTopicId("All");
  };

  const handleChapterChange = (chId: string) => {
    setSelectedChapterId(chId);
    setSelectedTopicId("All");
  };

  return (
    <div className="space-y-6">
      {/* Topic-Wise Navigation & Selection Console */}
      <Card className="p-5 sm:p-6 bg-card border-border shadow-xs rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary-subtle)] text-primary border border-primary/20 shadow-xs">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-heading text-text-primary">
                Syllabus Topic Practice Console
              </h2>
              <p className="text-xs text-text-secondary">
                Select curriculum subject, section, and specific topic to begin practice.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Questions Available:</span>
            <Badge variant="primary" size="md">
              {filteredQuestions.length} Items
            </Badge>
          </div>
        </div>

        {/* Hierarchical Cascading Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Subject */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase font-mono text-text-secondary">
              1. Curriculum Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full border border-border rounded-xl px-3 py-2 text-xs font-semibold bg-input text-text-primary shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/25"
            >
              <option value="All">All Curriculum Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Section / Chapter */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase font-mono text-text-secondary">
              2. Syllabus Section / Chapter
            </label>
            <select
              value={selectedChapterId}
              onChange={(e) => handleChapterChange(e.target.value)}
              disabled={selectedSubjectId === "All" || availableChapters.length === 0}
              className="w-full border border-border rounded-xl px-3 py-2 text-xs font-semibold bg-input text-text-primary shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="All">
                {selectedSubjectId === "All"
                  ? "Select a Subject first"
                  : availableChapters.length === 0
                  ? "No distinct sections"
                  : "All Sections in Subject"}
              </option>
              {availableChapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Specific Topic */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase font-mono text-text-secondary">
              3. Specific Topic
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              disabled={selectedChapterId === "All" || availableTopics.length === 0}
              className="w-full border border-border rounded-xl px-3 py-2 text-xs font-semibold bg-input text-text-primary shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="All">
                {selectedChapterId === "All"
                  ? "Select a Section first"
                  : availableTopics.length === 0
                  ? "No distinct topics"
                  : "All Topics in Section"}
              </option>
              {availableTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Difficulty Filter */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase font-mono text-text-secondary">
              Difficulty Tier
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full border border-border rounded-xl px-3 py-2 text-xs font-semibold bg-input text-text-primary shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/25"
            >
              <option value="All">All Difficulties (Balanced)</option>
              <option value="Easy">Easy (Foundational)</option>
              <option value="Medium">Medium (Standard)</option>
              <option value="Hard">Hard (Advanced PYQs)</option>
            </select>
          </div>

          {/* 5. Practice Mode */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase font-mono text-text-secondary">
              Practice Mode
            </label>
            <select
              value={practiceMode}
              onChange={(e) => setPracticeMode(e.target.value as PracticeMode)}
              className="w-full border border-border rounded-xl px-3 py-2 text-xs font-semibold bg-input text-text-primary shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/25"
            >
              <option value="Learn">Learn Mode (Instant Explanations)</option>
              <option value="Test">Test Mode (Timed Exam &amp; Scorecard)</option>
            </select>
          </div>

          {/* 6. Question Count */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase font-mono text-text-secondary">
              Session Length
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full border border-border rounded-xl px-3 py-2 text-xs font-semibold bg-input text-text-primary shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/25"
            >
              <option value={5}>5 Questions (Quick Drill)</option>
              <option value={10}>10 Questions</option>
              <option value={20}>20 Questions (Standard)</option>
              <option value={30}>30 Questions</option>
              <option value={0}>All Available Questions</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Practice Runner Session Container */}
      <PracticeRunner
        questions={filteredQuestions}
        title={`${activeTopic?.title || activeChapter?.title || activeSubject?.name || "Curriculum"} Practice`}
        subtitle={
          practiceMode === "Learn"
            ? "Learn Mode: Receive immediate pedagogical explanations and answer checks after every question."
            : "Test Mode: Complete a timed test without mid-test interruptions, followed by comprehensive score analytics."
        }
        subjectId={selectedSubjectId !== "All" ? selectedSubjectId : undefined}
        topicId={selectedTopicId !== "All" ? selectedTopicId : undefined}
        initialMode={practiceMode}
        bookmarkedQuestionIds={bookmarkedIds}
      />
    </div>
  );
}
