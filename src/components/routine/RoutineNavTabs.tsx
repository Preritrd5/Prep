"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, CheckSquare, CalendarDays, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const routineTabs = [
  {
    name: "Daily Routine & Slots",
    href: "/routine",
    legacyHref: "/student/routine",
    icon: Clock,
  },
  {
    name: "Study Tasks",
    href: "/tasks",
    legacyHref: "/student/tasks",
    icon: CheckSquare,
  },
  {
    name: "Study Planner",
    href: "/study-planner",
    legacyHref: "/student/planner",
    icon: CalendarDays,
  },
  {
    name: "Calendar & Exam Dates",
    href: "/calendar",
    legacyHref: "/student/calendar",
    icon: Calendar,
  },
];

export default function RoutineNavTabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border text-xs scrollbar-none mb-6">
      {routineTabs.map((tab) => {
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
