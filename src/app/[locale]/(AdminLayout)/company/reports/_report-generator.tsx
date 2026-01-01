"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ReportChart } from "./_report-chart";
import {
  reportApi,
  ReportType,
  exportCsv,
  exportPdf,
} from "@/lib/apis/report-api";
import {
  ReportData,
  ReportFilters,
  ChartData,
} from "@/types/attendance-records";
import { formatCurrency } from "@/lib/utils/format-currency";

/**
 * Component tạo và xuất báo cáo
 * Hỗ trợ các loại báo cáo: attendance, payroll, leave
 */
export function ReportGenerator() {
  const t = useTranslations("reports");
  const tCommon = useTranslations("common");

  // State
  const [reportType, setReportType] = useState<ReportType>("attendance");
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [employeeId] = useState<string>("");
  const [status, setStatus] = useState<string>("all");

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Tạo filters từ state
  const getFilters = (): ReportFilters => ({
    startDate: startDate ? startDate.toISOString().split("T")[0] : "",
    endDate: endDate ? endDate.toISOString().split("T")[0] : "",
    employeeId: employeeId ? parseInt(employeeId) : undefined,
    status: status === "all" ? undefined : status,
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
      let data: ReportData;
      let chart: ChartData | null = null;

      switch (reportType) {
        case "attendance":
          data = await reportApi.getAttendanceReport(filters);
          chart = await reportApi.getAttendanceChartData(filters);
          break;
        case "payroll":
          data = await reportApi.getPayrollReport(filters);
          chart = await reportApi.getPayrollChartData(filters);
          break;
        case "leave":
          data = await reportApi.getLeaveReport(filters);
          break;
        default:
          data = await reportApi.generateReport({ reportType, filters });
      }

      setReportData(data);
      setChartData(chart);
      toast.success(t("messages.generateSuccess"));
    } catch {
      toast.error(t("messages.generateError"));
    } finally {
      setIsLoading(false);
    }
  };

  // Xuất CSV
  const handleExportCsv = async () => {
    if (!reportData || reportData.rows.length === 0) {
      toast.error(t("messages.noDataToExport"));
      return;
    }

    setIsExporting(true);
    try {
      const blob = await exportCsv(reportType, getFilters());
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(t("messages.exportSuccess"));
    } catch {
      toast.error(t("messages.exportError"));
    } finally {
      setIsExporting(false);
    }
  };

  // Xuất PDF
  const handleExportPdf = async () => {
    if (!reportData || reportData.rows.length === 0) {
      toast.error(t("messages.noDataToExport"));
      return;
    }

    setIsExporting(true);
    try {
      const blob = await exportPdf(reportType, getFilters());
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(t("messages.exportSuccess"));
    } catch {
      toast.error(t("messages.exportError"));
    } finally {
      setIsExporting(false);
    }
  };

  // Format cell value
  const formatCellValue = (value: string | number, header: string): string => {
    if (typeof value === "number") {
      // Nếu là cột tiền tệ
      if (
        header.toLowerCase().includes("salary") ||
        header.toLowerCase().includes("amount") ||
        header.toLowerCase().includes("pay")
      ) {
        return formatCurrency(value, "ja");
      }
      return value.toLocaleString();
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t("selectReportType")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Report Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("selectReportType")}
              </label>
              <Select
                value={reportType}
                onValueChange={(v) => setReportType(v as ReportType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">
                    {t("reportTypes.attendance")}
                  </SelectItem>
                  <SelectItem value="payroll">
                    {t("reportTypes.payroll")}
                  </SelectItem>
                  <SelectItem value="leave">
                    {t("reportTypes.leave")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("filters.status")}
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={t("filters.allStatuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("filters.allStatuses")}
                  </SelectItem>
                  {reportType === "attendance" && (
                    <>
                      <SelectItem value="PRESENT">Present</SelectItem>
                      <SelectItem value="ABSENT">Absent</SelectItem>
                      <SelectItem value="LEAVE">Leave</SelectItem>
                    </>
                  )}
                  {reportType === "payroll" && (
                    <>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="FINALIZED">Finalized</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  {t("actions.generating")}
                </>
              ) : (
                t("actions.generate")
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCsv}
              disabled={isExporting || !reportData}
            >
              {isExporting ? t("actions.exporting") : t("actions.exportCsv")}
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPdf}
              disabled={isExporting || !reportData}
            >
              {isExporting ? t("actions.exporting") : t("actions.exportPdf")}
            </Button>
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
            {reportData.summary && (
              <TabsTrigger value="summary">{t("summary.title")}</TabsTrigger>
            )}
          </TabsList>

          {/* Table View */}
          <TabsContent value="table">
            <Card>
              <CardContent className="pt-6">
                {reportData.rows.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("table.noData")}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">#</TableHead>
                          {reportData.headers.map((header, index) => (
                            <TableHead key={index}>{header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.rows.map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            <TableCell>{rowIndex + 1}</TableCell>
                            {row.map((cell, cellIndex) => (
                              <TableCell key={cellIndex}>
                                {formatCellValue(
                                  cell,
                                  reportData.headers[cellIndex],
                                )}
                              </TableCell>
                            ))}
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
          {reportData.summary && (
            <TabsContent value="summary">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(reportData.summary).map(([key, value]) => (
                      <div key={key} className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          {t(`summary.${key}` as never) || key}
                        </p>
                        <p className="text-2xl font-bold">
                          {typeof value === "number"
                            ? value.toLocaleString()
                            : value}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      ) : null}
    </div>
  );
}
