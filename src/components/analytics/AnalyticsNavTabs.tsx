"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bookmark, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const analyticsTabs = [
  {
    name: "Performance Analytics",
    href: "/analytics",
    legacyHref: "/student/analytics",
    icon: BarChart3,
  },
  {
    name: "Study Reports",
    href: "/reports",
    legacyHref: "/student/reports",
    icon: FileText,
  },
  {
    name: "Bookmarks & Mistakes",
    href: "/practice/bookmarks",
    legacyHref: "/student/practice/bookmarks",
    icon: Bookmark,
  },
];

export default function AnalyticsNavTabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border text-xs scrollbar-none mb-6">
      {analyticsTabs.map((tab) => {
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
