"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

export interface ResponsiveTableColumn<T> {
  /** Key để access data */
  key: keyof T | string;
  /** Header label */
  header: string;
  /** Render function cho cell */
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  /** Ẩn trên mobile */
  hideOnMobile?: boolean;
  /** Hiển thị trong card view */
  showInCard?: boolean;
  /** Là primary field (hiển thị đầu tiên trong card) */
  isPrimary?: boolean;
  /** CSS class cho cell */
  className?: string;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: ResponsiveTableColumn<T>[];
  /** Key field để làm unique identifier */
  keyField: keyof T;
  /** Callback khi click row */
  onRowClick?: (row: T) => void;
  /** Text khi không có data */
  emptyText?: string;
  /** Hiển thị card view trên mobile (default: true) */
  mobileCardView?: boolean;
  /** Breakpoint để switch sang card view (default: md) */
  cardBreakpoint?: "sm" | "md" | "lg";
  /** Custom class cho container */
  className?: string;
}

// ============================================
// Helper Functions
// ============================================

function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split(".").reduce((acc: unknown, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

// ============================================
// ResponsiveTable Component
// ============================================

/**
 * Responsive table component với:
 * - Horizontal scroll trên mobile
 * - Card view option trên mobile
 * - Ẩn/hiện columns theo breakpoint
 */
export function ResponsiveTable<T>({
  data,
  columns,
  keyField,
  onRowClick,
  emptyText = "Không có dữ liệu",
  mobileCardView = true,
  cardBreakpoint = "md",
  className,
}: ResponsiveTableProps<T>) {
  // Lọc columns cho table view (không hideOnMobile)
  const tableColumns = columns.filter((col) => !col.hideOnMobile);

  // Lọc columns cho card view
  const cardColumns = columns.filter((col) => col.showInCard !== false);
  const primaryColumn = cardColumns.find((col) => col.isPrimary);
  const secondaryColumns = cardColumns.filter((col) => !col.isPrimary);

  // Breakpoint classes
  const breakpointClasses = {
    sm: { table: "hidden sm:block", card: "sm:hidden" },
    md: { table: "hidden md:block", card: "md:hidden" },
    lg: { table: "hidden lg:block", card: "lg:hidden" },
  };

  const { table: tableClass, card: cardClass } =
    breakpointClasses[cardBreakpoint];

  // Render cell value
  const renderCell = (
    column: ResponsiveTableColumn<T>,
    row: T,
    index: number,
  ): React.ReactNode => {
    const value = getNestedValue(row, column.key as string);
    if (column.render) {
      return column.render(value, row, index);
    }
    return value as React.ReactNode;
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">{emptyText}</div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Table View - Desktop */}
      <div className={cn("overflow-x-auto", mobileCardView && tableClass)}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              {tableColumns.map((column) => (
                <th
                  key={column.key as string}
                  className={cn(
                    "px-3 py-2 text-left text-sm font-medium text-muted-foreground whitespace-nowrap",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={String(row[keyField])}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b transition-colors",
                  onRowClick &&
                    "cursor-pointer hover:bg-muted/50 active:bg-muted",
                )}
              >
                {tableColumns.map((column) => (
                  <td
                    key={column.key as string}
                    className={cn(
                      "px-3 py-2 text-sm whitespace-nowrap",
                      column.className,
                    )}
                  >
                    {renderCell(column, row, rowIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card View - Mobile */}
      {mobileCardView && (
        <div className={cn("space-y-3", cardClass)}>
          {data.map((row, rowIndex) => (
            <div
              key={String(row[keyField])}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "rounded-lg border bg-card p-3 shadow-sm",
                onRowClick &&
                  "cursor-pointer active:bg-muted/50 transition-colors",
              )}
            >
              {/* Primary field */}
              {primaryColumn && (
                <div className="font-medium text-sm mb-2">
                  {renderCell(primaryColumn, row, rowIndex)}
                </div>
              )}

              {/* Secondary fields */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {secondaryColumns.map((column) => (
                  <div key={column.key as string} className="min-w-0">
                    <span className="text-xs text-muted-foreground block truncate">
                      {column.header}
                    </span>
                    <span className="text-sm truncate block">
                      {renderCell(column, row, rowIndex)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Horizontal Scroll Table - Mobile (khi không dùng card view) */}
      {!mobileCardView && (
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b bg-muted/50">
                {columns.map((column) => (
                  <th
                    key={column.key as string}
                    className={cn(
                      "px-3 py-2 text-left text-sm font-medium text-muted-foreground whitespace-nowrap",
                      column.className,
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={String(row[keyField])}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-b transition-colors",
                    onRowClick &&
                      "cursor-pointer hover:bg-muted/50 active:bg-muted",
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key as string}
                      className={cn(
                        "px-3 py-2 text-sm whitespace-nowrap",
                        column.className,
                      )}
                    >
                      {renderCell(column, row, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
