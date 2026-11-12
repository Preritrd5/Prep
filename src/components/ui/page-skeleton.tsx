"use client";

import React from "react";
import { LoadingState, PageLoading, SectionLoading } from "@/components/ui/LoadingState";

export function PageHeaderSkeleton() {
  return null;
}

export function MetricCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <SectionLoading message="Loading metrics..." />
  );
}

export function DashboardSkeleton() {
  return (
    <PageLoading
      message="Loading dashboard..."
      submessage="Preparing study tasks, examination progress and analytics"
    />
  );
}

export function TableSkeleton({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <SectionLoading message="Loading data table..." />
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <PageLoading message="Loading items..." />
  );
}

export function FormSkeleton() {
  return (
    <SectionLoading message="Loading form..." />
  );
}

export function SyllabusSkeleton() {
  return (
    <PageLoading
      message="Loading syllabus tracker..."
      submessage="Fetching curriculum subjects, chapters and topics"
    />
  );
}

export function AnalyticsSkeleton() {
  return (
    <PageLoading
      message="Loading performance analytics..."
      submessage="Calculating subject accuracy and readiness trends"
    />
  );
}

export function GenericPageSkeleton() {
  return (
    <PageLoading message="Loading content..." />
  );
}

export default GenericPageSkeleton;
