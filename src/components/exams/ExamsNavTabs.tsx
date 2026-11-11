"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Play, BookOpen, Award, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const examTabs = [
  {
    name: "Online Mock Tests",
    href: "/online-exams",
    legacyHref: "/student/exams/online",
    icon: Play,
  },
  {
    name: "Create Examination",
    href: "/online-exams/create",
    legacyHref: "/student/exams/create",
    icon: PlusCircle,
  },
  {
    name: "Target Examinations",
    href: "/examinations",
    legacyHref: "/student/exams",
    icon: BookOpen,
  },
  {
    name: "My Attempts & Results",
    href: "/attempts",
    legacyHref: "/student/exams/online/history",
    icon: Award,
  },
];

export default function ExamsNavTabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border text-xs scrollbar-none mb-6">
      {examTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          pathname === tab.href ||
          pathname === tab.legacyHref ||
          (tab.href === "/online-exams" && pathname.startsWith("/online-exams") && pathname !== "/online-exams/create");

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
