import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  accentColor?: "primary" | "secondary" | "accent" | "success" | "warning" | "error" | string;
  trend?: {
    value: string | number;
    label?: string;
    positive?: boolean;
  };
  description?: string;
  className?: string;
  iconBgColor?: string;
}

export function StatCard({
  title,
  value,
  icon,
  accentColor = "primary",
  trend,
  description,
  className,
  iconBgColor,
}: StatCardProps) {
  const accentStyles: Record<string, string> = {
    primary: "bg-[var(--color-primary-subtle)] text-primary border border-primary/20",
    secondary: "bg-surface text-text-secondary border border-border",
    accent: "bg-[var(--color-secondary-subtle)] text-accent border border-accent/20",
    success: "bg-[var(--color-success-subtle)] text-[var(--color-success-text)] border border-[var(--color-success-border)]",
    warning: "bg-[var(--color-warning-subtle)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)]",
    error: "bg-[var(--color-danger-subtle)] text-[var(--color-danger-text)] border border-[var(--color-danger-border)]",
  };

  const resolvedIconClass =
    iconBgColor || (accentColor && accentStyles[accentColor]) || accentStyles.primary;

  let renderedIcon: React.ReactNode = null;
  if (React.isValidElement(icon)) {
    renderedIcon = icon;
  } else if (
    typeof icon === "function" ||
    (typeof icon === "object" && icon !== null)
  ) {
    try {
      renderedIcon = React.createElement(icon as any, { className: "h-5 w-5" });
    } catch {
      renderedIcon = null;
    }
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-text-secondary truncate">
          {title}
        </p>
        {renderedIcon && (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
              resolvedIconClass
            )}
          >
            {renderedIcon}
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded-full",
              trend.positive
                ? "bg-[var(--color-success-subtle)] text-[var(--color-success-text)]"
                : "bg-[var(--color-danger-subtle)] text-[var(--color-danger-text)]"
            )}
          >
            {trend.positive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend.value}
          </span>
        )}
      </div>

      {(description || trend?.label) && (
        <p className="mt-1.5 text-xs text-text-muted leading-relaxed">
          {description || trend?.label}
        </p>
      )}
    </div>
  );
}

export default StatCard;
