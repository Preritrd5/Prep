"use client";

import { useState } from "react";
import {
  Sparkles,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Layers,
  Save,
  Check,
} from "lucide-react";
import {
  generateStudyPlanAction,
  saveGeneratedPlanAction,
  type GeneratedPlanItem,
} from "@/app/actions/planner";
import type { Exam, StudentExam, StudyPreferences } from "@/lib/types";

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
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Deterministic Study Planning Engine
            </h2>
            <p className="text-xs text-slate-500">
              Allocates pending syllabus topics across your available study days and preferred slot durations.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {saveSuccessMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleGeneratePlan} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Target Examination
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            >
              {allExams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Planning Horizon
            </label>
            <select
              value={planHorizonDays}
              onChange={(e) => setPlanHorizonDays(parseInt(e.target.value, 10))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            >
              <option value={7}>Next 7 Days (1 Week Sprint)</option>
              <option value={14}>Next 14 Days (2 Weeks Target)</option>
              <option value={30}>Next 30 Days (1 Month Curriculum)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full rounded-xl bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Analyzing Syllabus..." : "Generate Study Plan"}
            </button>
          </div>
        </form>

        {/* Engine Input Summary Pill */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>Active Rules:</span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700 font-medium">
            {preferences.daily_study_hours} hrs/day
          </span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700 font-medium">
            {preferences.preferred_slot_duration_minutes} min slots
          </span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700 font-medium">
            {preferences.available_days.length} available days/week
          </span>
        </div>
      </div>

      {/* Generated Proposed Plan Review */}
      {proposedPlan && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Proposed Study Schedule ({proposedPlan.length} sessions)
              </h3>
              {planStats && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Allocated ~{planStats.totalHours} total study hours over {planStats.daysAnalyzed}{" "}
                  days. Review and remove any slots before saving.
                </p>
              )}
            </div>

            <button
              onClick={handleSavePlan}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving Plan..." : "Accept & Schedule Plan"}
            </button>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {proposedPlan.map((item, idx) => (
              <div
                key={`${item.topicId}-${item.scheduledDate}-${idx}`}
                className="p-3.5 hover:bg-slate-50/70 transition flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>

                  <div>
                    <span className="font-bold text-slate-900 block">{item.topicTitle}</span>
                    <span className="text-slate-500 text-[11px]">
                      {item.subjectName} • {item.examName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {item.scheduledDate}
                  </span>

                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {item.durationMinutes}m
                  </span>

                  <button
                    onClick={() => handleRemovePlanItem(idx)}
                    className="text-slate-400 hover:text-red-600 text-xs font-semibold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
