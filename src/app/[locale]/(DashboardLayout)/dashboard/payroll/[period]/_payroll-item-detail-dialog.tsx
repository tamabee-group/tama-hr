"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import { PayrollItem } from "@/types/attendance-records";
import { formatPayslip } from "@/lib/utils/format-currency";
import { formatMinutesToTime } from "@/lib/utils/format-date-time";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { PayrollItemStatus } from "@/types/attendance-enums";
import { useAuth } from "@/hooks/use-auth";
import type { SupportedLocale } from "@/lib/utils/format-currency";
import { payrollApi } from "@/lib/apis/payroll-period-api";
import { toast } from "sonner";
import { formatPayslipFilename } from "@/lib/utils/format-payslip";

// System item codes được tạo tự động bởi backend
const SYSTEM_ITEM_CODES = ["OVERTIME", "SHORTFALL"];

interface PayrollItemDetailDialogProps {
  open: boolean;
  onClose: () => void;
  item: PayrollItem;
  onAdjust?: () => void;
}

const getItemStatusBadgeVariant = (
  status: PayrollItemStatus,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "CONFIRMED":
      return "default";
    case "ADJUSTED":
      return "secondary";
    case "CALCULATED":
    default:
      return "outline";
  }
};

/**
 * Dialog hiển thị chi tiết payroll item
 */
