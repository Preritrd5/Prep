import React from "react";
import { PageLoading } from "@/components/ui/LoadingState";

export default function AnalyticsLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <PageLoading
        message="Loading Performance Analytics..."
        submessage="Calculating subject accuracy, study hours and readiness metrics"
      />
    </div>
  );
}
