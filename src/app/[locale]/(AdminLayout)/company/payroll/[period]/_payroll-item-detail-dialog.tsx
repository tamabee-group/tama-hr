"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { payrollPeriodApi } from "@/lib/apis/payroll-period-api";
import { PayrollItem, PayrollAdjustment } from "@/types/attendance-records";
import { PayrollItemStatus } from "@/types/attendance-enums";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { formatDateTime } from "@/lib/utils/format-date";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { getEnumLabel } from "@/lib/utils/get-enum-label";

interface PayrollItemDetailDialogProps {
  open: boolean;
  onClose: () => void;
  periodId: number;
  item: PayrollItem;
}

// Map item status to badge variant
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

// State type cho fetch - null = loading, [] = no data, [...] = has data
type AdjustmentsState = PayrollAdjustment[] | null;

// Custom hook để fetch adjustments
function useAdjustments(
  open: boolean,
  periodId: number,
  itemId: number,
  hasAdjustment: boolean,
  tErrors: ReturnType<typeof useTranslations>,
): { adjustments: PayrollAdjustment[]; loading: boolean } {
  // null = loading/not fetched, [] = empty, [...] = has data
  const [adjustments, setAdjustments] = useState<AdjustmentsState>(null);
  const fetchedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const key = `${periodId}-${itemId}`;

    if (!open || !hasAdjustment) {
      fetchedKeyRef.current = null;
      return;
    }

    // Đã fetch rồi thì không fetch lại
    if (fetchedKeyRef.current === key) return;
    fetchedKeyRef.current = key;

    // Sử dụng AbortController để cancel request
    const controller = new AbortController();

    // Fetch data
    payrollPeriodApi
      .getPayrollItemAdjustments(periodId, itemId)
      .then((data) => {
        if (!controller.signal.aborted) {
          setAdjustments(data);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          toast.error(getErrorMessage((error as Error).message, tErrors));
          setAdjustments([]);
        }
      });

    return () => {
      controller.abort();
    };
  }, [open, periodId, itemId, hasAdjustment, tErrors]);

  // Derive loading từ adjustments state
  const result = useMemo(
    () => ({
      adjustments: adjustments ?? [],
      loading: adjustments === null && hasAdjustment && open,
    }),
    [adjustments, hasAdjustment, open],
  );

  return result;
}

/**
 * Dialog chi tiết payroll item
 * Hiển thị complete breakdown
 */
