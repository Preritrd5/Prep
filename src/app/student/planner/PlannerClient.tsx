"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Calendar,
  Clock,
  Save,
  Check,
  Trash2,
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
  const [selectedExamId, setSelectedExamId] = useState<string>(
    enrolledExams[0]?.exam_id || allExams[0]?.id || ""
  );
  const [planHorizonDays, setPlanHorizonDays] = useState<number>(14);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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
    setSaveSuccessMsg(null);

    const formData = new FormData();
    formData.append("examId", selectedExamId);
    formData.append("planHorizonDays", planHorizonDays.toString());
    if (activeEnrolled?.target_date) {
      formData.append("targetDate", activeEnrolled.target_date);
    }

    const res = await generateStudyPlanAction(formData);
    setIsGenerating(false);

    if (!res.success || res.error) {
      setErrorMsg(res.error || "Failed to generate plan.");
    } else if (res.plan) {
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
                Allocates pending syllabus topics across your available study days and preferred slot durations.
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

          {saveSuccessMsg && (
            <Alert variant="success">
              {saveSuccessMsg}
            </Alert>
          )}

          <form onSubmit={handleGeneratePlan} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <CardTitle className="text-base font-bold">
                Proposed Study Schedule ({proposedPlan.length} sessions)
              </CardTitle>
              {planStats && (
                <p className="text-xs text-text-secondary mt-0.5">
                  Allocated ~{planStats.totalHours} total study hours over {planStats.daysAnalyzed}{" "}
                  days. Review and remove any slots before saving.
                </p>
              )}
            </div>

            <Button
              onClick={handleSavePlan}
              isLoading={isSaving}
              variant="success"
              leftIcon={<Save className="h-4 w-4" />}
              size="sm"
            >
              Accept & Schedule Plan
            </Button>
          </CardHeader>

          <CardContent className="pt-4 p-0">
            <div className="divide-y divide-border/60">
              {proposedPlan.map((item, idx) => (
                <div
                  key={`${item.topicId}-${item.scheduledDate}-${idx}`}
                  className="p-4 hover:bg-background-secondary/50 transition flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-full bg-primary-soft text-primary font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>

                    <div>
                      <span className="font-bold text-text-primary block">
                        {item.topicTitle}
                      </span>
                      <span className="text-text-muted text-[11px]">
                        {item.subjectName} • {item.examName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 font-semibold text-text-primary">
                      <Calendar className="h-3.5 w-3.5 text-text-muted" />
                      {item.scheduledDate}
                    </span>

                    <span className="flex items-center gap-1 text-text-muted">
                      <Clock className="h-3.5 w-3.5" />
                      {item.durationMinutes}m
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemovePlanItem(idx)}
                      className="text-text-muted hover:text-error transition p-1"
                      title="Remove from plan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
