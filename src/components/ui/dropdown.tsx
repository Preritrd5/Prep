"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  destructive?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items?: DropdownItem[];
  children?: React.ReactNode;
  align?: "left" | "right";
  className?: string;
  menuClassName?: string;
}

export function Dropdown({
  trigger,
  items,
  children,
  align = "right",
  className,
  menuClassName,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={cn("relative inline-block text-left", className)}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className="cursor-pointer"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={cn(
            "absolute z-50 mt-2 min-w-[180px] rounded-xl border border-border bg-card p-1.5 shadow-lg ring-1 ring-black/5 focus:outline-none animate-in fade-in zoom-in-95 duration-100",
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left",
            menuClassName
          )}
        >
          {items ? (
            items.map((item, index) => {
              if (item.divider) {
                return (
                  <div
                    key={`div-${index}`}
                    className="my-1 border-t border-border"
                  />
                );
              }

              const itemContent = (
                <>
                  {item.icon && (
                    <span className="shrink-0 text-text-muted">
                      {item.icon}
                    </span>
                  )}
                  <span className="truncate">{item.label}</span>
                </>
              );

              const itemClasses = cn(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
                item.disabled
                  ? "opacity-50 cursor-not-allowed"
                  : item.destructive
                  ? "text-error hover:bg-error-soft active:bg-error/10"
                  : "text-text-primary hover:bg-background-secondary active:bg-background-secondary/80"
              );

              if (item.href && !item.disabled) {
                return (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={itemClasses}
                    role="menuitem"
                  >
                    {itemContent}
                  </Link>
                );
              }

              return (
                <button
                  key={index}
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  className={itemClasses}
                  role="menuitem"
                >
                  {itemContent}
                </button>
              );
            })
          ) : (
            <div onClick={() => setIsOpen(false)}>{children}</div>
          )}
        </div>
      )}
    </div>
  );
}
