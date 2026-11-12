"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Spinner, SpinnerSize, SpinnerColor } from "./Spinner";
import { GraduationCap } from "lucide-react";

export type LoadingVariant =
  | "full-page"
  | "section"
  | "modal"
  | "initial"
  | "refresh"
  | "inline";

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: LoadingVariant;
  size?: SpinnerSize;
  color?: SpinnerColor;
  message?: string;
  submessage?: string;
  className?: string;
}

export function LoadingState({
  variant = "section",
  size,
  color = "primary",
  message,
  submessage,
  className,
  ...props
}: LoadingStateProps) {
  // Variant A: FULL PAGE LOADING
  if (variant === "full-page") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "w-full min-h-[50vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-200",
          className
        )}
        {...props}
      >
        <Spinner size={size || "xl"} color={color} label={message || "Loading page content..."} />
        {message && (
          <p className="mt-4 text-sm font-semibold text-text-primary tracking-tight">
            {message}
          </p>
        )}
        {submessage && (
          <p className="mt-1 text-xs text-text-secondary max-w-sm">
            {submessage}
          </p>
        )}
      </div>
    );
  }

  // Variant E: INITIAL APPLICATION LOADING
  if (variant === "initial") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-4 text-center animate-in fade-in duration-300",
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center max-w-xs space-y-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-xs">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary">
              Prep<span className="text-primary">Track</span>
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Personal Examination Workspace
            </p>
          </div>
          <div className="pt-2">
            <Spinner size={size || "lg"} color={color} label={message || "Initializing application..."} />
          </div>
          {message && (
            <p className="text-xs font-medium text-text-secondary">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Variant D: MODAL LOADING
  if (variant === "modal") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "w-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center",
          className
        )}
        {...props}
      >
        <Spinner size={size || "lg"} color={color} label={message || "Processing..."} />
        {message && (
          <p className="mt-3 text-sm font-medium text-text-primary">
            {message}
          </p>
        )}
        {submessage && (
          <p className="mt-1 text-xs text-text-secondary">
            {submessage}
          </p>
        )}
      </div>
    );
  }

  // Variant F: DATA REFRESH / INLINE LOADING
  if (variant === "refresh" || variant === "inline") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "inline-flex items-center gap-2 text-text-secondary text-xs font-medium py-1 px-2",
          className
        )}
        {...props}
      >
        <Spinner size={size || "sm"} color={color} label={message || "Refreshing..."} />
        {message && <span>{message}</span>}
      </div>
    );
  }

  // Variant B: SECTION LOADING (Default)
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "w-full min-h-[200px] flex flex-col items-center justify-center p-6 text-center",
        className
      )}
      {...props}
    >
      <Spinner size={size || "md"} color={color} label={message || "Loading section..."} />
      {message && (
        <p className="mt-3 text-xs font-medium text-text-secondary">
          {message}
        </p>
      )}
      {submessage && (
        <p className="mt-1 text-[11px] text-text-muted">
          {submessage}
        </p>
      )}
    </div>
  );
}

// Convenience wrapper components matching requirements
export function PageLoading({
  message = "Loading...",
  submessage,
  className,
}: {
  message?: string;
  submessage?: string;
  className?: string;
}) {
  return (
    <LoadingState
      variant="full-page"
      message={message}
      submessage={submessage}
      className={className}
    />
  );
}

export function SectionLoading({
  message,
  submessage,
  className,
}: {
  message?: string;
  submessage?: string;
  className?: string;
}) {
  return (
    <LoadingState
      variant="section"
      message={message}
      submessage={submessage}
      className={className}
    />
  );
}

export function ModalLoading({
  message = "Processing request...",
  submessage,
  className,
}: {
  message?: string;
  submessage?: string;
  className?: string;
}) {
  return (
    <LoadingState
      variant="modal"
      message={message}
      submessage={submessage}
      className={className}
    />
  );
}

export function InitialAppLoading({
  message = "Loading your workspace...",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <LoadingState
      variant="initial"
      message={message}
      className={className}
    />
  );
}

export function DataRefreshLoading({
  label = "Syncing...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <LoadingState
      variant="refresh"
      message={label}
      className={className}
    />
  );
}

export default LoadingState;
