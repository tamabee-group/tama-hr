"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Eye } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GlassTable,
  GlassTableColumn,
} from "../../../_components/_glass-style/_glass-table";
import { PayrollItem } from "@/types/attendance-records";
import { getPayrollItemStatusColor } from "@/types/employee-portal";
import { formatPayslip } from "@/lib/utils/format-currency";
import { useAuth } from "@/hooks/use-auth";

// ============================================
// Types
// ============================================

interface PayslipTableProps {
  payslips: PayrollItem[];
  onRowClick?: (payslip: PayrollItem) => void;
  page?: number;
  pageSize?: number;
}

// ============================================
// Status Badge Styles
// ============================================

// Mapping màu status sang Tailwind classes
const statusColorClasses: Record<string, string> = {
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  yellow:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  green: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  red: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

// ============================================
// Helper Functions
// ============================================

/**
 * Format period label theo locale
 * - ja: 2025年1月
 * - vi/en: 1/2025
 */
function formatPeriodLabel(
  year: number | undefined,
  month: number | undefined,
  locale: string,
): string {
  if (!year || !month) return "";

  // Normalize locale: "ja_JP" -> "ja"
  const normalizedLocale = locale.split("_")[0].toLowerCase();

  if (normalizedLocale === "ja") {
    return `${year}年${month}月`;
  }
  return `${month}/${year}`;
}

// ============================================
// Component
// ============================================

export function PayslipTable({
  payslips,
  onRowClick,
  page = 0,
  pageSize = 10,
}: PayslipTableProps) {
  const t = useTranslations("payroll");
  const tEnums = useTranslations("enums");
  const { user } = useAuth();

  // Lấy locale từ user để format tiền lương
  const userLocale = user?.locale || "ja";

  // Định nghĩa columns cho GlassTable
  const columns: GlassTableColumn<PayrollItem>[] = React.useMemo(
    () => [
      // Cột STT
      {
        key: "stt",
        header: "#",
        width: "w-[60px]",
        render: (_item: PayrollItem, index: number) => {
          // Tính STT dựa trên page và pageSize
          const stt = page * pageSize + index + 1;
          return <span className="text-muted-foreground">{stt}</span>;
        },
      },
      // Cột Period (tháng/năm)
      {
        key: "period",
        header: t("detail.period"),
        render: (item: PayrollItem) => (
          <span className="font-medium">
            {formatPeriodLabel(item.year, item.month, userLocale)}
          </span>
        ),
      },
      // Cột Net Salary
      {
        key: "netSalary",
        header: t("breakdown.netSalary"),
        render: (item: PayrollItem) => (
          <span className="font-semibold text-primary">
            {formatPayslip(item.netSalary, userLocale)}
          </span>
        ),
      },
      // Cột Status
      {
        key: "status",
        header: t("table.status"),
        render: (item: PayrollItem) => {
          const statusColor = getPayrollItemStatusColor(item.status);
          const statusColorClass =
            statusColorClasses[statusColor] || statusColorClasses.gray;
          return (
            <Badge className={cn("border-0 font-medium", statusColorClass)}>
              {tEnums(`payrollItemStatus.${item.status}`)}
            </Badge>
          );
        },
      },
      // Cột Actions
      {
        key: "actions",
        header: "",
        width: "w-[80px]",
        render: (item: PayrollItem) => (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onRowClick?.(item);
            }}
            aria-label={t("itemDetail")}
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
          </Button>
        ),
      },
    ],
    [t, tEnums, userLocale, page, pageSize, onRowClick],
  );

  return (
    <GlassTable
      data={payslips}
      columns={columns}
      onRowClick={onRowClick}
      emptyMessage={t("messages.notFound")}
    />
  );
}

// ============================================
// Exports
// ============================================

export type { PayslipTableProps };