export function PayrollItemDetailDialog({
  open,
  onClose,
  periodId,
  item,
}: PayrollItemDetailDialogProps) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  // Fetch adjustments
  const hasAdjustment = !!(item.adjustmentAmount || item.status === "ADJUSTED");
  const { adjustments, loading } = useAdjustments(
    open,
    periodId,
    item.id,
    hasAdjustment,
    tErrors,
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {item.employeeName}
            <Badge variant={getItemStatusBadgeVariant(item.status)}>
              {getEnumLabel("payrollItemStatus", item.status, tEnums)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Base Salary Calculation */}
          <Section title={t("breakdown.baseSalary")}>
            <Row
              label={getEnumLabel("salaryType", item.salaryType, tEnums)}
              value={formatCurrency(item.baseSalary, locale)}
            />
            <Row
              label={t("breakdown.workingDays")}
              value={`${item.workingDays} ${tCommon("days") || "ngày"}`}
            />
            <Row
              label={t("breakdown.workingHours")}
              value={`${item.workingHours} ${tCommon("hours")}`}
            />
            {/* Hiển thị công thức tính dựa trên salary type */}
            {item.salaryType === "DAILY" && (
              <Row
                label={`${formatCurrency(item.baseSalary, locale)} × ${item.workingDays}`}
                value=""
                className="text-muted-foreground text-xs"
              />
            )}
            {item.salaryType === "HOURLY" && (
              <Row
                label={`${formatCurrency(item.baseSalary, locale)} × ${item.workingHours}h`}
                value=""
                className="text-muted-foreground text-xs"
              />
            )}
            <Row
              label={t("breakdown.baseSalary")}
              value={formatCurrency(item.calculatedBaseSalary, locale)}
              highlight
            />
          </Section>

          <Separator />

          {/* Overtime Breakdown */}
          <Section title={t("breakdown.overtime")}>
            {item.totalOvertimePay > 0 ? (
              <>
                {item.regularOvertimeMinutes > 0 && (
                  <Row
                    label={t("breakdown.regularOvertime")}
                    value={`${Math.round(item.regularOvertimeMinutes / 60)}h → ${formatCurrency(item.regularOvertimePay, locale)}`}
                  />
                )}
                {item.nightOvertimeMinutes > 0 && (
                  <Row
                    label={t("breakdown.nightOvertime")}
                    value={`${Math.round(item.nightOvertimeMinutes / 60)}h → ${formatCurrency(item.nightOvertimePay, locale)}`}
                  />
                )}
                {item.holidayOvertimeMinutes > 0 && (
                  <Row
                    label={t("breakdown.holidayOvertime")}
                    value={`${Math.round(item.holidayOvertimeMinutes / 60)}h → ${formatCurrency(item.holidayOvertimePay, locale)}`}
                  />
                )}
                {item.weekendOvertimeMinutes > 0 && (
                  <Row
                    label={t("breakdown.weekendOvertime")}
                    value={`${Math.round(item.weekendOvertimeMinutes / 60)}h → ${formatCurrency(item.weekendOvertimePay, locale)}`}
                  />
                )}
                <Row
                  label={t("breakdown.totalOvertime")}
                  value={formatCurrency(item.totalOvertimePay, locale)}
                  highlight
                  className="text-blue-600"
                />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">-</p>
            )}
          </Section>

          <Separator />

          {/* Allowances */}
          <Section title={t("breakdown.allowances")}>
            {item.allowanceDetails.length > 0 ? (
              <>
                {item.allowanceDetails.map((allowance, index) => (
                  <Row
                    key={index}
                    label={`${allowance.name}${allowance.taxable ? "" : " *"}`}
                    value={formatCurrency(allowance.amount, locale)}
                  />
                ))}
                <Row
                  label={t("breakdown.totalAllowances")}
                  value={formatCurrency(item.totalAllowances, locale)}
                  highlight
                  className="text-green-600"
                />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">-</p>
            )}
          </Section>

          <Separator />

          {/* Deductions */}
          <Section title={t("breakdown.deductions")}>
            {item.deductionDetails.length > 0 ? (
              <>
                {item.deductionDetails.map((deduction, index) => (
                  <Row
                    key={index}
                    label={deduction.name}
                    value={`-${formatCurrency(deduction.amount, locale)}`}
                    className="text-red-600"
                  />
                ))}
              </>
            ) : null}
            {/* Break Deduction */}
            {item.breakDeductionAmount > 0 && (
              <Row
                label={`${t("breakdown.breakDeduction")} (${item.totalBreakMinutes} ${tCommon("minutes")})`}
                value={`-${formatCurrency(item.breakDeductionAmount, locale)}`}
                className="text-red-600"
              />
            )}
            <Row
              label={t("breakdown.totalDeductions")}
              value={`-${formatCurrency(item.totalDeductions, locale)}`}
              highlight
              className="text-red-600"
            />
          </Section>

          <Separator />

          {/* Adjustment History */}
          {(item.status === "ADJUSTED" || item.adjustmentAmount) && (
            <>
              <Section title={t("adjustmentHistory")}>
                {loading ? (
                  <p className="text-sm text-muted-foreground">
                    {tCommon("loading")}
                  </p>
                ) : adjustments.length > 0 ? (
                  <div className="space-y-2">
                    {adjustments.map((adj) => (
                      <div
                        key={adj.id}
                        className="p-2 bg-muted rounded-md text-sm"
                      >
                        <div className="flex justify-between">
                          <span
                            className={
                              adj.amount >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {adj.amount >= 0 ? "+" : ""}
                            {formatCurrency(adj.amount, locale)}
                          </span>
                          <span className="text-muted-foreground">
                            {formatDateTime(adj.adjustedAt, locale)}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-1">
                          {adj.reason}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {adj.adjusterName}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("noAdjustments")}
                  </p>
                )}
              </Section>
              <Separator />
            </>
          )}

          {/* Gross & Net Salary with Formula */}
          <Section title={t("calculationFormula")}>
            <div className="p-3 bg-muted rounded-md text-sm font-mono">
              <p>
                {t("breakdown.grossSalary")} = {t("breakdown.baseSalary")} +{" "}
                {t("breakdown.overtime")} + {t("breakdown.allowances")}
              </p>
              <p className="mt-1">
                = {formatCurrency(item.calculatedBaseSalary, locale)} +{" "}
                {formatCurrency(item.totalOvertimePay, locale)} +{" "}
                {formatCurrency(item.totalAllowances, locale)}
              </p>
              <p className="mt-1 font-bold">
                = {formatCurrency(item.grossSalary, locale)}
              </p>
            </div>
            <div className="p-3 bg-muted rounded-md text-sm font-mono mt-2">
              <p>
                {t("breakdown.netSalary")} = {t("breakdown.grossSalary")} -{" "}
                {t("breakdown.deductions")}
                {item.adjustmentAmount
                  ? ` ${item.adjustmentAmount >= 0 ? "+" : "-"} ${t("adjustmentTitle")}`
                  : ""}
              </p>
              <p className="mt-1">
                = {formatCurrency(item.grossSalary, locale)} -{" "}
                {formatCurrency(item.totalDeductions, locale)}
                {item.adjustmentAmount
                  ? ` ${item.adjustmentAmount >= 0 ? "+" : ""} ${formatCurrency(item.adjustmentAmount, locale)}`
                  : ""}
              </p>
              <p className="mt-1 font-bold text-green-600">
                = {formatCurrency(item.netSalary, locale)}
              </p>
            </div>
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper components
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="font-medium mb-2">{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight = false,
  className = "",
}: {
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className={highlight ? "font-medium" : "text-muted-foreground"}>
        {label}
      </span>
      <span className={`${highlight ? "font-bold" : ""} ${className}`}>
        {value}
      </span>
    </div>
  );
}
