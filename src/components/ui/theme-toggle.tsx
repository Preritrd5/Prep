"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { useTheme, type Theme } from "./theme-provider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    {
      value: "light",
      label: "Light",
      icon: <Sun className="h-4 w-4 text-amber-500" />,
    },
    {
      value: "dark",
      label: "Dark",
      icon: <Moon className="h-4 w-4 text-primary" />,
    },
    {
      value: "system",
      label: "System",
      icon: <Laptop className="h-4 w-4 text-text-secondary" />,
    },
  ];

  return (
    <div className={cn("relative inline-block text-left", className)} ref={menuRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border bg-card text-sm font-medium text-text-primary shadow-xs transition hover:bg-hover-surface focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer",
          showLabel && "w-auto px-3 gap-2"
        )}
        aria-label={mounted ? `Select theme color scheme, current is ${theme}` : "Select theme color scheme"}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {!mounted ? (
          <span className="h-4 w-4 inline-block" aria-hidden="true" />
        ) : resolvedTheme === "dark" ? (
          <Moon className="h-4 w-4 text-primary transition-transform duration-200" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500 transition-transform duration-200" />
        )}
        {showLabel && (
          <span className="capitalize text-xs font-semibold">{mounted ? theme : "Theme"}</span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Color theme options"
          aria-orientation="vertical"
          className="absolute right-0 z-50 mt-2 w-36 origin-top-right rounded-xl border border-border bg-card p-1 shadow-lg focus:outline-none animate-in fade-in zoom-in-95 duration-100"
        >
          {themeOptions.map((opt) => {
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitem"
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                  buttonRef.current?.focus();
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer",
                  isSelected
                    ? "bg-[var(--color-primary-subtle)] text-primary font-semibold"
                    : "text-text-primary hover:bg-hover-surface"
                )}
              >
                <div className="flex items-center gap-2">
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ThemeToggle;
