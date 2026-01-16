"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeeSalaryConfig } from "@/types/attendance-records";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";
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
  const locale = useLocale() as SupportedLocale;

  const [selectedConfig, setSelectedConfig] =
    useState<EmployeeSalaryConfig | null>(null);

  // Lấy label cho salary type
  const getSalaryTypeLabel = (type: string) => {
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
  };

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
  const getConfigStatus = (config: EmployeeSalaryConfig) => {
    const today = new Date().toISOString().split("T")[0];
    const effectiveTo = config.effectiveTo;

    // Đang được áp dụng (active = true)
    if (config.isActive) {
      return { label: t("statusActive"), variant: "default" as const };
    }

    // Quá hạn: effectiveTo < today
    if (effectiveTo && effectiveTo < today) {
      return { label: t("statusExpired"), variant: "outline" as const };
    }

    // Còn hiệu lực nhưng chưa được áp dụng
    return { label: t("statusValid"), variant: "secondary" as const };
  };

  if (history.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">{t("noHistory")}</p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead>{t("table.salaryType")}</TableHead>
              <TableHead>{t("table.amount")}</TableHead>
              <TableHead>{t("table.effectiveFrom")}</TableHead>
              <TableHead>{t("table.effectiveTo")}</TableHead>
              <TableHead>{t("table.status")}</TableHead>
              <TableHead>{t("note")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((config, index) => {
              const status = getConfigStatus(config);
              const amount = getSalaryAmount(config);

              return (
                <TableRow
                  key={config.id}
                  className={`cursor-pointer hover:bg-muted/50 ${config.isActive ? "bg-green-50 dark:bg-green-950/20" : ""}`}
                  onClick={() => setSelectedConfig(config)}
                >
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{getSalaryTypeLabel(config.salaryType)}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(amount || 0)}
                  </TableCell>
                  <TableCell>
                    {formatDate(config.effectiveFrom, locale)}
                  </TableCell>
                  <TableCell>
                    {config.effectiveTo
                      ? formatDate(config.effectiveTo, locale)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={status.variant}
                      className={
                        config.isActive ? "bg-green-600 hover:bg-green-600" : ""
                      }
                    >
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {config.note || "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

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
