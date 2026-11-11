"use client";

import { Card, Badge, Button, Alert, StatCard, EmptyState } from "@/components/ui";
import { useState, useTransition } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Copy,
  Clock,
  Search,
  Award,
} from "lucide-react";
import type { ExamTemplate, ExamTemplateStatus } from "@/lib/types";
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
        window.location.reload();
      }
    });
  };

  const totalExams = templates.length;
  const publishedCount = templates.filter((t) => t.status === "Published").length;
  const draftCount = templates.filter((t) => t.status === "Draft").length;

  return (
    <div className="space-y-6">
      {/* Top Banner Actions & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Mock Test Templates</h2>
          <p className="text-xs text-text-muted">
            Manage public mock exams, timed assessments, and section configurations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/exams/create">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs">
              <Plus className="w-4 h-4" /> Create Examination
            </Button>
          </Link>
          <Link href="/admin/exams/monitor">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Clock className="w-4 h-4" /> Monitor Attempts
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard title="Total Tests" value={totalExams} icon={BookOpen} />
        <StatCard title="Published & Active" value={publishedCount} icon={BookOpen} />
        <StatCard title="Drafts & Staging" value={draftCount} icon={Clock} />
      </div>

      {msg && (
        <Alert
          variant={msg.type === "success" ? "success" : "error"}
          title={msg.text}
          onClose={() => setMsg(null)}
        />
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search examinations by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-xl text-xs bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-border rounded-xl px-3 py-2 text-xs bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
            className="border border-border rounded-xl px-3 py-2 text-xs bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </Card>

      {/* Exam Cards Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No examinations found"
          description="Try adjusting your filters or create a new examination."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((t) => (
            <Card
              key={t.id}
              className="p-5 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="primary">
                    {t.exam_category}
                  </Badge>

                  <select
                    value={t.status}
                    onChange={(e) => handleToggleStatus(t.id, e.target.value as ExamTemplateStatus)}
                    disabled={isPending}
                    className="text-xs font-semibold px-2.5 py-1 rounded-xl border border-border bg-card text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <h2 className="text-base font-bold text-text-primary leading-snug">{t.title}</h2>
                <p className="text-xs text-text-muted line-clamp-2">{t.description}</p>

                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-text-muted" /> {t.duration_minutes} Mins
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-text-muted" /> {t.total_questions} Questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-text-muted" /> {t.total_marks} Marks
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(t.id)}
                    disabled={isPending}
                    className="gap-1 text-xs"
                    title="Clone this test template"
                  >
                    <Copy className="w-3 h-3" /> Duplicate
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/student/exams/online/${t.id}/instructions`}
                    className="text-primary font-semibold hover:underline"
                  >
                    Preview Student View →
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
