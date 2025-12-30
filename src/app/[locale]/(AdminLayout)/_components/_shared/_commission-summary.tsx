"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  CommissionSummaryResponse,
  CommissionOverallSummaryResponse,
  CommissionMonthSummary,
  CommissionEmployeeSummary,
} from "@/types/commission";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatMonth } from "@/lib/utils/format-date";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface CommissionSummaryProps {
  /** Hàm fetch summary data, khác nhau giữa admin và employee */
  fetchSummary: () => Promise<
    CommissionSummaryResponse | CommissionOverallSummaryResponse
  >;
  /** Trigger refresh khi cần */
  refreshTrigger?: number;
}

/**
 * Component hiển thị tổng hợp hoa hồng dùng chung cho admin và employee
 * - Admin: truyền commissionApi.getSummary (có byEmployee)
 * - Employee: truyền commissionApi.getMySummary
 */
export function CommissionSummary({
  fetchSummary,
  refreshTrigger,
}: CommissionSummaryProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("commissions");
  const tCommon = useTranslations("common");
  const [summary, setSummary] = useState<
    CommissionSummaryResponse | CommissionOverallSummaryResponse | null
  >(null);
  const [loading, setLoading] = useState(true);

  // Xử lý click vào nhân viên
  const handleEmployeeClick = (employeeCode: string) => {
    router.push(`/${locale}/tamabee/commissions/employee/${employeeCode}`);
  };

  // Fetch summary data
  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await fetchSummary();
      setSummary(data);
    } catch (error) {
      console.error("Failed to fetch commission summary:", error);
      toast.error(t("messages.loadSummaryError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Empty state
  if (!summary) {
    return (
      <div className="rounded-lg border p-6 text-center text-muted-foreground">
        {tCommon("noData")}
      </div>
    );
  }

  // Type guard để check admin view
  const isOverallSummary = (
    s: CommissionSummaryResponse | CommissionOverallSummaryResponse,
  ): s is CommissionOverallSummaryResponse => {
    return "totalEligible" in s && "byEmployee" in s;
  };

  const overallSummary = isOverallSummary(summary) ? summary : null;

  return (
    <div className="space-y-6">
      {/* Summary Stats - 4 columns */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="py-2">
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("pendingAmount")}
            </p>
            <p className="text-2xl font-bold text-yellow-500">
              {formatCurrency(
                overallSummary
                  ? overallSummary.totalPending
                  : (summary as CommissionSummaryResponse).pendingAmount || 0,
                "vi",
              )}
            </p>
          </CardContent>
        </Card>

        {overallSummary && (
          <Card className="py-2">
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("eligibleAmount")}
              </p>
              <p className="text-2xl font-bold text-blue-400">
                {formatCurrency(overallSummary.totalEligible || 0, "vi")}
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="py-2">
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("paidAmount")}</p>
            <p className="text-2xl font-bold text-green-500">
              {formatCurrency(
                overallSummary
                  ? overallSummary.totalPaid
                  : (summary as CommissionSummaryResponse).paidAmount || 0,
                "vi",
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="py-2">
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("totalCommission")}
            </p>
            <p className="text-2xl font-bold">
              {formatCurrency(
                overallSummary
                  ? overallSummary.totalAmount
                  : (summary as CommissionSummaryResponse).totalAmount || 0,
                "vi",
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Summary Table - chỉ hiển thị cho admin */}
      {overallSummary?.byEmployee && overallSummary.byEmployee.length > 0 && (
        <div className="rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">{t("summary.byEmployee")}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">
                    {t("summary.employee")}
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    {t("summary.count")}
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    {t("pendingAmount")}
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    {t("eligibleAmount")}
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    {t("paidAmount")}
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    {tCommon("total")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {overallSummary.byEmployee.map(
                  (emp: CommissionEmployeeSummary) => (
                    <tr
                      key={emp.employeeCode}
                      className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleEmployeeClick(emp.employeeCode)}
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-primary hover:underline">
                            {emp.employeeName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {emp.employeeCode}
                          </p>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">
                        <Badge variant="secondary">{emp.count}</Badge>
                      </td>
                      <td className="text-right py-3 px-4 text-yellow-500">
                        {formatCurrency(emp.totalPending || 0, "vi")}
                      </td>
                      <td className="text-right py-3 px-4 text-blue-400">
                        {formatCurrency(emp.totalEligible || 0, "vi")}
                      </td>
                      <td className="text-right py-3 px-4 text-green-500">
                        {formatCurrency(emp.totalPaid || 0, "vi")}
                      </td>
                      <td className="text-right py-3 px-4 font-medium">
                        {formatCurrency(emp.totalAmount || 0, "vi")}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly Summary Table */}
      {overallSummary?.byMonth && overallSummary.byMonth.length > 0 && (
        <div className="rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">{t("summary.byMonth")}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">
                    {t("summary.month")}
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    {t("summary.count")}
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    {t("eligibleAmount")}
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    {t("paidAmount")}
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    {tCommon("total")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {overallSummary.byMonth.map(
                  (monthData: CommissionMonthSummary, index: number) => (
                    <tr
                      key={index}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
                      <td className="py-3 px-4 font-medium">
                        {formatMonth(monthData.month)}
                      </td>
                      <td className="text-right py-3 px-4">
                        <Badge variant="secondary">{monthData.count}</Badge>
                      </td>
                      <td className="text-right py-3 px-4 text-yellow-500">
                        {formatCurrency(monthData.totalPending || 0, "vi")}
                      </td>
                      <td className="text-right py-3 px-4 text-green-500">
                        {formatCurrency(monthData.totalPaid || 0, "vi")}
                      </td>
                      <td className="text-right py-3 px-4 font-medium">
                        {formatCurrency(monthData.totalAmount || 0, "vi")}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
