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
    <div className="min-h-screen bg-background text-text-primary flex flex-col transition-colors">
      {/* Global Application Topbar */}
      <Navbar profile={profile} />

      {/* Main Shell Container */}
      <div className="flex-1 flex w-full">
        {/* Responsive Collapsible Sidebar */}
        <Sidebar role={profile.role} />

        {/* Viewport Content Area */}
        <main
          id="main-content"
          className={cn(
            "flex-1 w-full overflow-x-hidden min-h-[calc(100vh-4rem)] flex flex-col",
            !noPadding && "px-4 sm:px-6 lg:px-8 py-6 sm:py-8",
            className
          )}
        >
          <div
            className={cn(
              "w-full mx-auto flex-1 flex flex-col space-y-6 sm:space-y-8",
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
