"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, PlusCircle, UploadCloud, Sparkles, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const questionTabs = [
  {
    name: "All Questions",
    href: "/question-bank",
    legacyHref: "/student/questions",
    icon: Database,
  },
  {
    name: "Add Question",
    href: "/question-bank/create",
    legacyHref: "/student/questions/create",
    icon: PlusCircle,
  },
  {
    name: "Bulk Import Wizard",
    href: "/question-import",
    legacyHref: "/student/questions/import",
    icon: UploadCloud,
  },
  {
    name: "AI Question Generator",
    href: "/question-bank/ai",
    legacyHref: "/student/questions/ai",
    icon: Sparkles,
  },
  {
    name: "Create Examination",
    href: "/online-exams/create",
    legacyHref: "/student/exams/create",
    icon: FileText,
  },
];

export default function QuestionBankNavTabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border text-xs scrollbar-none mb-6">
      {questionTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href || pathname === tab.legacyHref;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all shrink-0 select-none",
              isActive
                ? "bg-primary text-white shadow-xs font-semibold"
                : "text-text-secondary hover:text-text-primary hover:bg-hover-surface border border-transparent"
            )}
          >
            <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-text-muted")} />
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
