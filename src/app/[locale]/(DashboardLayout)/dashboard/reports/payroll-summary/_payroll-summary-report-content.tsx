"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { ReportExportButtons } from "../_report-export-buttons";
import { reportApi, PayrollSummaryReportData } from "@/lib/apis/report-api";
import { ReportFilters } from "@/types/attendance-records";
import { formatCurrency } from "@/lib/utils/format-currency";
import { getEnumLabel } from "@/lib/utils/get-enum-label";

/**
 * Component hiển thị báo cáo tổng hợp lương
 */
export function PayrollSummaryReportContent() {
  const t = useTranslations("reports");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  // State
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), 0, 1),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const [reportData, setReportData] = useState<PayrollSummaryReportData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  // Tạo filters từ state
  const getFilters = (): ReportFilters => ({
    startDate: startDate ? startDate.toISOString().split("T")[0] : "",
    endDate: endDate ? endDate.toISOString().split("T")[0] : "",
  });

  // Tạo báo cáo
  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      toast.error(t("messages.selectDateRange"));
      return;
    }

    setIsLoading(true);
    try {
      const filters = getFilters();
      const data = await reportApi.getPayrollSummaryReport(filters);
      setReportData(data);
      toast.success(t("messages.generateSuccess"));
    } catch {
      toast.error(t("messages.generateError"));
    } finally {
      setIsLoading(false);
    }
  };

  // Format period
  const formatPeriod = (year: number, month: number): string => {
    return `${year}/${String(month).padStart(2, "0")}`;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const label = getEnumLabel("payrollPeriodStatus", status, tEnums);
    switch (status) {
      case "PAID":
        return <Badge variant="default">{label}</Badge>;
      case "APPROVED":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {label}
          </Badge>
        );
      case "REVIEWING":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            {label}
          </Badge>
        );
      default:
        return <Badge variant="outline">{label}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("filters.dateRange")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("filters.startDate")}
              </label>
              <DatePicker value={startDate} onChange={setStartDate} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("filters.endDate")}
              </label>
              <DatePicker value={endDate} onChange={setEndDate} />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    {t("actions.generating")}
                  </>
                ) : (
                  t("actions.generate")
                )}
              </Button>
              <ReportExportButtons
                reportType="payroll-summary"
                filters={getFilters()}
                disabled={!reportData || reportData.periods.length === 0}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
            <span className="ml-2">{t("table.loading")}</span>
          </CardContent>
        </Card>
      ) : reportData ? (
        <Tabs defaultValue="table">
          <TabsList>
            <TabsTrigger value="table">{tCommon("details")}</TabsTrigger>
            <TabsTrigger value="summary">{t("summary.title")}</TabsTrigger>
          </TabsList>
          <TabsContent value="table">
            <Card>
              <CardContent className="pt-6">
                {reportData.periods.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("table.noData")}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">#</TableHead>
                          <TableHead>
                            {t("payrollSummary.columnPeriod")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("payrollSummary.columnEmployees")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("payrollSummary.columnBaseSalary")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("payrollSummary.columnOvertimePay")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("payrollSummary.columnAllowances")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("payrollSummary.columnDeductions")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("payrollSummary.columnGross")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("payrollSummary.columnNet")}
                          </TableHead>
                          <TableHead className="text-center">
                            {t("payrollSummary.columnStatus")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.periods.map((period, index) => (
                          <TableRow key={`${period.year}-${period.month}`}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">
                              {formatPeriod(period.year, period.month)}
                            </TableCell>
                            <TableCell className="text-right">
                              {period.totalEmployees}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(period.totalBaseSalary)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(period.totalOvertimePay)}
                            </TableCell>
                            <TableCell className="text-right text-green-600">
                              {formatCurrency(period.totalAllowances)}
                            </TableCell>
                            <TableCell className="text-right text-red-600">
                              {formatCurrency(period.totalDeductions)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(period.totalGrossSalary)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-blue-600">
                              {formatCurrency(period.totalNetSalary)}
                            </TableCell>
                            <TableCell className="text-center">
                              {getStatusBadge(period.status)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("payrollSummary.summaryTotalPeriods")}
                    </p>
                    <p className="text-2xl font-bold">
                      {reportData.summary.totalPeriods}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("payrollSummary.summaryGrandTotalGross")}
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(reportData.summary.grandTotalGross)}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("payrollSummary.summaryGrandTotalNet")}
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(reportData.summary.grandTotalNet)}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("payrollSummary.summaryAveragePerEmployee")}
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(reportData.summary.averagePerEmployee)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
}
