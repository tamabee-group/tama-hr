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
  // Thông tin chi tiết có thể xem ở trang chi tiết user
  const columnVisibility = useMemo((): VisibilityState => {
    if (isMobile) {
      // < 640px: Chỉ hiện avatar, name, actions
      return {
        employeeCode: true,
        email: true,
        role: false,
        referralCode: true,
        status: true,
        createdAt: true,
      } as VisibilityState;
    }
    if (!isMd) {
      // < 768px: Ẩn referralCode, createdAt
      return {
        email: true,
        referralCode: false,
        createdAt: false,
      } as VisibilityState;
    }
    if (!isLg) {
      // < 1024px: Ẩn referralCode, createdAt
      return {
        email: false,
        referralCode: false,
        createdAt: false,
      } as VisibilityState;
    }
    // >= 1024px: Hiện tất cả
    return {} as VisibilityState;
  }, [isMobile, isMd, isLg]);

  if (data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Chưa có người dùng nào
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
