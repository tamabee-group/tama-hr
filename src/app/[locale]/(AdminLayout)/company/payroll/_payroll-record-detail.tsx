"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  PayrollStatusBadge,
  PaymentStatusBadge,
} from "@/app/[locale]/_components/_shared/_status-badge";

import { payrollApi } from "@/lib/apis/payroll-api";
import { PayrollRecord } from "@/types/attendance-records";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { getErrorMessage } from "@/lib/utils/get-error-message";

interface PayrollRecordDetailProps {
  recordId: number;
}

/**
 * Component chi tiết bản ghi lương
 * Hiển thị full breakdown của payroll record
 */
export function PayrollRecordDetail({ recordId }: PayrollRecordDetailProps) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  // State
  const [record, setRecord] = useState<PayrollRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Fetch record
  const fetchRecord = useCallback(async () => {
    setLoading(true);
    try {
      const data = await payrollApi.getPayrollById(recordId);
      setRecord(data);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [recordId, tErrors]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  // Handle download payslip
  const handleDownload = async () => {
    if (!record) return;
    setDownloading(true);
    try {
      const blob = await payrollApi.downloadPayslipPdf({
        year: record.year,
        month: record.month,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payslip-${record.year}-${record.month}.pdf`;
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
    router.back();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{tCommon("loading")}</span>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{t("messages.noPayslip")}</span>
      </div>
    );
  }

  // Calculate gross salary for verification (used for display comparison)
  const calculatedGross =
    record.baseSalary + record.totalOvertimePay + record.totalAllowances;
  void calculatedGross; // Suppress unused warning - kept for future verification display

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

      {/* Employee Info */}
      <Card>
        <CardHeader>
          <CardTitle>{record.employeeName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <span className="text-sm text-muted-foreground">
                {t("period")}:
              </span>
              <span className="ml-2 font-medium">
                {record.month}/{record.year}
              </span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                {t("table.status")}:
              </span>
              <span className="ml-2">
                <PayrollStatusBadge status={record.status} />
              </span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                {t("table.paymentStatus")}:
              </span>
              <span className="ml-2">
                <PaymentStatusBadge status={record.paymentStatus} />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Base & Overtime */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t("breakdown.baseSalary")} & {t("breakdown.overtime")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <BreakdownRow
              label={t("breakdown.baseSalary")}
              value={formatCurrency(record.baseSalary, locale)}
            />
            <Separator />
            <BreakdownRow
              label={t("breakdown.regularOvertime")}
              value={formatCurrency(record.regularOvertimePay, locale)}
              subLabel={`${Math.round(record.regularOvertimeMinutes / 60)}h`}
            />
            <BreakdownRow
              label={t("breakdown.nightWork")}
              value={formatCurrency(record.nightWorkPay, locale)}
              subLabel={`${Math.round(record.nightMinutes / 60)}h`}
            />
            <BreakdownRow
              label={t("breakdown.nightOvertime")}
              value={formatCurrency(record.nightOvertimePay, locale)}
              subLabel={`${Math.round(record.nightOvertimeMinutes / 60)}h`}
            />
            {record.holidayOvertimePay > 0 && (
              <BreakdownRow
                label={t("breakdown.holidayOvertime")}
                value={formatCurrency(record.holidayOvertimePay, locale)}
              />
            )}
            {record.holidayNightOvertimePay > 0 && (
              <BreakdownRow
                label={t("breakdown.holidayNightOvertime")}
                value={formatCurrency(record.holidayNightOvertimePay, locale)}
              />
            )}
            <Separator />
            <BreakdownRow
              label={t("breakdown.totalOvertime")}
              value={formatCurrency(record.totalOvertimePay, locale)}
              highlight
            />
          </CardContent>
        </Card>

        {/* Allowances */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t("breakdown.allowances")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {record.allowanceDetails.length === 0 ? (
              <p className="text-muted-foreground text-sm">-</p>
            ) : (
              record.allowanceDetails.map((item, index) => (
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
              value={formatCurrency(record.totalAllowances, locale)}
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
            {record.deductionDetails.length === 0 ? (
              <p className="text-muted-foreground text-sm">-</p>
            ) : (
              record.deductionDetails.map((item, index) => (
                <BreakdownRow
                  key={index}
                  label={item.name}
                  value={`-${formatCurrency(item.amount, locale)}`}
                  negative
                />
              ))
            )}
            {record.breakDeductionAmount > 0 && (
              <BreakdownRow
                label={t("breakdown.breakDeduction")}
                value={`-${formatCurrency(record.breakDeductionAmount, locale)}`}
                negative
              />
            )}
            <Separator />
            <BreakdownRow
              label={t("breakdown.totalDeductions")}
              value={`-${formatCurrency(record.totalDeductions, locale)}`}
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
              value={formatCurrency(record.grossSalary, locale)}
            />
            <BreakdownRow
              label={t("breakdown.totalDeductions")}
              value={`-${formatCurrency(record.totalDeductions, locale)}`}
              negative
            />
            <Separator />
            <BreakdownRow
              label={t("breakdown.netSalary")}
              value={formatCurrency(record.netSalary, locale)}
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
          ${highlight ? "font-bold" : ""}
          ${large ? "text-xl" : ""}
          ${negative ? "text-red-600" : ""}
          ${!negative && highlight ? "text-green-600" : ""}
        `}
      >
        {value}
      </span>
    </div>
  );
}
