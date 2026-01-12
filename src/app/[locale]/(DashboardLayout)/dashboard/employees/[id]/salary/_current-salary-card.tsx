"use client";

import { useTranslations, useLocale } from "next-intl";
import { FileText } from "lucide-react";
import { EmployeeSalaryConfig } from "@/types/attendance-records";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";

interface CurrentSalaryCardProps {
  config: EmployeeSalaryConfig;
}

export function CurrentSalaryCard({ config }: CurrentSalaryCardProps) {
  const t = useTranslations("salaryConfig");
  const locale = useLocale() as SupportedLocale;

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
  const getSalaryAmount = () => {
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

  // Lấy label cho số tiền
  const getAmountLabel = () => {
    switch (config.salaryType) {
      case "MONTHLY":
        return t("monthlySalary");
      case "DAILY":
        return t("dailyRate");
      case "HOURLY":
        return t("hourlyRate");
      case "SHIFT_BASED":
        return t("shiftRate");
      default:
        return t("amount");
    }
  };

  const amount = getSalaryAmount();

  return (
    <div className="space-y-4">
      {/* Thông tin chính */}
      <div className="grid grid-cols-2 gap-4">
        {/* Loại lương */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t("salaryType")}</p>
          <p className="font-medium">{getSalaryTypeLabel(config.salaryType)}</p>
        </div>

        {/* Số tiền */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{getAmountLabel()}</p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(amount || 0)}
          </p>
        </div>

        {/* Ngày hiệu lực */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t("effectiveFrom")}</p>
          <p className="font-medium">
            {formatDate(config.effectiveFrom, locale)}
          </p>
        </div>

        {/* Ngày kết thúc */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t("effectiveTo")}</p>
          <p className="font-medium">
            {config.effectiveTo ? formatDate(config.effectiveTo, locale) : "-"}
          </p>
        </div>
      </div>

      {/* Ghi chú */}
      {config.note && (
        <div className="space-y-1 pt-2 border-t">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {t("note")}
          </p>
          <p className="text-sm">{config.note}</p>
        </div>
      )}
    </div>
  );
}
