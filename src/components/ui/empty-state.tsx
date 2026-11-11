import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";
import { Button } from "./button";

export interface EmptyStateActionObject {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: any;
}

export interface EmptyStateProps {
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode | EmptyStateActionObject;
  actions?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  actions,
  className,
}: EmptyStateProps) {
  let renderedIcon: React.ReactNode = null;

  if (React.isValidElement(icon)) {
    renderedIcon = icon;
  } else if (
    typeof icon === "function" ||
    (typeof icon === "object" && icon !== null)
  ) {
    try {
      renderedIcon = React.createElement(icon as any, { className: "h-6 w-6" });
    } catch {
      renderedIcon = <Inbox className="h-6 w-6" />;
    }
  } else {
    renderedIcon = <Inbox className="h-6 w-6" />;
  }

  let renderedAction: React.ReactNode = null;
  if (actions) {
    renderedAction = actions;
  } else if (action) {
    if (React.isValidElement(action)) {
      renderedAction = action;
    } else if (typeof action === "object" && "label" in action) {
      const act = action as EmptyStateActionObject;
      if (act.href) {
        renderedAction = (
          <Link href={act.href}>
            <Button variant={act.variant || "primary"} size="sm">
              {act.label}
            </Button>
          </Link>
        );
      } else {
        renderedAction = (
          <Button variant={act.variant || "primary"} size="sm" onClick={act.onClick}>
            {act.label}
          </Button>
        );
      }
    } else {
      renderedAction = action as React.ReactNode;
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center sm:p-12 shadow-xs",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary-subtle)] text-primary border border-primary/20 shadow-xs">
        {renderedIcon}
      </div>
      <h3 className="font-heading mt-4 text-base sm:text-lg font-bold text-text-primary tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-text-secondary leading-relaxed">
          {description}
        </p>
      )}
      {renderedAction && <div className="mt-5">{renderedAction}</div>}
    </div>
  );
}

export default EmptyState;
