"use client";

import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { useMemo, useState } from "react";
import { User } from "@/types/user";
import { createColumns } from "./columns";
import type { SupportedLocale } from "@/lib/utils/format-currency";
import { Input } from "@/components/ui/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends User, TValue>({
  data,
}: DataTableProps<TData, TValue>) {
  const { isMobile, isMd, isLg } = useBreakpoint();
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter data theo mã nhân viên hoặc tên
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase().trim();
    return data.filter((user) => {
      const employeeCode = user.employeeCode?.toLowerCase() || "";
      const name = user.profile?.name?.toLowerCase() || "";
      return employeeCode.includes(term) || name.includes(term);
    });
  }, [data, searchTerm]);

  // Tạo columns với translations
  const translatedColumns = useMemo(() => {
    return createColumns({
      employeeCode: t("table.employeeCode"),
      name: t("table.name"),
      email: t("table.email"),
      role: t("table.role"),
      phone: tCommon("phone"),
      department: tCommon("department"),
      status: t("table.status"),
      createdAt: t("table.createdAt"),
      profile: t("table.profile"),
      viewDetail: tCommon("details"),
      viewAttendance: t("viewAttendance"),
      viewPayroll: t("viewPayroll"),
      active: tCommon("active"),
      inactive: tCommon("inactive"),
      roleLabels: {
        ADMIN_TAMABEE: tEnums("userRole.ADMIN_TAMABEE"),
        MANAGER_TAMABEE: tEnums("userRole.MANAGER_TAMABEE"),
        EMPLOYEE_TAMABEE: tEnums("userRole.EMPLOYEE_TAMABEE"),
        ADMIN_COMPANY: tEnums("userRole.ADMIN_COMPANY"),
        MANAGER_COMPANY: tEnums("userRole.MANAGER_COMPANY"),
        EMPLOYEE_COMPANY: tEnums("userRole.EMPLOYEE_COMPANY"),
      },
      locale,
    }) as ColumnDef<TData, TValue>[];
  }, [t, tCommon, tEnums, locale]);

  // Tính toán columnVisibility dựa trên breakpoint
  const columnVisibility = useMemo((): VisibilityState => {
    if (isMobile) {
      return {
        employeeCode: true,
        departmentName: false,
        status: true,
        createdAt: false,
      } as VisibilityState;
    }
    if (!isMd) {
      return {
        departmentName: false,
        createdAt: false,
      } as VisibilityState;
    }
    if (!isLg) {
      return {
        createdAt: false,
      } as VisibilityState;
    }
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
    <div className="space-y-4">
      <Input
        placeholder={t("searchPlaceholder")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <BaseTable
        columns={translatedColumns}
        data={filteredData}
        initialColumnVisibility={columnVisibility}
      />
    </div>
  );
}
