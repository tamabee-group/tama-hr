"use client";

import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import { PayrollItem } from "@/types/attendance-records";
import { PayrollItemStatus } from "@/types/attendance-enums";
import { formatCurrency } from "@/lib/utils/format-currency";
import { getEnumLabel } from "@/lib/utils/get-enum-label";

interface PayrollItemDetailDialogProps {
  open: boolean;
  onClose: () => void;
  periodId: number;
  item: PayrollItem;
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
 * Breakdown đầy đủ: base, overtime, allowances, deductions
 */
export function PayrollItemDetailDialog({
  open,
  onClose,
  item,
}: PayrollItemDetailDialogProps) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("itemDetailTitle")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{item.employeeName}</p>
              <p className="text-sm text-muted-foreground">
                {t("table.employee")} ID: {item.employeeId}
              </p>
            </div>
            <Badge variant={getItemStatusBadgeVariant(item.status)}>
              {getEnumLabel("payrollItemStatus", item.status, tEnums)}
            </Badge>
          </div>

          {/* Base Salary */}
          <div className="space-y-2">
            <h3 className="font-medium">{t("breakdown.baseSalary")}</h3>
            <div className="bg-muted rounded-md p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span>{t("breakdown.salaryType")}</span>
                <span>
                  {getEnumLabel("salaryType", item.salaryType, tEnums)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t("breakdown.baseSalaryAmount")}</span>
                <span>{formatCurrency(item.baseSalary)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t("breakdown.workingDays")}</span>
                <span>
                  {item.workingDays} {t("breakdown.days")}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>{t("breakdown.calculatedBase")}</span>
                <span>{formatCurrency(item.calculatedBaseSalary)}</span>
              </div>
            </div>
          </div>

          {/* Overtime */}
          {item.totalOvertimePay > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">{t("breakdown.overtime")}</h3>
              <div className="bg-muted rounded-md p-3 space-y-1">
                {item.regularOvertimeMinutes > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{t("breakdown.regularOT")}</span>
                    <span>
                      {Math.floor(item.regularOvertimeMinutes / 60)}h{" "}
                      {item.regularOvertimeMinutes % 60}m
                    </span>
                  </div>
                )}
                {item.nightOvertimeMinutes > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{t("breakdown.nightOT")}</span>
                    <span>
                      {Math.floor(item.nightOvertimeMinutes / 60)}h{" "}
                      {item.nightOvertimeMinutes % 60}m
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-medium text-blue-600">
                  <span>{t("breakdown.totalOvertimePay")}</span>
                  <span>{formatCurrency(item.totalOvertimePay)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Allowances */}
          {item.totalAllowances > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">{t("breakdown.allowances")}</h3>
              <div className="bg-muted rounded-md p-3 space-y-1">
                {item.allowanceDetails && item.allowanceDetails.length > 0 ? (
                  <>
                    {item.allowanceDetails.map((allowance, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{allowance.name}</span>
                        <span>{formatCurrency(allowance.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-medium text-green-600 pt-1 border-t">
                      <span>{tCommon("total")}</span>
                      <span>{formatCurrency(item.totalAllowances)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm font-medium text-green-600">
                    <span>{tCommon("total")}</span>
                    <span>{formatCurrency(item.totalAllowances)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Deductions */}
          {item.totalDeductions > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">{t("breakdown.deductions")}</h3>
              <div className="bg-muted rounded-md p-3 space-y-1">
                {item.deductionDetails && item.deductionDetails.length > 0 ? (
                  <>
                    {item.deductionDetails.map((deduction, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{deduction.name}</span>
                        <span className="text-red-600">
                          -{formatCurrency(deduction.amount || 0)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-medium text-red-600 pt-1 border-t">
                      <span>{tCommon("total")}</span>
                      <span>-{formatCurrency(item.totalDeductions)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm font-medium text-red-600">
                    <span>{tCommon("total")}</span>
                    <span>-{formatCurrency(item.totalDeductions)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Adjustment */}
          {item.adjustmentAmount && item.adjustmentAmount !== 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">{t("breakdown.adjustment")}</h3>
              <div className="bg-muted rounded-md p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{t("breakdown.adjustmentAmount")}</span>
                  <span
                    className={
                      item.adjustmentAmount > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {item.adjustmentAmount > 0 ? "+" : ""}
                    {formatCurrency(item.adjustmentAmount)}
                  </span>
                </div>
                {item.adjustmentReason && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">
                      {t("breakdown.reason")}:{" "}
                    </span>
                    {item.adjustmentReason}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between">
              <span className="font-medium">{t("breakdown.grossSalary")}</span>
              <span className="font-medium">
                {formatCurrency(item.grossSalary)}
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-bold">{t("breakdown.netSalary")}</span>
              <span className="font-bold text-green-600">
                {formatCurrency(item.netSalary)}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
