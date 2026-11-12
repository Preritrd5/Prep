"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Calendar,
  Clock,
  Save,
  Check,
  Trash2,
  Info,
} from "lucide-react";
import {
  generateStudyPlanAction,
  saveGeneratedPlanAction,
  type GeneratedPlanItem,
} from "@/app/actions/planner";
import type { Exam, StudentExam, StudyPreferences } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";

interface PlannerClientProps {
  enrolledExams: StudentExam[];
  allExams: Exam[];
  preferences: StudyPreferences;
}

export default function PlannerClient({
  enrolledExams,
  allExams,
  preferences,
}: PlannerClientProps) {
  const router = useRouter();
  const [selectedExamId, setSelectedExamId] = useState<string>(
    enrolledExams[0]?.exam_id || allExams[0]?.id || ""
  );
  const [planHorizonDays, setPlanHorizonDays] = useState<number>(14);
  const [includeCompleted, setIncludeCompleted] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const [proposedPlan, setProposedPlan] = useState<GeneratedPlanItem[] | null>(null);
  const [planStats, setPlanStats] = useState<{
    totalTopics: number;
    totalHours: number;
    daysAnalyzed: number;
  } | null>(null);

  const activeEnrolled = enrolledExams.find((e) => e.exam_id === selectedExamId);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMsg(null);
    setInfoMsg(null);
    setSaveSuccessMsg(null);

    const formData = new FormData();
    formData.append("examId", selectedExamId);
    formData.append("planHorizonDays", planHorizonDays.toString());
    formData.append("includeCompleted", includeCompleted ? "true" : "false");
    if (activeEnrolled?.target_date) {
      formData.append("targetDate", activeEnrolled.target_date);
    }

    const res = await generateStudyPlanAction(formData);
    setIsGenerating(false);

    if (!res.success || res.error) {
      setErrorMsg(res.error || "Failed to generate plan.");
    } else if (res.plan) {
      if (res.message) {
        setInfoMsg(res.message);
      }
      setProposedPlan(res.plan);
      setPlanStats({
        totalTopics: res.totalTopicsAllocated || 0,
        totalHours: res.totalHoursAllocated || 0,
        daysAnalyzed: res.daysAnalyzed || 0,
      });
    }
  };

  const handleSavePlan = async () => {
    if (!proposedPlan || proposedPlan.length === 0) return;
    setIsSaving(true);
    setErrorMsg(null);

    const res = await saveGeneratedPlanAction(JSON.stringify(proposedPlan));
    setIsSaving(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setSaveSuccessMsg(
        `Successfully scheduled ${res.count} study sessions into your tasks and calendar!`
      );
      setProposedPlan(null);
      setInfoMsg(null);
      router.refresh();
    }
  };

  const handleRemovePlanItem = (index: number) => {
    if (!proposedPlan) return;
    const next = [...proposedPlan];
    next.splice(index, 1);
    setProposedPlan(next);
  };

  return (
    <div className="space-y-6">
      {/* Configuration & Trigger Card */}
      <Card>
        <CardHeader className="border-b border-border/70 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">
                Deterministic Study Planning Engine
              </CardTitle>
              <p className="text-xs text-text-secondary">
                Allocates syllabus topics across your available study days and preferred slot durations.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-5 space-y-4">
          {errorMsg && (
            <Alert variant="error">
              {errorMsg}
            </Alert>
          )}

          {infoMsg && (
            <Alert variant="info">
              {infoMsg}
            </Alert>
          )}

          {saveSuccessMsg && (
            <Alert variant="success">
              {saveSuccessMsg}
            </Alert>
          )}

          <form onSubmit={handleGeneratePlan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Select Target Examination"
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                options={allExams.map((e) => ({ label: e.name, value: e.id }))}
              />

              <Select
                label="Planning Horizon"
                value={planHorizonDays}
                onChange={(e) => setPlanHorizonDays(parseInt(e.target.value, 10))}
                options={[
                  { label: "Next 7 Days (1 Week Sprint)", value: 7 },
                  { label: "Next 14 Days (2 Weeks Target)", value: 14 },
                  { label: "Next 30 Days (1 Month Curriculum)", value: 30 },
                ]}
              />

              <div className="flex items-end">
                <Button
                  type="submit"
                  isLoading={isGenerating}
                  leftIcon={<Sparkles className="h-4 w-4" />}
                  className="w-full h-10"
                >
                  Generate Study Plan
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="includeCompleted"
                type="checkbox"
                checked={includeCompleted}
                onChange={(e) => setIncludeCompleted(e.target.checked)}
                className="h-4 w-4 rounded border-border bg-input text-primary focus:ring-primary/20 cursor-pointer"
              />
              <label htmlFor="includeCompleted" className="text-xs text-text-secondary cursor-pointer select-none">
                Include completed topics for a Spaced Revision plan
              </label>
            </div>
          </form>

          {/* Engine Input Summary Pill */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/60 text-xs text-text-muted">
            <span className="font-semibold text-text-secondary">Active Rules:</span>
            <Badge variant="secondary" size="sm">
              {preferences.daily_study_hours} hrs/day
            </Badge>
            <Badge variant="secondary" size="sm">
              {preferences.preferred_slot_duration_minutes} min slots
            </Badge>
            <Badge variant="secondary" size="sm">
              {preferences.available_days.length} available days/week
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Generated Proposed Plan Review */}
      {proposedPlan && (
        <Card>
          <CardHeader className="border-b border-border/70 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold">Generated Study Itinerary</CardTitle>
              {planStats && (
                <p className="text-xs text-text-secondary mt-1">
                  Allocated <span className="font-semibold text-text-primary">{planStats.totalTopics}</span> topics across{" "}
                  <span className="font-semibold text-text-primary">{planStats.daysAnalyzed}</span> study days (~
                  <span className="font-semibold text-text-primary">{planStats.totalHours}</span> total study hours)
                </p>
              )}
            </div>
            <Button
              onClick={handleSavePlan}
              isLoading={isSaving}
              leftIcon={<Save className="h-4 w-4" />}
              variant="primary"
              size="sm"
            >
              Commit Plan to My Tasks
            </Button>
          </CardHeader>

          <CardContent className="pt-4 p-0">
            {proposedPlan.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-muted">
                No slots could be allocated within the selected horizon and available study days.
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {proposedPlan.map((item, idx) => (
                  <div
                    key={`${item.topicId}-${item.scheduledDate}-${idx}`}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-card-hover transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="default" size="sm">
                          {item.subjectName}
                        </Badge>
                        <span className="text-xs font-semibold text-text-primary">
                          {item.topicTitle}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-text-muted" />
                          {item.scheduledDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-text-muted" />
                          {item.durationMinutes} mins
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePlanItem(idx)}
                      title="Remove this slot"
                      className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition self-end sm:self-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
