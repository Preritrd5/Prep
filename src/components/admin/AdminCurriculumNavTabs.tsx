"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const curriculumTabs = [
  {
    name: "Syllabus & Topics Hierarchy",
    href: "/admin/syllabus",
    icon: Layers,
  },
  {
    name: "Subject Directory",
    href: "/admin/subjects",
    icon: BookOpen,
  },
];

export default function AdminCurriculumNavTabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border text-xs scrollbar-none mb-6">
      {curriculumTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

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
