import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      children,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const helperId = selectId ? `${selectId}-helper` : undefined;
    const errorId = selectId ? `${selectId}-error` : undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-text-primary"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              "w-full h-10 appearance-none rounded-lg border border-border bg-input px-3.5 py-2 pr-10 text-sm text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:bg-background-secondary disabled:opacity-60 cursor-pointer",
              error && "border-error focus:border-error focus:ring-error/25",
              className
            )}
            style={{ colorScheme: "dark" }}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option
                    key={String(opt.value)}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="bg-[#0e1726] text-white"
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="pointer-events-none absolute right-3 flex items-center text-text-muted">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error ? (
          <p id={errorId} className="text-xs font-medium text-error" role="alert">{error}</p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
