import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "outline"
    | "success"
    | "warning"
    | "destructive"
    | "danger"
    | "error"
    | "info"
    | "accent"
    | "neutral";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  pulse?: boolean;
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  dot = false,
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  let normalizedVariant = variant;
  if (variant === "danger" || variant === "error") {
    normalizedVariant = "destructive";
  } else if (variant === "neutral") {
    normalizedVariant = "secondary";
  }

  const variantStyles = {
    default:
      "border border-primary/25 bg-[var(--color-primary-subtle)] text-primary",
    primary:
      "border border-primary/25 bg-[var(--color-primary-subtle)] text-primary",
    secondary:
      "border border-border bg-surface text-text-secondary",
    outline:
      "border border-border text-text-primary bg-card",
    success:
      "border border-[var(--color-success-border)] bg-[var(--color-success-subtle)] text-[var(--color-success-text)]",
    warning:
      "border border-[var(--color-warning-border)] bg-[var(--color-warning-subtle)] text-[var(--color-warning-text)]",
    destructive:
      "border border-[var(--color-danger-border)] bg-[var(--color-danger-subtle)] text-[var(--color-danger-text)]",
    info:
      "border border-[var(--color-info-border)] bg-[var(--color-info-subtle)] text-[var(--color-info-text)]",
    accent:
      "border border-accent/25 bg-[var(--color-secondary-subtle)] text-accent",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-xs",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center font-mono font-semibold rounded-full tracking-wide transition-colors shrink-0",
        variantStyles[normalizedVariant as keyof typeof variantStyles] || variantStyles.default,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full mr-1.5 bg-current",
            pulse && "animate-pulse"
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}

export default Badge;
