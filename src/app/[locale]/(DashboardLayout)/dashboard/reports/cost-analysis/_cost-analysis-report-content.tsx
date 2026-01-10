"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
import { ReportChart } from "../_report-chart";
import { ReportExportButtons } from "../_report-export-buttons";
import { reportApi, CostAnalysisReportData } from "@/lib/apis/report-api";
import { ReportFilters, ChartData } from "@/types/attendance-records";
import { formatCurrency } from "@/lib/utils/format-currency";

/**
 * Component hiển thị báo cáo phân tích chi phí
 */
export function CostAnalysisReportContent() {
  const t = useTranslations("reports");

  // State
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), 0, 1),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const [reportData, setReportData] = useState<CostAnalysisReportData | null>(
    null,
  );
  const [chartData, setChartData] = useState<ChartData | null>(null);
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
      const data = await reportApi.getCostAnalysisReport(filters);
      const chart = await reportApi.getCostAnalysisChartData(filters);
      setReportData(data);
      setChartData(chart);
      toast.success(t("messages.generateSuccess"));
    } catch {
      toast.error(t("messages.generateError"));
    } finally {
      setIsLoading(false);
    }
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Filters Card */}
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

            <div className="flex items-end">
              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full"
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
            </div>
          </div>

          {/* Export Buttons */}
          {reportData && (
            <ReportExportButtons
              reportType="cost-analysis"
              filters={getFilters()}
              disabled={!reportData}
            />
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
            <span className="ml-2">{t("table.loading")}</span>
          </CardContent>
        </Card>
      ) : reportData ? (
        <Tabs defaultValue="breakdown">
          <TabsList>
            <TabsTrigger value="breakdown">
              {t("costAnalysis.breakdownTitle")}
            </TabsTrigger>
            <TabsTrigger value="trends">
              {t("costAnalysis.trendsTitle")}
            </TabsTrigger>
            {chartData && (
              <TabsTrigger value="chart">{t("chart.title")}</TabsTrigger>
            )}
            <TabsTrigger value="summary">{t("summary.title")}</TabsTrigger>
          </TabsList>

          {/* Breakdown View */}
          <TabsContent value="breakdown">
            <Card>
              <CardContent className="pt-6">
                {reportData.breakdown.length === 0 ? (
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
                            {t("costAnalysis.columnCategory")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("costAnalysis.columnAmount")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("costAnalysis.columnPercentage")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.breakdown.map((item, index) => (
                          <TableRow key={item.category}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">
                              {item.category}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.amount)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatPercentage(item.percentage)}
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

          {/* Trends View */}
          <TabsContent value="trends">
            <Card>
              <CardContent className="pt-6">
                {reportData.trends.length === 0 ? (
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
                            {t("costAnalysis.columnPeriod")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("costAnalysis.columnBaseSalary")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("costAnalysis.columnOvertime")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("costAnalysis.columnAllowances")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("costAnalysis.columnTotal")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.trends.map((trend, index) => (
                          <TableRow key={trend.period}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">
                              {trend.period}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(trend.baseSalary)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(trend.overtime)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(trend.allowances)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(trend.total)}
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

          {/* Chart View */}
          {chartData && (
            <TabsContent value="chart">
              <Card>
                <CardContent className="pt-6">
                  <ReportChart data={chartData} type="line" />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Summary View */}
          <TabsContent value="summary">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("costAnalysis.summaryTotalCost")}
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(reportData.summary.totalCost)}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("costAnalysis.summaryBaseSalaryPct")}
                    </p>
                    <p className="text-2xl font-bold">
                      {formatPercentage(
                        reportData.summary.baseSalaryPercentage,
                      )}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("costAnalysis.summaryOvertimePct")}
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatPercentage(reportData.summary.overtimePercentage)}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("costAnalysis.summaryAllowancesPct")}
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPercentage(
                        reportData.summary.allowancesPercentage,
                      )}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("costAnalysis.summaryCostPerEmployee")}
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(reportData.summary.costPerEmployee)}
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
