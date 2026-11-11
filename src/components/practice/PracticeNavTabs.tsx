"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, Layers, Award, FileQuestion, Bookmark, History } from "lucide-react";
import { cn } from "@/lib/utils";

const practiceTabs = [
  {
    name: "Topic Practice",
    href: "/practice/topic",
    legacyHref: "/student/practice/topic",
    icon: CheckSquare,
  },
  {
    name: "Subject Practice",
    href: "/practice/subject",
    legacyHref: "/student/practice/subject",
    icon: Layers,
  },
  {
    name: "Exam Practice",
    href: "/practice/exam",
    legacyHref: "/student/practice/exam",
    icon: Award,
  },
  {
    name: "PYQ Archive",
    href: "/practice/pyq",
    legacyHref: "/student/practice/pyq",
    icon: FileQuestion,
  },
  {
    name: "Bookmarks & Incorrect",
    href: "/practice/bookmarks",
    legacyHref: "/student/practice/bookmarks",
    icon: Bookmark,
  },
  {
    name: "Practice History",
    href: "/practice/history",
    legacyHref: "/student/practice/history",
    icon: History,
  },
];

export default function PracticeNavTabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border text-xs scrollbar-none mb-6">
      {practiceTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          pathname === tab.href ||
          pathname === tab.legacyHref ||
          (tab.href === "/practice/bookmarks" && (pathname === "/practice/incorrect" || pathname === "/student/practice/incorrect"));

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
