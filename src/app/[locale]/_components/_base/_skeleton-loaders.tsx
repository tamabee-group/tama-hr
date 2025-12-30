"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader cho table với filter
 * @param rows - Số dòng skeleton (mặc định: 5)
 * @param filterCount - Số filter skeleton (mặc định: 1)
 */
export function TableSkeleton({
  rows = 5,
  filterCount = 1,
}: {
  rows?: number;
  filterCount?: number;
}) {
  return (
    <div className="space-y-4">
      {/* Filter skeletons */}
      <div className="flex flex-wrap gap-4">
        {[...Array(filterCount)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-48" />
        ))}
      </div>
      {/* Table rows skeleton */}
      <div className="space-y-2">
        {[...Array(rows)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton loader cho summary cards
 * @param count - Số card skeleton (mặc định: 4)
 */
export function SummaryCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-xl border p-6 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton loader cho form dialog
 * @param fieldCount - Số field skeleton (mặc định: 4)
 */
export function FormDialogSkeleton({
  fieldCount = 4,
}: {
  fieldCount?: number;
}) {
  return (
    <div className="space-y-4">
      {[...Array(fieldCount)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

/**
 * Skeleton loader cho detail view
 * @param rows - Số dòng thông tin (mặc định: 6)
 */
export function DetailViewSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton loader cho page header
 */
export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>
  );
}
