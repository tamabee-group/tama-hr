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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { reportApi, exportBreakReportCsv } from "@/lib/apis/report-api";
import { BreakReportData } from "@/types/attendance-records";
import { BreakReportExpandable } from "./_break-report-expandable";

/**
 * Component hiển thị báo cáo giờ giải lao
 * Hỗ trợ báo cáo theo ngày và theo tháng
 */
export function BreakReportContent() {
  const t = useTranslations("reports");
  const tCommon = useTranslations("common");

  // State
  const [reportType, setReportType] = useState<"daily" | "monthly">("daily");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1,
  );
  const [complianceFilter, setComplianceFilter] = useState<string>("");

  const [reportData, setReportData] = useState<BreakReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Toggle expand/collapse cho một row
  const toggleRow = (employeeId: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  // Tạo báo cáo
  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      let data: BreakReportData;

      if (reportType === "daily") {
        if (!selectedDate) {
          toast.error(t("messages.selectDateRange"));
          return;
        }
        const dateStr = selectedDate.toISOString().split("T")[0];
        data = await reportApi.getDailyBreakReport(dateStr);
      } else {
        data = await reportApi.getMonthlyBreakReport(
          selectedYear,
          selectedMonth,
        );
      }

      setReportData(data);
      toast.success(t("messages.generateSuccess"));
    } catch {
      toast.error(t("messages.generateError"));
    } finally {
      setIsLoading(false);
    }
  };

  // Xuất CSV
  const handleExportCsv = async () => {
    if (!reportData || reportData.employees.length === 0) {
      toast.error(t("messages.noDataToExport"));
      return;
    }

    setIsExporting(true);
    try {
      const blob = await exportBreakReportCsv(
        reportType,
        reportType === "daily"
          ? selectedDate?.toISOString().split("T")[0]
          : undefined,
        reportType === "monthly" ? selectedYear : undefined,
        reportType === "monthly" ? selectedMonth : undefined,
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `break-report-${reportType}-${new Date().toISOString().split("T")[0]}.csv`;
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

  // Format minutes to hours:minutes
  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Lọc dữ liệu theo compliance
  const filteredEmployees =
    reportData?.employees.filter((emp) => {
      if (!complianceFilter) return true;
      if (complianceFilter === "compliant") return emp.isCompliant;
      if (complianceFilter === "non-compliant") return !emp.isCompliant;
      return true;
    }) || [];

  // Tạo danh sách năm
  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i,
  );

  // Tạo danh sách tháng
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t("break.selectPeriod")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Report Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("break.reportType")}
              </label>
              <Select
                value={reportType}
                onValueChange={(v) => setReportType(v as "daily" | "monthly")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t("break.daily")}</SelectItem>
                  <SelectItem value="monthly">{t("break.monthly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date/Month Selection */}
            {reportType === "daily" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("filters.startDate")}
                </label>
                <DatePicker value={selectedDate} onChange={setSelectedDate} />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("break.year")}
                  </label>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(v) => setSelectedYear(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("break.month")}
                  </label>
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(v) => setSelectedMonth(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Compliance Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("break.complianceStatus")}
              </label>
              <Select
                value={complianceFilter}
                onValueChange={setComplianceFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("filters.allStatuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("filters.allStatuses")}</SelectItem>
                  <SelectItem value="compliant">
                    {t("break.compliant")}
                  </SelectItem>
                  <SelectItem value="non-compliant">
                    {t("break.nonCompliant")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
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

          {/* Export Button */}
          {reportData && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExportCsv}
                disabled={isExporting}
              >
                {isExporting ? t("actions.exporting") : t("actions.exportCsv")}
              </Button>
            </div>
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
        <Tabs defaultValue="table">
          <TabsList>
            <TabsTrigger value="table">{tCommon("details")}</TabsTrigger>
            <TabsTrigger value="summary">{t("summary.title")}</TabsTrigger>
          </TabsList>

          {/* Table View */}
          <TabsContent value="table">
            <Card>
              <CardContent className="pt-6">
                {filteredEmployees.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("table.noData")}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">#</TableHead>
                          <TableHead>{t("break.columnEmployee")}</TableHead>
                          <TableHead>{t("break.columnTotalBreak")}</TableHead>
                          <TableHead>
                            {t("break.columnBreakSessions")}
                          </TableHead>
                          <TableHead>{t("break.columnCompliance")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmployees.map((employee, index) => (
                          <BreakReportExpandable
                            key={employee.employeeId}
                            employeeName={employee.employeeName}
                            breakRecords={employee.breakRecords}
                            totalBreakMinutes={employee.totalBreakMinutes}
                            isCompliant={employee.isCompliant}
                            expanded={expandedRows.has(employee.employeeId)}
                            onToggle={() => toggleRow(employee.employeeId)}
                            rowIndex={index}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Summary View */}
          <TabsContent value="summary">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("break.summaryTotalEmployees")}
                    </p>
                    <p className="text-2xl font-bold">
                      {reportData.summary.totalEmployees}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("break.summaryCompliant")}
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {reportData.summary.compliantCount}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("break.summaryNonCompliant")}
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {reportData.summary.nonCompliantCount}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("break.summaryComplianceRate")}
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {reportData.summary.complianceRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("break.summaryAverageBreak")}
                    </p>
                    <p className="text-2xl font-bold">
                      {formatMinutes(reportData.summary.averageBreakMinutes)}
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
