"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Plus,
  ExternalLink,
  Calendar,
} from "lucide-react";
import {
  adminCreateExamEventAction,
  adminToggleExamEventAction,
} from "@/app/actions/events";
import type { ExamScheduleEvent, Exam, ExamEventType } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";

interface AdminEventsClientProps {
  events: ExamScheduleEvent[];
  exams: Exam[];
}

const EVENT_TYPES: ExamEventType[] = [
  "Official Examination",
  "Application Opening",
  "Application Closing",
  "Admit Card Release",
  "Result Announcement",
  "Important Deadline",
  "Other",
];

export default function AdminEventsClient({
  events,
  exams,
}: AdminEventsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [examId, setExamId] = useState(exams[0]?.id || "");
  const [eventType, setEventType] =
    useState<ExamEventType>("Official Examination");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState("");
  const [officialUrl, setOfficialUrl] = useState("");
  const [verificationDate, setVerificationDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("examId", examId);
    formData.append("eventType", eventType);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("officialSourceUrl", officialUrl);
    formData.append("verificationDate", verificationDate);

    const res = await adminCreateExamEventAction(formData);
    setIsPending(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setOfficialUrl("");
    }
  };

  const handleToggle = async (ev: ExamScheduleEvent) => {
    await adminToggleExamEventAction(ev.id, ev.is_active);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">
            Published Examination Milestones ({events.length})
          </h2>
          <p className="text-xs text-text-secondary">
            Publish verified official deadlines and exam schedules with official source URLs.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
          size="md"
        >
          Publish Exam Event
        </Button>
      </div>

      <Card className="overflow-hidden">
        {events.length > 0 ? (
          <div className="divide-y divide-border/60">
            {events.map((ev) => {
              const exam = ev.exam || exams.find((e) => e.id === ev.exam_id);

              return (
                <div
                  key={ev.id}
                  className="p-5 hover:bg-background-secondary/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="accent" size="sm">
                        {ev.event_type}
                      </Badge>
                      {exam && (
                        <Badge variant="primary" size="sm">
                          {exam.name}
                        </Badge>
                      )}
                      {!ev.is_active && (
                        <Badge variant="secondary" size="sm">
                          Hidden
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-text-primary">
                      {ev.title}
                    </h3>
                    {ev.description && (
                      <p className="text-xs text-text-secondary">
                        {ev.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-1">
                      <span className="flex items-center gap-1 font-semibold text-text-primary">
                        <Calendar className="h-3.5 w-3.5 text-text-muted" />
                        {new Date(ev.start_date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {ev.end_date && (
                          <span>
                            {" "}
                            -{" "}
                            {new Date(ev.end_date).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </span>

                      {ev.verification_date && (
                        <span className="text-[11px] text-text-muted">
                          Verified: {ev.verification_date}
                        </span>
                      )}

                      {ev.official_source_url && (
                        <a
                          href={ev.official_source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 text-[11px] font-semibold"
                        >
                          Source Link <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant={ev.is_active ? "outline" : "secondary"}
                      size="sm"
                      onClick={() => handleToggle(ev)}
                    >
                      {ev.is_active ? "Hide Event" : "Publish"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={<CalendarDays className="h-6 w-6" />}
              title="No events published yet"
              description="Publish verified exam milestones and deadlines for student calendars."
              action={
                <Button
                  onClick={() => setIsModalOpen(true)}
                  leftIcon={<Plus className="h-4 w-4" />}
                  size="sm"
                >
                  Publish Exam Event
                </Button>
              }
            />
          </div>
        )}
      </Card>

      {/* Publish Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Official Examination Event"
        description="Add a verified event milestone to the student preparation calendar."
      >
        {errorMsg && (
          <Alert variant="error" className="mb-4">
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Examination"
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            options={exams.map((ex) => ({
              label: `${ex.name} (${ex.category})`,
              value: ex.id,
            }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Event Type"
              value={eventType}
              onChange={(e) => setEventType(e.target.value as ExamEventType)}
              options={EVENT_TYPES.map((t) => ({ label: t, value: t }))}
            />

            <Input
              label="Verification Date"
              type="date"
              value={verificationDate}
              onChange={(e) => setVerificationDate(e.target.value)}
            />
          </div>

          <Input
            label="Event Title"
            required
            placeholder="e.g. GATE 2027 Official Notification & Registration Opening"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            label="Description (Optional)"
            rows={2}
            placeholder="Key eligibility details, fee structure, exam format..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              label="End Date (Optional)"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <Input
            label="Official Notification / Portal URL"
            type="url"
            placeholder="https://gate.iitk.ac.in"
            value={officialUrl}
            onChange={(e) => setOfficialUrl(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/70">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Publish Milestone
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
