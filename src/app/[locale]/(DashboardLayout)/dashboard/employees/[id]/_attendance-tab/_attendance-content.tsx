"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DurationDisplay } from "@/app/[locale]/_components/_shared/_time-display";

import { attendanceApi } from "@/lib/apis/attendance-api";
import {
  AttendanceRecord,
  AttendanceSummary,
} from "@/types/attendance-records";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { SupportedLocale } from "@/lib/utils/format-currency";

import { AttendanceFilters } from "./_attendance-filters";
import { AttendanceTable } from "./_attendance-table";

interface AttendanceContentProps {
  employeeId: number;
}

/**
 * Component chính cho Attendance Tab
 * Bao gồm: Statistics cards, Filters, Table với pagination
 */
export function AttendanceContent({ employeeId }: AttendanceContentProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;

  // State
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const period = `${year}-${month.toString().padStart(2, "0")}`;
      const [recordsData, summaryData] = await Promise.all([
        attendanceApi.getEmployeeAttendanceByMonth(employeeId, year, month),
        attendanceApi.getEmployeeAttendanceSummary(employeeId, period),
      ]);
      // Đảm bảo records là array
      setRecords(Array.isArray(recordsData) ? recordsData : []);
      setSummary(summaryData);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [employeeId, year, month, tErrors]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter records
  const filteredRecords = records.filter((record) => {
    // Filter by status
    if (statusFilter !== "all" && record.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // Handle month change
  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  };

  // Handle export CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      toast.error(t("messages.noRecords"));
      return;
    }

    // Tạo CSV content
    const headers = [
      t("table.date"),
      t("table.checkInTime"),
      t("table.checkOutTime"),
      t("table.workingHours"),
      t("table.overtime"),
      t("table.status"),
    ];

    const rows = filteredRecords.map((record) => [
      record.workDate,
      record.roundedCheckIn || record.originalCheckIn || "",
      record.roundedCheckOut || record.originalCheckOut || "",
      Math.floor(record.workingMinutes / 60) +
        ":" +
        (record.workingMinutes % 60).toString().padStart(2, "0"),
      Math.floor(record.overtimeMinutes / 60) +
        ":" +
        (record.overtimeMinutes % 60).toString().padStart(2, "0"),
      record.status,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    // Download file
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_${employeeId}_${year}_${month}.csv`;
    link.click();
  };

  if (loading) {
    return <AttendanceContentSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="py-2">
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("summary.workingDays")}
              </p>
              <p className="text-2xl font-bold">
                {summary.presentDays}/{summary.totalWorkingDays}
              </p>
            </CardContent>
          </Card>
          <Card className="py-2">
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("summary.totalHours")}
              </p>
              <DurationDisplay
                minutes={summary.totalWorkingMinutes}
                className="text-2xl font-bold"
              />
            </CardContent>
          </Card>
          <Card className="py-2">
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("summary.overtime")}
              </p>
              <DurationDisplay
                minutes={summary.totalOvertimeMinutes}
                className="text-2xl font-bold text-blue-600"
              />
            </CardContent>
          </Card>
          <Card className="py-2">
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("summary.lateMinutes")}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {summary.totalLateMinutes} {tCommon("minutes")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <AttendanceFilters
        year={year}
        month={month}
        statusFilter={statusFilter}
        onMonthChange={handleMonthChange}
        onStatusChange={setStatusFilter}
        onExportCSV={handleExportCSV}
      />

      {/* Attendance Table */}
      <AttendanceTable
        records={filteredRecords}
        employeeId={employeeId}
        locale={locale}
      />
    </div>
  );
}

// Loading skeleton
function AttendanceContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="py-2">
            <CardContent>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
