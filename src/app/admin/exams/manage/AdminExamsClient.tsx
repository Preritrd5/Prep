"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Copy,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Filter,
  Search,
  Layers,
  Award,
  Calendar,
  Share2,
} from "lucide-react";
import type { ExamTemplate, ExamTemplateStatus, ExamCategory } from "@/lib/types";
import {
  adminToggleExamStatusAction,
  adminDuplicateExamTemplateAction,
} from "@/app/actions/exams-online";

interface AdminExamsClientProps {
  templates: ExamTemplate[];
}

export default function AdminExamsClient({ templates: initialTemplates }: AdminExamsClientProps) {
  const [templates, setTemplates] = useState<ExamTemplate[]>(initialTemplates);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filtered = templates.filter((t) => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory !== "All" && t.exam_category !== selectedCategory) return false;
    if (selectedStatus !== "All" && t.status !== selectedStatus) return false;
    return true;
  });

  const handleToggleStatus = (templateId: string, newStatus: ExamTemplateStatus) => {
    startTransition(async () => {
      const res = await adminToggleExamStatusAction(templateId, newStatus);
      if (res.error) {
        setMsg({ type: "error", text: res.error });
      } else {
        setTemplates((prev) =>
          prev.map((t) => (t.id === templateId ? { ...t, status: newStatus } : t))
        );
        setMsg({ type: "success", text: `Exam status changed to ${newStatus}.` });
      }
    });
  };

  const handleDuplicate = (templateId: string) => {
    startTransition(async () => {
      const res = await adminDuplicateExamTemplateAction(templateId);
      if (res.error) {
        setMsg({ type: "error", text: res.error });
      } else {
        setMsg({ type: "success", text: "Examination cloned as draft successfully!" });
        // Refresh local view
        window.location.reload();
      }
    });
  };

  const totalExams = templates.length;
  const publishedCount = templates.filter((t) => t.status === "Published").length;
  const draftCount = templates.filter((t) => t.status === "Draft").length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Online Examination Management</h1>
            <p className="text-sm text-slate-600 mt-1">
              Author, schedule, and configure full-length mock tests, sectional papers, and chapter assessments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/exams/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Create Examination
            </Link>
            <Link
              href="/admin/exams/monitor"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium text-sm hover:bg-slate-50 transition"
            >
              <Clock className="w-4 h-4 text-slate-500" /> Monitor Attempts
            </Link>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Tests</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totalExams}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-700 uppercase">Published & Active</p>
            <p className="text-2xl font-bold text-emerald-800 mt-1">{publishedCount}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
            <p className="text-xs font-semibold text-amber-700 uppercase">Drafts & Staging</p>
            <p className="text-2xl font-bold text-amber-800 mt-1">{draftCount}</p>
          </div>
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm ${
            msg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search examinations by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="UPSC">UPSC</option>
            <option value="KAS">KAS</option>
            <option value="GATE">GATE</option>
            <option value="Railway Examinations">Railway</option>
            <option value="KEA Examinations">KEA</option>
            <option value="AE Civil Engineering">AE Civil</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                  {t.exam_category}
                </span>

                <select
                  value={t.status}
                  onChange={(e) => handleToggleStatus(t.id, e.target.value as ExamTemplateStatus)}
                  disabled={isPending}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none ${
                    t.status === "Published"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : t.status === "Draft"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <h2 className="text-base font-bold text-slate-900 leading-snug">{t.title}</h2>
              <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {t.duration_minutes} Mins
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" /> {t.total_questions} Questions
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-slate-400" /> {t.total_marks} Marks
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDuplicate(t.id)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  title="Clone this test template"
                >
                  <Copy className="w-3 h-3" /> Duplicate
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/student/exams/online/${t.id}/instructions`}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Preview Student View →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
