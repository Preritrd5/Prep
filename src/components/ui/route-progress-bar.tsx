"use client";

import React, { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Global event bus for triggering progress imperatively
type ProgressListener = (state: boolean) => void;
const listeners = new Set<ProgressListener>();

export function startRouteProgress() {
  listeners.forEach((fn) => fn(true));
}

export function stopRouteProgress() {
  listeners.forEach((fn) => fn(false));
}

export default function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Complete and hide on route or search param change
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Subscribe to imperative triggers
  useEffect(() => {
    const handleState = (active: boolean) => {
      if (active) {
        setLoading(true);
        setProgress(15);
      } else {
        setProgress(100);
        setTimeout(() => {
          setLoading(false);
          setProgress(0);
        }, 200);
      }
    };
    listeners.add(handleState);
    return () => {
      listeners.delete(handleState);
    };
  }, []);

  // Animate progress smoothly while loading
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        // Fast start, gradual slowdown
        const step = Math.max(1, (90 - prev) * 0.15);
        return Math.min(90, prev + step);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [loading]);

  // Intercept anchor clicks across the application
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      // Skip if no href, external, hash-only, target blank, or special modifiers
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.target === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if external URL
      try {
        const targetUrl = new URL(href, window.location.origin);
        if (targetUrl.origin !== window.location.origin) return;

        // Skip if same full URL (pathname + search)
        const currentUrl = new URL(window.location.href);
        if (
          targetUrl.pathname === currentUrl.pathname &&
          targetUrl.search === currentUrl.search
        ) {
          return;
        }

        // Valid same-origin page transition
        setLoading(true);
        setProgress(20);
      } catch {
        // Ignore parse error
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-primary via-accent to-primary shadow-[0_0_12px_rgba(37,99,235,0.8)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transitionProperty: "width, opacity",
          transitionDuration: progress === 100 ? "200ms" : "200ms",
        }}
      />
    </div>
  );
}