export function PayrollItemDetailDialog({
  open,
  onClose,
  item,
  onAdjust,
}: PayrollItemDetailDialogProps) {
  const t = useTranslations("payroll");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const { user } = useAuth();
  const companyLocale = user?.locale || "vi";
  const [isDownloading, setIsDownloading] = useState(false);

  // Lấy tên item, ưu tiên translation cho system items
  const getItemName = (code: string, name: string) => {
    if (SYSTEM_ITEM_CODES.includes(code)) {
      return t(`systemItems.${code}`);
    }
    return name;
  };

  // Lấy label lương theo loại lương
  const getSalaryLabel = () => {
    switch (item.salaryType) {
      case "HOURLY":
        return t("card.hourlySalary");
      case "DAILY":
        return t("card.dailySalary");
      case "SHIFT_BASED":
        return t("card.shiftSalary");
      default:
        return t("card.baseSalary");
    }
  };

  const totalOvertimeMinutes =
    (item.regularOvertimeMinutes || 0) +
    (item.nightOvertimeMinutes || 0) +
    (item.holidayOvertimeMinutes || 0) +
    (item.weekendOvertimeMinutes || 0);

  const handleDownloadPdf = async () => {
    if (!item.year || !item.month) return;

    try {
      setIsDownloading(true);
      const blob = await payrollApi.downloadCompanyPayslipPdf(item.id);

      // Tạo tên file sử dụng utility function
      const filename = formatPayslipFilename(
        {
          year: item.year,
          month: item.month,
          paidAt: item.paidAt || new Date().toISOString(),
          employeeCode: item.employeeCode,
        },
        locale,
      );

      // Tạo URL từ blob và trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t("messages.exportSuccess"));
    } catch (error) {
      console.error("Download PDF error:", error);
      toast.error(t("downloadPdfError"));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-primary pb-2">
          <DialogTitle>{t("itemDetail")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("itemDetailDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Employee Header */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold">{item.employeeName}</h3>
                {item.employeeCode && (
                  <p className="text-sm text-muted-foreground">
                    {t("employeeCode")}: {item.employeeCode}
                  </p>
                )}
              </div>
              <Badge variant={getItemStatusBadgeVariant(item.status)}>
                {getEnumLabel("payrollItemStatus", item.status, tEnums)}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-0.5">
                  {t("table.salaryType")}
                </p>
                <p className="font-medium">
                  {getEnumLabel("salaryType", item.salaryType, tEnums)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">{t("period")}</p>
                <p className="font-medium">
                  {item.year && item.month
                    ? t("periodFormat", {
                        year: item.year,
                        month: item.month,
                      })
                    : "-"}
                </p>
              </div>
              {/* Mức lương/giờ/ngày/ca cho loại lương không phải MONTHLY */}
              {item.salaryType &&
                item.salaryType !== "MONTHLY" &&
                item.baseSalary > 0 && (
                  <div>
                    <p className="text-muted-foreground mb-0.5">
                      {item.salaryType === "HOURLY" && t("card.hourlyRate")}
                      {item.salaryType === "DAILY" && t("card.dailyRate")}
                      {item.salaryType === "SHIFT_BASED" && t("card.shiftRate")}
                    </p>
                    <p className="font-medium">
                      {formatPayslip(item.baseSalary, companyLocale)}
                    </p>
                  </div>
                )}
            </div>
          </div>

          {/* Attendance Info */}
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">
              {t("sections.attendance")}
            </h4>
            <div className="rounded-lg border p-3 bg-card">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground mb-0.5">
                    {t("breakdown.workingDays")}
                  </p>
                  <p className="font-semibold">{item.workingDays}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">
                    {t("breakdown.workingHours")}
                  </p>
                  <p className="font-semibold">
                    {formatMinutesToTime(item.workingMinutes, { locale })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">
                    {t("breakdown.overtimeHours")}
                  </p>
                  <p className="font-semibold">
                    {formatMinutesToTime(totalOvertimeMinutes, { locale })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">
                    {getSalaryLabel()}
                  </p>
                  <p className="font-semibold">
                    {formatPayslip(item.calculatedBaseSalary, companyLocale)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Overtime */}
          {item.totalOvertimePay > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">
                {t("sections.overtime")}
              </h4>
              <div className="rounded-lg border p-3 bg-card space-y-2 text-sm">
                {item.regularOvertimeMinutes > 0 && (
                  <div className="flex justify-between items-center">
                    <div>
                      <span>{t("table.regularOvertime")}</span>
                      <span className="text-muted-foreground ml-1.5">
                        ({item.regularOvertimeMinutes} {t("minutes")})
                      </span>
                    </div>
                    <span className="font-semibold">
                      {formatPayslip(item.regularOvertimePay, companyLocale)}
                    </span>
                  </div>
                )}
                {item.nightOvertimeMinutes > 0 && (
                  <div className="flex justify-between items-center">
                    <div>
                      <span>{t("table.nightOvertime")}</span>
                      <span className="text-muted-foreground ml-1.5">
                        ({item.nightOvertimeMinutes} {t("minutes")})
                      </span>
                    </div>
                    <span className="font-semibold">
                      {formatPayslip(item.nightOvertimePay, companyLocale)}
                    </span>
                  </div>
                )}
                {item.holidayOvertimeMinutes > 0 && (
                  <div className="flex justify-between items-center">
                    <div>
                      <span>{t("table.holidayOvertime")}</span>
                      <span className="text-muted-foreground ml-1.5">
                        ({item.holidayOvertimeMinutes} {t("minutes")})
                      </span>
                    </div>
                    <span className="font-semibold">
                      {formatPayslip(item.holidayOvertimePay, companyLocale)}
                    </span>
                  </div>
                )}
                {item.weekendOvertimeMinutes > 0 && (
                  <div className="flex justify-between items-center">
                    <div>
                      <span>{t("table.weekendOvertime")}</span>
                      <span className="text-muted-foreground ml-1.5">
                        ({item.weekendOvertimeMinutes} {t("minutes")})
                      </span>
                    </div>
                    <span className="font-semibold">
                      {formatPayslip(item.weekendOvertimePay, companyLocale)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center font-semibold">
                  <span>{t("table.totalOvertime")}</span>
                  <span>
                    {formatPayslip(item.totalOvertimePay, companyLocale)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Allowances */}
          {item.allowanceDetails && item.allowanceDetails.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">
                {t("sections.allowances")}
              </h4>
              <div className="rounded-lg border p-3 bg-card space-y-2 text-sm">
                {item.allowanceDetails.map((allowance, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <span>{getItemName(allowance.code, allowance.name)}</span>
                      {allowance.taxable && (
                        <span className="text-muted-foreground ml-1.5">
                          ({t("taxable")})
                        </span>
                      )}
                    </div>
                    <span className="font-semibold">
                      {formatPayslip(allowance.amount, companyLocale)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center font-semibold">
                  <span>{t("table.totalAllowances")}</span>
                  <span>
                    {formatPayslip(item.totalAllowances, companyLocale)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Deductions */}
          {(item.deductionDetails && item.deductionDetails.length > 0) ||
          item.breakDeductionAmount > 0 ? (
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">
                {t("sections.deductions")}
              </h4>
              <div className="rounded-lg border p-3 bg-card space-y-2 text-sm">
                {item.deductionDetails?.map((deduction, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span>{getItemName(deduction.code, deduction.name)}</span>
                    <span className="font-semibold">
                      -{formatPayslip(deduction.amount, companyLocale)}
                    </span>
                  </div>
                ))}
                {item.breakDeductionAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <div>
                      <span>{t("table.breakDeduction")}</span>
                      <span className="text-muted-foreground ml-1.5">
                        ({item.totalBreakMinutes} {t("minutes")})
                      </span>
                    </div>
                    <span className="font-semibold">
                      -{formatPayslip(item.breakDeductionAmount, companyLocale)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center font-semibold">
                  <span>{t("table.totalDeductions")}</span>
                  <span>
                    -{formatPayslip(item.totalDeductions, companyLocale)}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Adjustment */}
          {item.adjustmentAmount && item.adjustmentAmount !== 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">
                {t("sections.adjustment")}
              </h4>
              <div className="rounded-lg border p-3 bg-card space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>{t("table.adjustmentAmount")}</span>
                  <span className="font-semibold">
                    {item.adjustmentAmount > 0 ? "+" : ""}
                    {formatPayslip(item.adjustmentAmount, companyLocale)}
                  </span>
                </div>
                {item.adjustmentReason && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground mb-1">
                        {t("table.adjustmentReason")}
                      </p>
                      <p>{item.adjustmentReason}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                {t("table.grossSalary")}
              </span>
              <span className="font-semibold">
                {formatPayslip(item.grossSalary, companyLocale)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-semibold">{t("table.netSalary")}</span>
              <span className="text-lg font-bold">
                {formatPayslip(item.netSalary, companyLocale)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer with actions */}
        {item.status === "CONFIRMED" && (
          <DialogFooter className="mt-6">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => {
                  onClose();
                  router.push(
                    `/${locale}/dashboard/payroll/records/${item.id}`,
                  );
                }}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                <Eye className="h-4 w-4 mr-2" />
                {t("viewPayslip")}
              </Button>
              {onAdjust && (
                <Button
                  onClick={onAdjust}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  {t("adjustmentTitle")}
                </Button>
              )}
              <Button
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="flex-1 sm:flex-none"
              >
                {isDownloading ? t("downloadingPdf") : t("downloadPdf")}
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
