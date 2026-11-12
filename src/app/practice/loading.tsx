import React from "react";
import { PageLoading } from "@/components/ui/LoadingState";

export default function PracticeLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <PageLoading
        message="Loading MCQ Practice..."
        submessage="Preparing curriculum questions, PYQs and bookmark lists"
      />
    </div>
  );
}
