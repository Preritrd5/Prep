import React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "outline"
    | "ghost"
    | "destructive"
    | "danger"
    | "success"
    | "gradient";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      icon,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const effectiveLeftIcon = leftIcon || icon;
    const normalizedVariant = variant === "danger" ? "destructive" : variant;

    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-primary text-white hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)] shadow-xs hover:shadow-sm",
      secondary:
        "bg-surface text-text-primary hover:bg-hover-surface active:bg-border/60 border border-border shadow-xs",
      accent:
        "bg-accent text-white hover:bg-[var(--color-secondary-hover)] active:bg-[var(--color-secondary-active)] shadow-xs",
      gradient:
        "bg-primary-gradient text-white hover:opacity-95 active:opacity-90 shadow-xs",
      outline:
        "border border-border bg-card text-text-primary hover:bg-[var(--color-primary-subtle)] hover:border-primary active:bg-[var(--color-primary-subtle)]",
      ghost:
        "bg-transparent text-text-primary hover:bg-[var(--color-primary-subtle)] hover:text-primary active:bg-[var(--color-primary-subtle)]",
      destructive:
        "bg-error text-white hover:opacity-90 active:opacity-80 shadow-xs",
      success:
        "bg-success text-white hover:opacity-90 active:opacity-80 shadow-xs",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-10 px-4 text-sm rounded-lg gap-2",
      lg: "h-11 px-6 text-base rounded-lg gap-2.5",
      icon: "h-10 w-10 rounded-lg justify-center p-0",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[normalizedVariant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Spinner
            size="sm"
            color={
              normalizedVariant === "outline" || normalizedVariant === "ghost" || normalizedVariant === "secondary"
                ? "primary"
                : "white"
            }
            label="Processing..."
            className="shrink-0"
          />
        ) : (
          effectiveLeftIcon && <span className="shrink-0">{effectiveLeftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
