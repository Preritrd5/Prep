"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Spinner, SpinnerSize, SpinnerColor } from "./Spinner";

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = "md",
  color = "primary",
  className,
  label,
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Spinner size={size} color={color} className={className} label={label || "Loading..."} />
      {label && (
        <p className="text-xs font-medium text-text-secondary">{label}</p>
      )}
    </div>
  );
}

export default LoadingSpinner;
