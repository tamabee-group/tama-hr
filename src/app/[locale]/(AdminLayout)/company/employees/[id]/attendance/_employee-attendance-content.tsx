"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { AttendanceStatusBadge } from "@/app/[locale]/_components/_shared/_status-badge";
import {
  TimeDisplay,
  DurationDisplay,
} from "@/app/[locale]/_components/_shared/_time-display";

import { attendanceApi } from "@/lib/apis/attendance-api";
import {
  AttendanceRecord,
  AttendanceSummary,
} from "@/types/attendance-records";
import { formatDate } from "@/lib/utils/format-date";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface EmployeeAttendanceContentProps {
  employeeId: number;
}

/**
 * Component hiển thị attendance của một employee cụ thể
 * Bao gồm: summary cards và bảng attendance records
 */
export function EmployeeAttendanceContent({
  employeeId,
}: EmployeeAttendanceContentProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  // State
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [recordsData, summaryData] = await Promise.all([
        attendanceApi.getEmployeeAttendanceByMonth(employeeId, year, month),
        attendanceApi.getEmployeeAttendanceSummary(employeeId),
      ]);
      setRecords(recordsData);
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

  // Handle view detail
  const handleViewDetail = (id: number) => {
    router.push(`/${locale}/company/attendance/${id}`);
  };

  // Handle month change
  const handlePreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Define columns
  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      id: "stt",
      header: "#",
      cell: ({ row }) => row.index + 1,
      size: 60,
    },
    {
      accessorKey: "workDate",
      header: t("table.date"),
      cell: ({ row }) => formatDate(row.original.workDate, locale),
    },
    {
      accessorKey: "roundedCheckIn",
      header: t("table.checkInTime"),
      cell: ({ row }) => (
        <TimeDisplay
          time={row.original.roundedCheckIn || row.original.originalCheckIn}
        />
      ),
    },
    {
      accessorKey: "roundedCheckOut",
      header: t("table.checkOutTime"),
      cell: ({ row }) => (
        <TimeDisplay
          time={row.original.roundedCheckOut || row.original.originalCheckOut}
        />
      ),
    },
    {
      accessorKey: "workingMinutes",
      header: t("table.workingHours"),
      cell: ({ row }) => (
        <DurationDisplay minutes={row.original.workingMinutes} />
      ),
    },
    {
      accessorKey: "overtimeMinutes",
      header: t("table.overtime"),
      cell: ({ row }) => {
        const overtime = row.original.overtimeMinutes;
        if (!overtime || overtime === 0) return "-";
        return <DurationDisplay minutes={overtime} className="text-blue-600" />;
      },
    },
    {
      accessorKey: "lateMinutes",
      header: t("table.lateMinutes"),
      cell: ({ row }) => {
        const late = row.original.lateMinutes;
        if (!late || late === 0) return "-";
        return (
          <span className="text-red-600">
            {late} {tCommon("minutes")}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("table.status"),
      cell: ({ row }) => <AttendanceStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: tCommon("actions"),
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetail(row.original.id)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
      size: 80,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{tCommon("loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
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

      {/* Month Navigation */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {t("monthlyRecords")}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              {tCommon("previous")}
            </Button>
            <span className="font-medium min-w-[120px] text-center">
              {year}/{month.toString().padStart(2, "0")}
            </span>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              {tCommon("next")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <BaseTable
            columns={columns}
            data={records}
            showPagination={false}
            noResultsText={t("messages.noRecords")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
