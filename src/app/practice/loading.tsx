import React from "react";
import { CardGridSkeleton } from "@/components/ui/page-skeleton";

export default function PracticeLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <CardGridSkeleton count={6} />
    </div>
  );
}
