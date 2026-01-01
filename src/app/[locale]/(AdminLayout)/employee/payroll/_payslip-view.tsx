"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  PayrollStatusBadge,
  PaymentStatusBadge,
} from "@/app/[locale]/_components/_shared/_status-badge";
import { OvertimeBreakdown } from "./_overtime-breakdown";

import { payrollApi } from "@/lib/apis/payroll-api";
import { PayrollRecord } from "@/types/attendance-records";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { formatDate } from "@/lib/utils/format-date";

interface PayslipViewProps {
  year: number;
  month: number;
}

/**
 * Component hiển thị chi tiết phiếu lương của nhân viên
 * Full breakdown với download PDF
 */
export function PayslipView({ year, month }: PayslipViewProps) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  // State
  const [payslip, setPayslip] = useState<PayrollRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Fetch payslip
  const fetchPayslip = useCallback(async () => {
    setLoading(true);
    try {
      const data = await payrollApi.getMyPayslipByPeriod({ year, month });
      setPayslip(data);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [year, month, tErrors]);

  useEffect(() => {
    fetchPayslip();
  }, [fetchPayslip]);

  // Handle download PDF
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await payrollApi.downloadPayslipPdf({ year, month });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payslip-${year}-${month}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(t("messages.exportSuccess"));
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setDownloading(false);
    }
  };

  // Handle back
  const handleBack = () => {
    router.push(`/${locale}/employee/payroll`);
  };

  // Format period display
  const formatPeriod = () => {
    if (locale === "ja") {
      return `${year}年${month}月`;
    }
    return `${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{tCommon("loading")}</span>
      </div>
    );
  }

  if (!payslip) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tCommon("back")}
        </Button>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t("messages.noPayslip")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tCommon("back")}
        </Button>
        <Button onClick={handleDownload} disabled={downloading}>
          <Download className="h-4 w-4 mr-2" />
          {t("actions.downloadPayslip")}
        </Button>
      </div>

      {/* Period & Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{formatPeriod()}</CardTitle>
            <div className="flex gap-2">
              <PayrollStatusBadge status={payslip.status} />
              <PaymentStatusBadge status={payslip.paymentStatus} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {payslip.paidAt && (
            <p className="text-sm text-muted-foreground">
              {t("table.paidAt")}: {formatDate(payslip.paidAt, locale)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Net Salary Highlight */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">
            {t("breakdown.netSalary")}
          </p>
          <p className="text-4xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(payslip.netSalary, locale)}
          </p>
        </CardContent>
      </Card>

      {/* Salary Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Base Salary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t("breakdown.baseSalary")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <BreakdownRow
              label={t("breakdown.baseSalary")}
              value={formatCurrency(payslip.baseSalary, locale)}
              highlight
            />
          </CardContent>
        </Card>

        {/* Overtime Breakdown - Collapsible */}
        <OvertimeBreakdown
          regularMinutes={payslip.regularMinutes}
          regularOvertimeMinutes={payslip.regularOvertimeMinutes}
          nightMinutes={payslip.nightMinutes}
          nightOvertimeMinutes={payslip.nightOvertimeMinutes}
          holidayMinutes={payslip.holidayMinutes}
          holidayNightMinutes={payslip.holidayNightMinutes}
          regularOvertimePay={payslip.regularOvertimePay}
          nightWorkPay={payslip.nightWorkPay}
          nightOvertimePay={payslip.nightOvertimePay}
          holidayOvertimePay={payslip.holidayOvertimePay}
          holidayNightOvertimePay={payslip.holidayNightOvertimePay}
          totalOvertimePay={payslip.totalOvertimePay}
          locale={locale}
        />

        {/* Allowances */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t("breakdown.allowances")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {payslip.allowanceDetails.length === 0 ? (
              <p className="text-muted-foreground text-sm">-</p>
            ) : (
              payslip.allowanceDetails.map((item, index) => (
                <BreakdownRow
                  key={index}
                  label={item.name}
                  value={formatCurrency(item.amount, locale)}
                />
              ))
            )}
            <Separator />
            <BreakdownRow
              label={t("breakdown.totalAllowances")}
              value={formatCurrency(payslip.totalAllowances, locale)}
              highlight
            />
          </CardContent>
        </Card>

        {/* Deductions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t("breakdown.deductions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {payslip.deductionDetails.length === 0 &&
            payslip.breakDeductionAmount === 0 ? (
              <p className="text-muted-foreground text-sm">-</p>
            ) : (
              <>
                {payslip.deductionDetails.map((item, index) => (
                  <BreakdownRow
                    key={index}
                    label={item.name}
                    value={`-${formatCurrency(item.amount, locale)}`}
                    negative
                  />
                ))}
                {payslip.breakDeductionAmount > 0 && (
                  <BreakdownRow
                    label={t("breakdown.breakDeduction")}
                    value={`-${formatCurrency(payslip.breakDeductionAmount, locale)}`}
                    negative
                  />
                )}
              </>
            )}
            <Separator />
            <BreakdownRow
              label={t("breakdown.totalDeductions")}
              value={`-${formatCurrency(payslip.totalDeductions, locale)}`}
              highlight
              negative
            />
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{tCommon("total")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <BreakdownRow
              label={t("breakdown.grossSalary")}
              value={formatCurrency(payslip.grossSalary, locale)}
            />
            <BreakdownRow
              label={t("breakdown.totalDeductions")}
              value={`-${formatCurrency(payslip.totalDeductions, locale)}`}
              negative
            />
            <Separator />
            <BreakdownRow
              label={t("breakdown.netSalary")}
              value={formatCurrency(payslip.netSalary, locale)}
              highlight
              large
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Component hiển thị một dòng breakdown
 */
interface BreakdownRowProps {
  label: string;
  value: string;
  subLabel?: string;
  highlight?: boolean;
  negative?: boolean;
  large?: boolean;
}

function BreakdownRow({
  label,
  value,
  subLabel,
  highlight,
  negative,
  large,
}: BreakdownRowProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <span
          className={`${highlight ? "font-semibold" : ""} ${large ? "text-lg" : ""}`}
        >
          {label}
        </span>
        {subLabel && (
          <span className="text-sm text-muted-foreground ml-2">
            ({subLabel})
          </span>
        )}
      </div>
      <span
        className={`
          tabular-nums
          ${highlight ? "font-bold" : ""}
          ${large ? "text-xl" : ""}
          ${negative ? "text-red-600 dark:text-red-400" : ""}
          ${!negative && highlight ? "text-green-600 dark:text-green-400" : ""}
        `}
      >
        {value}
      </span>
    </div>
  );
}
