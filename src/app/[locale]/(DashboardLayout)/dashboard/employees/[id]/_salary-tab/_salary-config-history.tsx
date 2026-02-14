"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { EmployeeSalaryConfig } from "@/types/attendance-records";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { formatDate, formatDateForApi } from "@/lib/utils/format-date-time";
import { SalaryConfigDetailDialog } from "./_salary-config-detail-dialog";

interface SalaryConfigHistoryProps {
  employeeId: number;
  history: EmployeeSalaryConfig[];
  onEdit: (config: EmployeeSalaryConfig) => void;
  onDeleted: () => void;
}

export function SalaryConfigHistory({
  employeeId,
  history,
  onEdit,
  onDeleted,
}: SalaryConfigHistoryProps) {
  const t = useTranslations("salaryConfig");
  const tCommon = useTranslations("common");
  const locale = useLocale() as SupportedLocale;

  const [selectedConfig, setSelectedConfig] =
    useState<EmployeeSalaryConfig | null>(null);

  // Lấy label cho salary type
  const getSalaryTypeLabel = useCallback(
    (type: string) => {
      switch (type) {
        case "MONTHLY":
          return t("typeMonthly");
        case "DAILY":
          return t("typeDaily");
        case "HOURLY":
          return t("typeHourly");
        case "SHIFT_BASED":
          return t("typeShiftBased");
        default:
          return type;
      }
    },
    [t],
  );

  // Lấy số tiền dựa trên loại lương
  const getSalaryAmount = (config: EmployeeSalaryConfig) => {
    switch (config.salaryType) {
      case "MONTHLY":
        return config.monthlySalary;
      case "DAILY":
        return config.dailyRate;
      case "HOURLY":
        return config.hourlyRate;
      case "SHIFT_BASED":
        return config.shiftRate;
      default:
        return 0;
    }
  };

  // Xác định trạng thái của config
  const getConfigStatus = useCallback(
    (config: EmployeeSalaryConfig) => {
      const today = formatDateForApi(new Date()) || "";
      const effectiveTo = config.effectiveTo;

      if (config.isActive) {
        return { label: t("statusActive"), variant: "default" as const };
      }

      if (effectiveTo && effectiveTo < today) {
        return { label: t("statusExpired"), variant: "outline" as const };
      }

      return { label: t("statusValid"), variant: "secondary" as const };
    },
    [t],
  );

  const columns: ColumnDef<EmployeeSalaryConfig>[] = useMemo(
    () => [
      {
        id: "stt",
        header: tCommon("stt"),
        cell: ({ row }) => row.index + 1,
        size: 60,
      },
      {
        accessorKey: "salaryType",
        header: t("table.salaryType"),
        cell: ({ row }) => getSalaryTypeLabel(row.original.salaryType),
      },
      {
        id: "amount",
        header: t("table.amount"),
        cell: ({ row }) => (
          <span className="font-mono">
            {formatCurrency(getSalaryAmount(row.original) || 0)}
          </span>
        ),
      },
      {
        accessorKey: "effectiveFrom",
        header: t("table.effectiveFrom"),
        cell: ({ row }) => formatDate(row.original.effectiveFrom, locale),
      },
      {
        id: "status",
        header: t("table.status"),
        cell: ({ row }) => {
          const status = getConfigStatus(row.original);
          return (
            <Badge
              variant={status.variant}
              className={
                row.original.isActive ? "bg-green-600 hover:bg-green-600" : ""
              }
            >
              {status.label}
            </Badge>
          );
        },
      },
    ],
    [t, tCommon, locale, getSalaryTypeLabel, getConfigStatus],
  );

  if (history.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">{t("noHistory")}</p>
    );
  }

  return (
    <>
      <BaseTable
        data={history}
        columns={columns}
        onRowClick={setSelectedConfig}
        showPagination={false}
        rowClassName={(row) =>
          row.isActive ? "bg-green-50 dark:bg-green-950/20" : ""
        }
      />

      <SalaryConfigDetailDialog
        config={selectedConfig}
        employeeId={employeeId}
        open={!!selectedConfig}
        onOpenChange={(open) => !open && setSelectedConfig(null)}
        onEdit={onEdit}
        onDeleted={onDeleted}
      />
    </>
  );
}
