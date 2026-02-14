"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// ============================================
// Types
// ============================================

interface GlassTableColumn<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface GlassTableProps<T> {
  data: T[];
  columns: GlassTableColumn<T>[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

// ============================================
// Styles
// ============================================

// Base glass styling cho table container - iOS Liquid Glass design
const containerGlassStyles = [
  // Backdrop blur effect
  "backdrop-blur-xl",
  // Translucent background - light mode
  "bg-white/70",
  // Translucent background - dark mode
  "dark:bg-white/10",
  // Border styling
  "border",
  "border-white/20",
  // Rounded corners (16px)
  "rounded-2xl",
  // Shadow
  "shadow-xl",
  // Overflow hidden để rounded corners hoạt động
  "overflow-hidden",
];

// Header row styles
const headerRowStyles = [
  // Background cho header
  "bg-white/50",
  "dark:bg-white/5",
  // Border bottom
  "border-b",
  "border-white/20",
];

// Header cell styles
const headerCellStyles = [
  "px-4",
  "py-3",
  "text-left",
  "text-sm",
  "font-semibold",
  "text-foreground/80",
];

// Body row styles
const bodyRowStyles = [
  // Border bottom (trừ row cuối)
  "border-b",
  "border-white/10",
  "last:border-b-0",
  // Transition cho hover
  "transition-colors",
  "duration-150",
];

// Interactive row styles (khi có onRowClick)
const interactiveRowStyles = [
  "cursor-pointer",
  "hover:bg-white/30",
  "dark:hover:bg-white/5",
  // Focus state cho accessibility
  "focus-visible:outline-none",
  "focus-visible:bg-white/30",
  "dark:focus-visible:bg-white/5",
];

// Body cell styles
const bodyCellStyles = ["px-4", "py-3", "text-sm", "text-foreground"];

// ============================================
// Skeleton Component
// ============================================

function GlassTableSkeleton<T>({
  columns,
  rows = 5,
}: {
  columns: GlassTableColumn<T>[];
  rows?: number;
}) {
  return (
    <div className={cn(containerGlassStyles)}>
      <table className="w-full">
        {/* Header */}
        <thead>
          <tr className={cn(headerRowStyles)}>
            {columns.map((column, index) => (
              <th
                key={index}
                className={cn(headerCellStyles)}
                style={{ width: column.width }}
              >
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        {/* Body skeleton rows */}
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className={cn(bodyRowStyles)}>
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={cn(bodyCellStyles)}
                  style={{ width: column.width }}
                >
                  <Skeleton className="h-4 w-full max-w-[120px]" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// Empty State Component
// ============================================

function GlassTableEmpty({
  message,
  colSpan,
}: {
  message: string;
  colSpan: number;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center">
        <div className="flex flex-col items-center gap-2">
          {/* Empty state icon */}
          <svg
            className="h-12 w-12 text-muted-foreground/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </td>
    </tr>
  );
}

// ============================================
// Main Component
// ============================================

export function GlassTable<T>({
  data,
  columns,
  onRowClick,
  loading = false,
  emptyMessage = "No data available",
  className,
}: GlassTableProps<T>) {
  // Hiển thị skeleton khi đang loading
  if (loading) {
    return <GlassTableSkeleton columns={columns} />;
  }

  // Lấy giá trị từ item theo key
  const getCellValue = (item: T, key: keyof T | string): React.ReactNode => {
    if (typeof key === "string" && key.includes(".")) {
      // Hỗ trợ nested key như "user.name"
      const keys = key.split(".");
      let value: unknown = item;
      for (const k of keys) {
        value = (value as Record<string, unknown>)?.[k];
      }
      return value as React.ReactNode;
    }
    return (item as Record<string, unknown>)[key as string] as React.ReactNode;
  };

  // Xử lý row click với keyboard support
  const handleRowKeyDown = (
    event: React.KeyboardEvent<HTMLTableRowElement>,
    item: T,
  ) => {
    if (onRowClick && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onRowClick(item);
    }
  };

  return (
    <div className={cn(containerGlassStyles, className)}>
      <table className="w-full">
        {/* Header */}
        <thead>
          <tr className={cn(headerRowStyles)}>
            {columns.map((column, index) => (
              <th
                key={index}
                className={cn(headerCellStyles)}
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.length === 0 ? (
            <GlassTableEmpty message={emptyMessage} colSpan={columns.length} />
          ) : (
            data.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  bodyRowStyles,
                  onRowClick && interactiveRowStyles,
                )}
                onClick={() => onRowClick?.(item)}
                onKeyDown={(e) => handleRowKeyDown(e, item)}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? "button" : undefined}
                aria-label={
                  onRowClick
                    ? `View details for row ${rowIndex + 1}`
                    : undefined
                }
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={cn(bodyCellStyles)}
                    style={{ width: column.width }}
                  >
                    {column.render
                      ? column.render(item, rowIndex)
                      : getCellValue(item, column.key)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// Exports
// ============================================

export type { GlassTableProps, GlassTableColumn };
