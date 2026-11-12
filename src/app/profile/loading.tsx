import React from "react";
import { PageLoading } from "@/components/ui/LoadingState";

export default function ProfileLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <PageLoading
        message="Loading Profile & Settings..."
        submessage="Fetching workspace preferences and target exams"
      />
    </div>
  );
}
