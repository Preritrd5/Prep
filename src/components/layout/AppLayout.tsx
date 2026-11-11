"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface AppLayoutProps {
  profile: Profile;
  children: React.ReactNode;
  maxWidth?: "5xl" | "6xl" | "7xl" | "full";
  className?: string;
  noPadding?: boolean;
}

export function AppLayout({
  profile,
  children,
  maxWidth = "7xl",
  className,
  noPadding = false,
}: AppLayoutProps) {
  const maxWidthClasses = {
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-background text-text-primary flex flex-col transition-colors">
      {/* Global Application Topbar (Fixed Height: 4rem / 64px) */}
      <Navbar profile={profile} />

      {/* Main Shell Container (Exact viewport minus topbar) */}
      <div className="flex-1 flex w-full min-w-0 h-[calc(100vh-4rem)] overflow-hidden">
        {/* Responsive Collapsible Sidebar (Independent Scroll Section) */}
        <Sidebar />

        {/* Viewport Content Area (Independent Scroll Section with Vertical Scrollbar) */}
        <main
          id="main-content"
          tabIndex={-1}
          className={cn(
            "flex-1 w-full min-w-0 h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden flex flex-col focus:outline-none scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
            !noPadding && "px-3 sm:px-5 md:px-6 lg:px-8 py-5 sm:py-6 lg:py-8",
            className
          )}
        >
          <div
            className={cn(
              "w-full min-w-0 mx-auto flex-1 flex flex-col space-y-5 sm:space-y-6 lg:space-y-8",
              maxWidthClasses[maxWidth]
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
