"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, ChevronRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PayrollStatusBadge,
  PaymentStatusBadge,
} from "@/app/[locale]/_components/_shared/_status-badge";
import { CurrencyDisplay } from "@/app/[locale]/_components/_shared/_currency-display";

import { payrollApi } from "@/lib/apis/payroll-api";
import { PayrollRecord } from "@/types/attendance-records";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { SupportedLocale } from "@/lib/utils/format-currency";

interface EmployeePayrollContentProps {
  employeeId: number;
}

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 12;

/**
 * Component hiển thị payroll của một employee cụ thể
 * Hiển thị theo tháng với card layout
 */
export function EmployeePayrollContent({
  employeeId,
}: EmployeePayrollContentProps) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  // State
  const [payslips, setPayslips] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch payslips
  const fetchPayslips = useCallback(async () => {
    setLoading(true);
    try {
      const response = await payrollApi.getPayrollRecords(page, DEFAULT_LIMIT, {
        employeeId,
      });
      setPayslips(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [page, employeeId, tErrors]);

  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  // Handle view detail
  const handleViewDetail = (payslip: PayrollRecord) => {
    router.push(`/${locale}/company/payroll/records/${payslip.id}`);
  };

  // Format period display
  const formatPeriod = (year: number, month: number) => {
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

  if (payslips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{t("messages.noPayslip")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Payslip Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {payslips.map((payslip) => (
          <Card
            key={payslip.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleViewDetail(payslip)}
          >
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-semibold">
                  {formatPeriod(payslip.year, payslip.month)}
                </span>
                <div className="flex gap-2">
                  <PayrollStatusBadge status={payslip.status} />
                  <PaymentStatusBadge status={payslip.paymentStatus} />
                </div>
              </div>

              {/* Net Salary */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  {t("breakdown.netSalary")}
                </p>
                <CurrencyDisplay
                  amount={payslip.netSalary}
                  locale={locale}
                  className="text-2xl font-bold text-green-600"
                />
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div>
                  <span className="text-muted-foreground">
                    {t("breakdown.baseSalary")}:
                  </span>
                  <CurrencyDisplay
                    amount={payslip.baseSalary}
                    locale={locale}
                    className="ml-1"
                  />
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("breakdown.overtime")}:
                  </span>
                  <CurrencyDisplay
                    amount={payslip.totalOvertimePay}
                    locale={locale}
                    className="ml-1"
                  />
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("breakdown.allowances")}:
                  </span>
                  <CurrencyDisplay
                    amount={payslip.totalAllowances}
                    locale={locale}
                    className="ml-1"
                  />
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("breakdown.deductions")}:
                  </span>
                  <CurrencyDisplay
                    amount={-payslip.totalDeductions}
                    locale={locale}
                    className="ml-1 text-red-600"
                    showColor
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end pt-3 border-t">
                <Button variant="ghost" size="sm">
                  {tCommon("viewDetail")}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            {tCommon("previous")}
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            {tCommon("next")}
          </Button>
        </div>
      )}
    </div>
  );
}
