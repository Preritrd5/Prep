import React from "react";
import { GenericPageSkeleton } from "@/components/ui/page-skeleton";

export default function RootLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <GenericPageSkeleton />
    </div>
  );
}
