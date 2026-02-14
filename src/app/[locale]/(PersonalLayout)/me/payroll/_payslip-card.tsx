"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "../../../_components/_glass-style/_glass-card";
import { PayrollItem } from "@/types/attendance-records";
import { getPayrollItemStatusColor } from "@/types/employee-portal";
import { formatPayslip } from "@/lib/utils/format-currency";
import { useAuth } from "@/hooks/use-auth";

// ============================================
// Types
// ============================================

interface PayslipCardProps {
  payslip: PayrollItem;
  onClick?: () => void;
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

export function PayslipCard({ payslip, onClick }: PayslipCardProps) {
  const t = useTranslations("payroll");
  const tEnums = useTranslations("enums");
  const { user } = useAuth();

  // Lấy locale từ user để format tiền lương
  const userLocale = user?.locale || "ja";

  // Lấy màu status
  const statusColor = getPayrollItemStatusColor(payslip.status);
  const statusColorClass =
    statusColorClasses[statusColor] || statusColorClasses.gray;

  // Format period label
  const periodLabel = formatPeriodLabel(
    payslip.year,
    payslip.month,
    userLocale,
  );

  // Format net salary theo locale của user
  const formattedNetSalary = formatPayslip(payslip.netSalary, userLocale);

  return (
    <GlassCard variant="interactive" onClick={onClick} className="p-4">
      {/* Header: Period và Status */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-foreground">{periodLabel}</span>
        <Badge className={cn("border-0 font-medium", statusColorClass)}>
          {tEnums(`payrollItemStatus.${payslip.status}`)}
        </Badge>
      </div>

      {/* Net Salary */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {t("breakdown.netSalary")}
        </span>
        <span className="text-lg font-bold text-primary">
          {formattedNetSalary}
        </span>
      </div>
    </GlassCard>
  );
}

// ============================================
// Exports
// ============================================

export type { PayslipCardProps };
