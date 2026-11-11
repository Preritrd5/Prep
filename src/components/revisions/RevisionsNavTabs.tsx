"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RotateCcw, AlertCircle, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

const revisionTabs = [
  {
    name: "Spaced Revisions",
    href: "/revisions",
    legacyHref: "/student/revisions",
    icon: RotateCcw,
  },
  {
    name: "Mistake Notebook",
    href: "/practice/incorrect",
    legacyHref: "/student/practice/incorrect",
    icon: AlertCircle,
  },
  {
    name: "Saved Bookmarks",
    href: "/practice/bookmarks",
    legacyHref: "/student/practice/bookmarks",
    icon: Bookmark,
  },
];

export default function RevisionsNavTabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border text-xs scrollbar-none mb-6">
      {revisionTabs.map((tab) => {
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
