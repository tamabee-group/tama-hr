"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { reportApi, ShiftUtilizationReportData } from "@/lib/apis/report-api";
import { ReportFilters } from "@/types/attendance-records";

/**
 * Component hiển thị báo cáo hiệu suất ca
 */
export function ShiftUtilizationReportContent() {
  const t = useTranslations("reports");
  const tCommon = useTranslations("common");

  // State
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const [reportData, setReportData] =
    useState<ShiftUtilizationReportData | null>(null);
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
      const data = await reportApi.getShiftUtilizationReport(filters);
      setReportData(data);
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

  // Get utilization badge
  const getUtilizationBadge = (rate: number) => {
    if (rate >= 0.8) {
      return <Badge variant="default">{formatPercentage(rate)}</Badge>;
    } else if (rate >= 0.5) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          {formatPercentage(rate)}
        </Badge>
      );
    } else {
      return <Badge variant="destructive">{formatPercentage(rate)}</Badge>;
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
              reportType="shift-utilization"
              filters={getFilters()}
              disabled={!reportData || reportData.shifts.length === 0}
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
        <Tabs defaultValue="table">
          <TabsList>
            <TabsTrigger value="table">{tCommon("details")}</TabsTrigger>
            <TabsTrigger value="summary">{t("summary.title")}</TabsTrigger>
          </TabsList>

          {/* Table View */}
          <TabsContent value="table">
            <Card>
              <CardContent className="pt-6">
                {reportData.shifts.length === 0 ? (
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
                            {t("shiftUtilization.columnShift")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("shiftUtilization.columnTotalSlots")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("shiftUtilization.columnFilledSlots")}
                          </TableHead>
                          <TableHead className="w-[200px]">
                            {t("shiftUtilization.columnUtilization")}
                          </TableHead>
                          <TableHead className="text-center">
                            {t("shiftUtilization.columnAttendanceRate")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.shifts.map((shift, index) => (
                          <TableRow key={shift.shiftId}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">
                              {shift.shiftName}
                            </TableCell>
                            <TableCell className="text-right">
                              {shift.totalSlots}
                            </TableCell>
                            <TableCell className="text-right">
                              {shift.filledSlots}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={shift.utilizationRate * 100}
                                  className="h-2"
                                />
                                <span className="text-sm text-muted-foreground w-12">
                                  {formatPercentage(shift.utilizationRate)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {getUtilizationBadge(shift.averageAttendanceRate)}
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
                      {t("shiftUtilization.summaryTotalShifts")}
                    </p>
                    <p className="text-2xl font-bold">
                      {reportData.summary.totalShifts}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("shiftUtilization.summaryOverallUtilization")}
                    </p>
                    <p className="text-2xl font-bold">
                      {formatPercentage(
                        reportData.summary.overallUtilizationRate,
                      )}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("shiftUtilization.summaryMostUtilized")}
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      {reportData.summary.mostUtilizedShift || "-"}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("shiftUtilization.summaryLeastUtilized")}
                    </p>
                    <p className="text-lg font-bold text-red-600">
                      {reportData.summary.leastUtilizedShift || "-"}
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
