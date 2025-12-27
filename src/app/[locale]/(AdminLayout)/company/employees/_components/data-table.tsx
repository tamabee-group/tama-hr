"use client";

import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { BaseTable } from "@/app/[locale]/_components/_base/BaseTable";
import { useBreakpoint } from "@/hooks/useBreakpoint";
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
      return {
        employeeCode: true,
        email: false,
        phone: false,
        status: true,
        createdAt: false,
      } as VisibilityState;
    }
    if (!isMd) {
      return {
        email: true,
        phone: false,
        createdAt: false,
      } as VisibilityState;
    }
    if (!isLg) {
      return {
        phone: false,
        createdAt: false,
      } as VisibilityState;
    }
    return {} as VisibilityState;
  }, [isMobile, isMd, isLg]);

  if (data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Chưa có nhân viên nào
      </div>
    );
  }

  return (
    <BaseTable
      columns={columns}
      data={data}
      filterColumn="email"
      filterPlaceholder="Tìm email..."
      initialColumnVisibility={columnVisibility}
    />
  );
}
