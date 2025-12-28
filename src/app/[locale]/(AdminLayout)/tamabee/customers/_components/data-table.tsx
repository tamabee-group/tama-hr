"use client";

import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { useMemo } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const { isMobile, isMd, isLg } = useBreakpoint();

  // Tính toán columnVisibility dựa trên breakpoint
  const columnVisibility = useMemo((): VisibilityState => {
    if (isMobile) {
      // < 640px: Chỉ hiện logo, name, actions
      return {
        ownerName: false,
        phone: false,
        industry: false,
        locale: true,
        createdAt: true,
      } as VisibilityState;
    }
    if (!isMd) {
      // < 768px: Ẩn industry, locale, createdAt
      return {
        industry: false,
        locale: false,
        createdAt: false,
      } as VisibilityState;
    }
    if (!isLg) {
      // < 1024px: Ẩn locale, createdAt
      return {
        locale: false,
        createdAt: false,
      } as VisibilityState;
    }
    // >= 1024px: Hiện tất cả
    return {} as VisibilityState;
  }, [isMobile, isMd, isLg]);

  if (data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Chưa có doanh nghiệp nào
      </div>
    );
  }

  return (
    <BaseTable
      columns={columns}
      data={data}
      filterColumn="name"
      filterPlaceholder="Tìm tên doanh nghiệp..."
      initialColumnVisibility={columnVisibility}
    />
  );
}
