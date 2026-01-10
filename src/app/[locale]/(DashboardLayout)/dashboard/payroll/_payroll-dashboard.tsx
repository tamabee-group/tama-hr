"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { payrollApi } from "@/lib/apis/payroll-api";
import { PayrollSummary, YearMonth } from "@/types/attendance-records";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { PayrollPreviewTable } from "./_payroll-preview-table";

/**
 * Component tổng quan bảng lương
 * Hiển thị summary cards, period selector và preview table
 */
export function PayrollDashboard() {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  // State
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<YearMonth>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  // Tạo danh sách periods (12 tháng gần nhất)
  const periods = generatePeriods();

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await payrollApi.getPayrollSummary(selectedPeriod);
      setSummary(data);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, tErrors]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Handle period change
  const handlePeriodChange = (value: string) => {
    const [year, month] = value.split("-").map(Number);
    setSelectedPeriod({ year, month });
  };

  // Handle view period detail
  const handleViewPeriodDetail = () => {
    const periodStr = `${selectedPeriod.year}-${String(selectedPeriod.month).padStart(2, "0")}`;
    router.push(`/${locale}/dashboard/payroll/${periodStr}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{tCommon("loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{t("selectPeriod")}:</span>
          <Select
            value={`${selectedPeriod.year}-${selectedPeriod.month}`}
            onValueChange={handlePeriodChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem
                  key={`${period.year}-${period.month}`}
                  value={`${period.year}-${period.month}`}
                >
                  {formatPeriodLabel(period, locale)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={handleViewPeriodDetail}>
          {tCommon("details")}
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="py-2">
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("summary.totalEmployees")}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {summary.totalEmployees ?? 0}
              </p>
            </CardContent>
          </Card>

          <Card className="py-2">
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("summary.totalPayroll")}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalNetSalary ?? 0)}
              </p>
            </CardContent>
          </Card>

          <Card className="py-2">
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("summary.pendingPayments")}
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {summary.pendingCount ?? 0}
              </p>
            </CardContent>
          </Card>

          <Card className="py-2">
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("summary.paidPayments")}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {summary.paidCount ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payroll Preview Table */}
      <PayrollPreviewTable period={selectedPeriod} onRefresh={fetchSummary} />
    </div>
  );
}

/**
 * Tạo danh sách 12 tháng gần nhất
 */
function generatePeriods(): YearMonth[] {
  const periods: YearMonth[] = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    });
  }

  return periods;
}

/**
 * Format period label theo locale
 */
function formatPeriodLabel(period: YearMonth, locale: string): string {
  const date = new Date(period.year, period.month - 1, 1);

  if (locale === "ja") {
    return `${period.year}年${period.month}月`;
  }

  return date.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "long",
  });
}
