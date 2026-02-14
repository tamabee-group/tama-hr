"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { EmployeeSalaryItem, SalaryItemType } from "@/types/salary-item";
import { formatPayslip } from "@/lib/utils/format-currency";
import { useAuth } from "@/hooks/use-auth";

interface SalaryItemListProps {
  type: SalaryItemType;
  items: EmployeeSalaryItem[];
  onRowClick: (item: EmployeeSalaryItem) => void;
}

export function SalaryItemList({
  type,
  items,
  onRowClick,
}: SalaryItemListProps) {
  const t = useTranslations("salaryConfig");
  const tCommon = useTranslations("common");
  const { user } = useAuth();

  const columns: ColumnDef<EmployeeSalaryItem>[] = useMemo(
    () => [
      {
        id: "stt",
        header: tCommon("stt"),
        cell: ({ row }) => row.index + 1,
        size: 60,
      },
      {
        accessorKey: "templateName",
        header:
          type === SalaryItemType.ALLOWANCE
            ? t("allowanceName")
            : t("deductionName"),
      },
      {
        id: "amount",
        header: t("amount"),
        cell: ({ row }) => (
          <span className="font-mono">
            {formatPayslip(row.original.amount, user?.locale)}
          </span>
        ),
      },
    ],
    [t, tCommon, type, user?.locale],
  );

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        {type === SalaryItemType.ALLOWANCE
          ? t("noAllowances")
          : t("noDeductions")}
      </p>
    );
  }

  return (
    <BaseTable
      data={items}
      columns={columns}
      onRowClick={onRowClick}
      showPagination={false}
    />
  );
}
