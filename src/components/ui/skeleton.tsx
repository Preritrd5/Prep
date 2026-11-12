"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-label="Loading..."
      className={cn("flex items-center justify-center p-2", className)}
      {...props}
    >
      <Spinner size="sm" label="Loading..." />
    </div>
  );
}

export default Skeleton;
