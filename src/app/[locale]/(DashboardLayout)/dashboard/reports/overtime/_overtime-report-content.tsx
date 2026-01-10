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
import { reportApi, OvertimeReportData } from "@/lib/apis/report-api";
import { ReportFilters, ChartData } from "@/types/attendance-records";
import { formatCurrency } from "@/lib/utils/format-currency";

/**
 * Component hiển thị báo cáo tăng ca chi tiết
 */
export function OvertimeReportContent() {
  const t = useTranslations("reports");
  const tCommon = useTranslations("common");

  // State
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const [reportData, setReportData] = useState<OvertimeReportData | null>(null);
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
      const data = await reportApi.getOvertimeReport(filters);
      const chart = await reportApi.getOvertimeChartData(filters);

      setReportData(data);
      setChartData(chart);
      toast.success(t("messages.generateSuccess"));
    } catch {
      toast.error(t("messages.generateError"));
    } finally {
      setIsLoading(false);
    }
  };

  // Format minutes to hours:minutes
  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
                reportType="overtime"
                filters={getFilters()}
                disabled={!reportData || reportData.employees.length === 0}
              />
            </div>
          </div>
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
        <Tabs defaultValue="table">
          <TabsList>
            <TabsTrigger value="table">{tCommon("details")}</TabsTrigger>
            {chartData && (
              <TabsTrigger value="chart">{t("chart.title")}</TabsTrigger>
            )}
            <TabsTrigger value="summary">{t("summary.title")}</TabsTrigger>
          </TabsList>

          {/* Table View */}
          <TabsContent value="table">
            <Card>
              <CardContent className="pt-6">
                {reportData.employees.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("table.noData")}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">#</TableHead>
                          <TableHead>{t("overtime.columnEmployee")}</TableHead>
                          <TableHead className="text-right">
                            {t("overtime.columnRegular")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("overtime.columnNight")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("overtime.columnHoliday")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("overtime.columnWeekend")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("overtime.columnTotal")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("overtime.columnPay")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.employees.map((emp, index) => (
                          <TableRow key={emp.employeeId}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">
                              {emp.employeeName}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatMinutes(emp.regularOvertimeMinutes)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatMinutes(emp.nightOvertimeMinutes)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatMinutes(emp.holidayOvertimeMinutes)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatMinutes(emp.weekendOvertimeMinutes)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatMinutes(emp.totalOvertimeMinutes)}
                            </TableCell>
                            <TableCell className="text-right text-green-600 font-medium">
                              {formatCurrency(emp.totalOvertimePay)}
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
                  <ReportChart data={chartData} type="bar" />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Summary View */}
          <TabsContent value="summary">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("overtime.summaryTotalEmployees")}
                    </p>
                    <p className="text-2xl font-bold">
                      {reportData.summary.totalEmployees}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("overtime.summaryTotalRegular")}
                    </p>
                    <p className="text-2xl font-bold">
                      {formatMinutes(reportData.summary.totalRegularOvertime)}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("overtime.summaryTotalNight")}
                    </p>
                    <p className="text-2xl font-bold">
                      {formatMinutes(reportData.summary.totalNightOvertime)}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("overtime.summaryTotalHoliday")}
                    </p>
                    <p className="text-2xl font-bold">
                      {formatMinutes(reportData.summary.totalHolidayOvertime)}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("overtime.summaryTotalWeekend")}
                    </p>
                    <p className="text-2xl font-bold">
                      {formatMinutes(reportData.summary.totalWeekendOvertime)}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("overtime.summaryTotalMinutes")}
                    </p>
                    <p className="text-2xl font-bold">
                      {formatMinutes(reportData.summary.totalOvertimeMinutes)}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg col-span-2">
                    <p className="text-sm text-muted-foreground">
                      {t("overtime.summaryTotalPay")}
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(reportData.summary.totalOvertimePay)}
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
