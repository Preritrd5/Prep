import React from "react";
import { cn } from "@/lib/utils";
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
} from "lucide-react";

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: "info" | "success" | "warning" | "error";
  title?: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
}

export function Alert({
  variant = "info",
  title,
  icon,
  onClose,
  children,
  className,
  ...props
}: AlertProps) {
  const variantStyles = {
    info: "bg-info-soft border-info-border text-info-text",
    success: "bg-success-soft border-success-border text-success-text",
    warning: "bg-warning-soft border-warning-border text-warning-text",
    error: "bg-error-soft border-error-border text-error-text",
  };

  const defaultIcons = {
    info: <Info className="h-5 w-5 text-info shrink-0" />,
    success: <CheckCircle2 className="h-5 w-5 text-success shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning shrink-0" />,
    error: <XCircle className="h-5 w-5 text-error shrink-0" />,
  };

  return (
    <div
      role="alert"
      className={cn(
        "relative flex w-full gap-3 rounded-xl border p-4 text-sm transition-all",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <div className="mt-0.5">{icon || defaultIcons[variant]}</div>
      <div className="flex-1 space-y-1">
        {title && (
          <h5 className="font-semibold leading-tight tracking-tight">
            {title}
          </h5>
        )}
        {children && <div className="text-xs sm:text-sm leading-relaxed opacity-95">{children}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 opacity-70 hover:opacity-100 transition"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("mb-1 font-semibold leading-tight tracking-tight", className)}
      {...props}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn("text-xs sm:text-sm leading-relaxed opacity-90", className)}
      {...props}
    />
  );
}
