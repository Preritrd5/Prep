"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type SpinnerSize = "sm" | "md" | "lg" | "xl";
export type SpinnerColor = "primary" | "white" | "current" | "muted";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  color?: SpinnerColor;
  label?: string;
  className?: string;
}

const sizeMap: Record<SpinnerSize, { container: string; border: string }> = {
  sm: { container: "w-4 h-4", border: "border-2" },
  md: { container: "w-6 h-6", border: "border-[2.5px]" },
  lg: { container: "w-9 h-9", border: "border-[3px]" },
  xl: { container: "w-12 h-12", border: "border-4" },
};

const colorMap: Record<SpinnerColor, { track: string; head: string }> = {
  primary: {
    track: "border-primary/20 dark:border-primary/30",
    head: "border-t-primary dark:border-t-primary",
  },
  white: {
    track: "border-white/25",
    head: "border-t-white",
  },
  current: {
    track: "border-current/20",
    head: "border-t-current",
  },
  muted: {
    track: "border-border/40 dark:border-border/60",
    head: "border-t-text-secondary dark:border-t-text-secondary",
  },
};

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      size = "md",
      color = "primary",
      label = "Loading...",
      className,
      ...props
    },
    ref
  ) => {
    const sizeConfig = sizeMap[size] || sizeMap.md;
    const colorConfig = colorMap[color] || colorMap.primary;

    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        aria-live="polite"
        className={cn(
          "inline-block rounded-full animate-spin shrink-0",
          "motion-reduce:animate-[spin_1.5s_linear_infinite]",
          sizeConfig.container,
          sizeConfig.border,
          colorConfig.track,
          colorConfig.head,
          className
        )}
        {...props}
      >
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = "Spinner";

export default Spinner;
