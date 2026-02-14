"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { PayrollItem } from "@/types/attendance-records";
import { getPayrollItemStatusColor } from "@/types/employee-portal";
import { formatPayslip } from "@/lib/utils/format-currency";
import { useAuth } from "@/hooks/use-auth";
import { myPayslipApi } from "@/lib/apis/my-payslip-api";

// ============================================
// Types
// ============================================

interface PayslipDetailDialogProps {
  payslip: PayrollItem | null;
  open: boolean;
  onClose: () => void;
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

// System item codes được tạo tự động bởi backend
const SYSTEM_ITEM_CODES = ["OVERTIME", "SHORTFALL"];

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
// Sub-components
// ============================================

/**
 * Component hiển thị một dòng breakdown
 */
interface BreakdownRowProps {
  label: string;
  value: number | undefined;
  hours?: number;
  negative?: boolean;
  companyLocale: string;
}

function BreakdownRow({
  label,
  value,
  hours,
  negative,
  companyLocale,
}: BreakdownRowProps) {
  if (!value || value === 0) return null;

  return (
    <div className="flex justify-between text-sm">
      <span>
        {label}
        {hours !== undefined && hours > 0 && (
          <span className="text-muted-foreground ml-1">({hours}h)</span>
        )}
      </span>
      <span className={negative ? "text-red-600" : ""}>
        {negative ? "-" : ""}
        {formatPayslip(Math.abs(value), companyLocale)}
      </span>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function PayslipDetailDialog({
  payslip,
  open,
  onClose,
}: PayslipDetailDialogProps) {
  const t = useTranslations("payroll");
  const tEnums = useTranslations("enums");
  const tCommon = useTranslations("common");
  const { user } = useAuth();

  // State cho download PDF
  const [downloading, setDownloading] = React.useState(false);

  // Lấy locale từ user để format tiền lương
  const userLocale = user?.locale || "ja";

  // Lấy tên item, ưu tiên translation cho system items
  const getItemName = (code: string, name: string) => {
    if (SYSTEM_ITEM_CODES.includes(code)) {
      return t(`systemItems.${code}`);
    }
    return name;
  };

  // Handle download PDF
  const handleDownloadPdf = async () => {
    if (!payslip?.id) return;

    setDownloading(true);
    try {
      const blob = await myPayslipApi.downloadPayslipPdf(payslip.id);

      // Tạo URL và trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `payslip-${payslip.year}-${payslip.month}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(t("messages.exportSuccess"));
    } catch {
      toast.error(t("downloadPdfError"));
    } finally {
      setDownloading(false);
    }
  };

  if (!payslip) return null;

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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{periodLabel}</span>
            <Badge className={cn("border-0 font-medium", statusColorClass)}>
              {tEnums(`payrollItemStatus.${payslip.status}`)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Lương cơ bản */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              {t("sections.baseSalary")}
            </h4>
            <div className="flex justify-between">
              <span>{t("breakdown.baseSalary")}</span>
              <span>{formatPayslip(payslip.baseSalary, userLocale)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("breakdown.workingDays")}: {payslip.workingDays}{" "}
                {t("breakdown.days")}
              </span>
              <span className="text-muted-foreground">
                {t("breakdown.workingHours")}: {payslip.workingHours}h
              </span>
            </div>
            <div className="flex justify-between font-medium">
              <span>{t("breakdown.calculatedBase")}</span>
              <span>
                {formatPayslip(payslip.calculatedBaseSalary, userLocale)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Làm thêm giờ */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              {t("sections.overtime")}
            </h4>
            <BreakdownRow
              label={t("breakdown.regularOvertime")}
              value={payslip.regularOvertimePay}
              hours={Math.round((payslip.regularOvertimeMinutes || 0) / 60)}
              companyLocale={userLocale}
            />
            <BreakdownRow
              label={t("breakdown.nightOvertime")}
              value={payslip.nightOvertimePay}
              hours={Math.round((payslip.nightOvertimeMinutes || 0) / 60)}
              companyLocale={userLocale}
            />
            <BreakdownRow
              label={t("breakdown.holidayOvertime")}
              value={payslip.holidayOvertimePay}
              hours={Math.round((payslip.holidayOvertimeMinutes || 0) / 60)}
              companyLocale={userLocale}
            />
            <BreakdownRow
              label={t("breakdown.weekendOvertime")}
              value={payslip.weekendOvertimePay}
              hours={Math.round((payslip.weekendOvertimeMinutes || 0) / 60)}
              companyLocale={userLocale}
            />
            <div className="flex justify-between font-medium">
              <span>{t("breakdown.totalOvertime")}</span>
              <span>
                {formatPayslip(payslip.totalOvertimePay || 0, userLocale)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Phụ cấp */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              {t("breakdown.allowances")}
            </h4>
            {payslip.allowanceDetails?.length > 0 ? (
              payslip.allowanceDetails.map((item, index) => (
                <BreakdownRow
                  key={index}
                  label={getItemName(item.code, item.name)}
                  value={item.amount}
                  companyLocale={userLocale}
                />
              ))
            ) : (
              <span className="text-muted-foreground text-sm">-</span>
            )}
            <div className="flex justify-between font-medium text-green-600">
              <span>{t("breakdown.totalAllowances")}</span>
              <span>
                {formatPayslip(payslip.totalAllowances || 0, userLocale)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Khấu trừ */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              {t("breakdown.deductions")}
            </h4>
            {payslip.deductionDetails?.length > 0 ? (
              payslip.deductionDetails.map((item, index) => (
                <BreakdownRow
                  key={index}
                  label={getItemName(item.code, item.name)}
                  value={item.amount}
                  negative
                  companyLocale={userLocale}
                />
              ))
            ) : (
              <span className="text-muted-foreground text-sm">-</span>
            )}
            <div className="flex justify-between font-medium text-red-600">
              <span>{t("breakdown.totalDeductions")}</span>
              <span>
                -{formatPayslip(payslip.totalDeductions || 0, userLocale)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Tổng cộng */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{t("breakdown.grossSalary")}</span>
              <span className="font-medium">
                {formatPayslip(payslip.grossSalary || 0, userLocale)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>{t("breakdown.netSalary")}</span>
              <span className="text-green-600">
                {formatPayslip(payslip.netSalary || 0, userLocale)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer với nút download PDF */}
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            {tCommon("close")}
          </Button>
          <Button onClick={handleDownloadPdf} disabled={downloading}>
            {downloading ? (
              <>
                <Loader2
                  className="h-4 w-4 mr-2 animate-spin"
                  aria-hidden="true"
                />
                {t("downloadingPdf")}
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                {t("downloadPdf")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Exports
// ============================================

export type { PayslipDetailDialogProps };
