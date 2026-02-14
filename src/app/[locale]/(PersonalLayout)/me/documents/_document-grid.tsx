"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import { DocumentCard } from "./_document-card";
import { GlassCard } from "../../../_components/_glass-style/_glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeDocument } from "@/types/employee-detail";

// ============================================
// Types
// ============================================

interface DocumentGridProps {
  documents: EmployeeDocument[];
  loading: boolean;
  onDocumentClick: (doc: EmployeeDocument) => void;
  onDocumentDelete: (doc: EmployeeDocument) => void;
}

// ============================================
// Loading Skeleton
// ============================================

function DocumentSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/70 dark:bg-white/10">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Empty State
// ============================================

function EmptyState() {
  const t = useTranslations("portal.documents");

  return (
    <GlassCard className="col-span-full p-8">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {t("empty")}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("emptyDescription")}
        </p>
      </div>
    </GlassCard>
  );
}

// ============================================
// Component
// ============================================

export function DocumentGrid({
  documents,
  loading,
  onDocumentClick,
  onDocumentDelete,
}: DocumentGridProps) {
  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <DocumentSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (documents.length === 0) {
    return <EmptyState />;
  }

  // Document grid
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onClick={() => onDocumentClick(doc)}
          onDelete={() => onDocumentDelete(doc)}
        />
      ))}
    </div>
  );
}

export type { DocumentGridProps };
