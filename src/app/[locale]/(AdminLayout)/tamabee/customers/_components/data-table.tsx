"use client";

import { VisibilityState } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { useMemo } from "react";
import { Company } from "@/types/company";
import { useColumns } from "./columns";

interface DataTableProps {
  data: Company[];
}

export function DataTable({ data }: DataTableProps) {
  const t = useTranslations("companies");
  const tCommon = useTranslations("common");
  const { isMobile, isMd, isLg } = useBreakpoint();
  const columns = useColumns();

  // Tính toán columnVisibility dựa trên breakpoint
  const columnVisibility = useMemo((): VisibilityState => {
    if (isMobile) {
      return {
        ownerName: false,
        phone: false,
        industry: false,
        locale: true,
        createdAt: true,
      } as VisibilityState;
    }
    if (!isMd) {
      return {
        industry: false,
        locale: false,
        createdAt: false,
      } as VisibilityState;
    }
    if (!isLg) {
      return {
        locale: false,
        createdAt: false,
      } as VisibilityState;
    }
    return {} as VisibilityState;
  }, [isMobile, isMd, isLg]);

  if (data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        {tCommon("noResults")}
      </div>
    );
  }

  return (
    <BaseTable
      columns={columns}
      data={data}
      filterColumn="name"
      filterPlaceholder={tCommon("search")}
      initialColumnVisibility={columnVisibility}
    />
  );
}
