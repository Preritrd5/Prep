"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  CheckCircle2,
  Calendar,
  Clock,
  Plus,
  BookOpen,
} from "lucide-react";
import type { RevisionScheduleItem, RevisionConfidenceRating } from "@/lib/types";
import {
  studentUpdateRevisionAction,
  studentScheduleRevisionAction,
} from "@/app/actions/analytics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface RevisionsClientProps {
  revisions: RevisionScheduleItem[];
  availableTopics: { id: string; title: string; subjectName: string }[];
}

export default function RevisionsClient({
  revisions: initialRevisions,
  availableTopics,
}: RevisionsClientProps) {
  const [revisions, setRevisions] = useState<RevisionScheduleItem[]>(initialRevisions);
  const [filter, setFilter] = useState<"all" | "pending" | "overdue" | "completed">("pending");
  const [selectedRevForReview, setSelectedRevForReview] = useState<RevisionScheduleItem | null>(null);
  const [confidence, setConfidence] = useState<RevisionConfidenceRating>("Understood");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  // Manual form states
  const [manualTopicId, setManualTopicId] = useState(availableTopics[0]?.id || "");
  const [manualDate, setManualDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [manualNotes, setManualNotes] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const pendingRevs = revisions.filter((r) => !r.is_completed);
  const overdueRevs = pendingRevs.filter((r) => r.scheduled_date < todayStr);
  const completedRevs = revisions.filter((r) => r.is_completed);

  const displayedRevisions = revisions.filter((r) => {
    if (filter === "pending") return !r.is_completed;
    if (filter === "overdue") return !r.is_completed && r.scheduled_date < todayStr;
    if (filter === "completed") return r.is_completed;
    return true;
  });

  const handleCompleteRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRevForReview) return;
    setIsSubmitting(true);

    const fd = new FormData();
    fd.append("revisionId", selectedRevForReview.id);
    fd.append("confidenceRating", confidence);
    fd.append("notes", notes);

    const res = await studentUpdateRevisionAction(fd);
    setIsSubmitting(false);

    if (res.success) {
      setRevisions((prev) =>
        prev.map((r) =>
          r.id === selectedRevForReview.id
            ? { ...r, is_completed: true, completed_date: todayStr, confidence_rating: confidence }
            : r
        )
      );
      setSelectedRevForReview(null);
      setNotes("");
    }
  };

  const handleManualSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTopicId || !manualDate) return;
    setIsSubmitting(true);

    const fd = new FormData();
    fd.append("topicId", manualTopicId);
    fd.append("scheduledDate", manualDate);
    fd.append("notes", manualNotes);

    const res = await studentScheduleRevisionAction(fd);
    setIsSubmitting(false);

    if (res.success) {
      setShowManualModal(false);
      setManualNotes("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Pending Revisions"
          value={pendingRevs.length}
          icon={<RotateCcw className="h-5 w-5 text-primary" />}
          description="Due for repetition review"
        />
        <StatCard
          title="Overdue Items"
          value={overdueRevs.length}
          icon={<Clock className="h-5 w-5 text-error" />}
          iconBgColor="bg-error-soft"
          description="Lapsed beyond target repetition window"
        />
        <StatCard
          title="Completed Revisions"
          value={completedRevs.length}
          icon={<CheckCircle2 className="h-5 w-5 text-success" />}
          iconBgColor="bg-success-soft"
          description="Reinforced in memory"
        />
      </div>

      {/* Filter and Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: "pending", label: "Pending", count: pendingRevs.length },
            { id: "overdue", label: "Overdue", count: overdueRevs.length },
            { id: "completed", label: "Completed", count: completedRevs.length },
            { id: "all", label: "All Items", count: revisions.length },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id as any)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 border",
                filter === item.id
                  ? "bg-primary text-white border-primary shadow-sm shadow-primary/25"
                  : "bg-card border-border text-text-secondary hover:bg-background-secondary"
              )}
            >
              <span>{item.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px]",
                  filter === item.id
                    ? "bg-white/20 text-white"
                    : "bg-background-secondary text-text-primary border border-border"
                )}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>

        <Button
          size="sm"
          onClick={() => setShowManualModal(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Schedule Revision
        </Button>
      </div>

      {/* Revision Items Feed */}
      <Card>
        <CardContent className="p-0">
          {displayedRevisions.length > 0 ? (
            <div className="divide-y divide-border/60">
              {displayedRevisions.map((rev) => {
                const isOverdue = !rev.is_completed && rev.scheduled_date < todayStr;

                return (
                  <div
                    key={rev.id}
                    className="p-4 hover:bg-background-secondary/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-text-primary">
                          {rev.topic?.title || "Curriculum Topic"}
                        </span>
                        <Badge variant="primary" size="sm">
                          Cycle #{rev.revision_number}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="error" size="sm">
                            Overdue
                          </Badge>
                        )}
                        {rev.is_completed && (
                          <Badge variant="success" size="sm">
                            Completed
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Target: {rev.scheduled_date}
                        </span>
                        {rev.completed_date && (
                          <span className="flex items-center gap-1 text-success">
                            <CheckCircle2 className="h-3 w-3" />
                            Reviewed: {rev.completed_date}
                          </span>
                        )}
                        {rev.confidence_rating && (
                          <span className="font-semibold text-text-primary">
                            Confidence: {rev.confidence_rating}
                          </span>
                        )}
                      </div>

                      {rev.notes && (
                        <p className="text-xs text-text-secondary mt-1 italic">
                          &ldquo;{rev.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    {!rev.is_completed && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setSelectedRevForReview(rev)}
                      >
                        Complete Review
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                icon={<RotateCcw className="h-6 w-6" />}
                title="No revisions in this view"
                description="Topics marked as completed will automatically generate spaced repetition milestones."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complete Review Modal */}
      <Modal
        isOpen={Boolean(selectedRevForReview)}
        onClose={() => setSelectedRevForReview(null)}
        title="Record Revision Outcome"
        description={
          selectedRevForReview
            ? `Reviewing: ${selectedRevForReview.topic?.title}`
            : "Reviewing Topic"
        }
      >
        <form onSubmit={handleCompleteRevision} className="space-y-4">
          <Select
            label="Confidence Level"
            value={confidence}
            onChange={(e) => setConfidence(e.target.value as RevisionConfidenceRating)}
            options={[
              { label: "Mastered (Seamless Recall)", value: "Mastered" },
              { label: "Understood (Clear with minor pause)", value: "Understood" },
              { label: "Needs Practice (Formulas hazy)", value: "Needs Practice" },
              { label: "Difficult (Requires restudy)", value: "Difficult" },
            ]}
          />

          <Textarea
            label="Revision Reflections / Notes"
            rows={3}
            placeholder="Formulas recalled, tricky exception cases..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/70">
            <Button
              variant="outline"
              type="button"
              onClick={() => setSelectedRevForReview(null)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Revision
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manual Schedule Modal */}
      <Modal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        title="Schedule Manual Revision"
        description="Select a syllabus topic to set an explicit recall milestone."
      >
        <form onSubmit={handleManualSchedule} className="space-y-4">
          <Select
            label="Select Topic"
            value={manualTopicId}
            onChange={(e) => setManualTopicId(e.target.value)}
            options={availableTopics.map((t) => ({
              label: `${t.title} (${t.subjectName})`,
              value: t.id,
            }))}
          />

          <Input
            label="Scheduled Date"
            type="date"
            required
            value={manualDate}
            onChange={(e) => setManualDate(e.target.value)}
          />

          <Textarea
            label="Study Notes / Goals (Optional)"
            rows={2}
            placeholder="Specific problem sets or diagrams to reproduce..."
            value={manualNotes}
            onChange={(e) => setManualNotes(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/70">
            <Button
              variant="outline"
              type="button"
              onClick={() => setShowManualModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Schedule Milestone
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
