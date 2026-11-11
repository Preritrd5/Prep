import React from "react";
import { TableSkeleton, PageHeaderSkeleton } from "@/components/ui/page-skeleton";

export default function TasksLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={6} cols={4} />
    </div>
  );
}
