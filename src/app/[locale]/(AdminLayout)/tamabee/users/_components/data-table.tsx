"use client";

import { VisibilityState } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { useMemo } from "react";
import { User } from "@/types/user";
import { useColumns } from "./columns";

interface DataTableProps {
  data: User[];
}

export function DataTable({ data }: DataTableProps) {
  const t = useTranslations("users");
  const columns = useColumns();
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
        {t("noUsers")}
      </div>
    );
  }

  return (
    <BaseTable
      columns={columns}
      data={data}
      filterColumn="email"
      filterPlaceholder={t("searchEmail")}
      initialColumnVisibility={columnVisibility}
    />
  );
}
