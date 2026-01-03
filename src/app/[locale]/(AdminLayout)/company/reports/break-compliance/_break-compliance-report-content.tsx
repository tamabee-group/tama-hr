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
import { reportApi, BreakComplianceReportData } from "@/lib/apis/report-api";
import { ReportFilters } from "@/types/attendance-records";

/**
 * Component hiển thị báo cáo tuân thủ giờ nghỉ
 */
export function BreakComplianceReportContent() {
  const t = useTranslations("reports");
  const tCommon = useTranslations("common");

  // State
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const [reportData, setReportData] =
    useState<BreakComplianceReportData | null>(null);
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
      const data = await reportApi.getBreakComplianceReport(filters);
      setReportData(data);
      toast.success(t("messages.generateSuccess"));
    } catch {
      toast.error(t("messages.generateError"));
    } finally {
      setIsLoading(false);
    }
  };

  // Format compliance rate
  const formatRate = (rate: number): string => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  // Get compliance badge variant
  const getComplianceBadge = (rate: number) => {
    if (rate >= 0.9) {
      return <Badge variant="default">{formatRate(rate)}</Badge>;
    } else if (rate >= 0.7) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          {formatRate(rate)}
        </Badge>
      );
    } else {
      return <Badge variant="destructive">{formatRate(rate)}</Badge>;
    }
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
                reportType="break-compliance"
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
                          <TableHead>
                            {t("breakCompliance.columnEmployee")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("breakCompliance.columnTotalDays")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("breakCompliance.columnCompliantDays")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("breakCompliance.columnNonCompliantDays")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("breakCompliance.columnAverageBreak")}
                          </TableHead>
                          <TableHead className="text-center">
                            {t("breakCompliance.columnComplianceRate")}
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
                              {emp.totalDays}
                            </TableCell>
                            <TableCell className="text-right text-green-600">
                              {emp.compliantDays}
                            </TableCell>
                            <TableCell className="text-right text-red-600">
                              {emp.nonCompliantDays}
                            </TableCell>
                            <TableCell className="text-right">
                              {emp.averageBreakMinutes} {tCommon("minutes")}
                            </TableCell>
                            <TableCell className="text-center">
                              {getComplianceBadge(emp.complianceRate)}
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

          {/* Summary View */}
          <TabsContent value="summary">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("breakCompliance.summaryTotalEmployees")}
                    </p>
                    <p className="text-2xl font-bold">
                      {reportData.summary.totalEmployees}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("breakCompliance.summaryOverallRate")}
                    </p>
                    <p className="text-2xl font-bold">
                      {formatRate(reportData.summary.overallComplianceRate)}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("breakCompliance.summaryTotalCompliant")}
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {reportData.summary.totalCompliantDays}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("breakCompliance.summaryTotalNonCompliant")}
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {reportData.summary.totalNonCompliantDays}
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
