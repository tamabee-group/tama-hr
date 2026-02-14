"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { attendanceApi } from "@/lib/apis/attendance-api";
import { AttendanceMonthView } from "@/app/[locale]/_components/_shared/attendance";
import type { MonthTableRecord } from "@/app/[locale]/_components/_shared/attendance/_attendance-month-table";
import { ATTENDANCE_STATUSES } from "@/types/attendance-enums";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface AttendanceContentProps {
  employeeId: number;
}

export function AttendanceContent({ employeeId }: AttendanceContentProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch records cho employee cụ thể, filter theo status
  const fetchRecords = useCallback(
    async (year: number, month: number): Promise<MonthTableRecord[]> => {
      const data = await attendanceApi.getEmployeeAttendanceByMonth(
        employeeId,
        year,
        month,
      );
      const records = Array.isArray(data) ? data : [];
      if (statusFilter === "all") return records as MonthTableRecord[];
      return records.filter(
        (r) => r.status === statusFilter,
      ) as MonthTableRecord[];
    },
    [employeeId, statusFilter],
  );

  // Click vào record → xem chi tiết
  const handleRecordClick = useCallback(
    (record: MonthTableRecord) => {
      router.push(
        `/${locale}/dashboard/attendance/${record.workDate}?employeeId=${employeeId}`,
      );
    },
    [router, locale, employeeId],
  );

  // Click vào ngày không có record → xem detail (có thể chỉnh sửa)
  const handleDateClick = useCallback(
    (date: string) => {
      router.push(
        `/${locale}/dashboard/attendance/${date}?employeeId=${employeeId}`,
      );
    },
    [router, locale, employeeId],
  );

  // Export CSV (dùng records hiện tại từ fetchRecords)
  const handleExportCSV = useCallback(async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    try {
      const records = await attendanceApi.getEmployeeAttendanceByMonth(
        employeeId,
        year,
        month,
      );
      if (!records || records.length === 0) {
        toast.error(t("messages.noRecords"));
        return;
      }
      const headers = [
        t("table.date"),
        t("checkIn"),
        t("checkOut"),
        t("workingHours"),
        t("overtime"),
        tCommon("status"),
      ];
      const rows = records.map((r) => [
        r.workDate,
        r.roundedCheckIn || r.originalCheckIn || "",
        r.roundedCheckOut || r.originalCheckOut || "",
        Math.floor(r.workingMinutes / 60) +
          ":" +
          (r.workingMinutes % 60).toString().padStart(2, "0"),
        Math.floor(r.overtimeMinutes / 60) +
          ":" +
          (r.overtimeMinutes % 60).toString().padStart(2, "0"),
        r.status,
      ]);
      const csvContent = [headers, ...rows]
        .map((row) => row.join(","))
        .join("\n");
      const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `attendance_${employeeId}_${year}_${month}.csv`;
      link.click();
    } catch {
      toast.error(t("messages.noRecords"));
    }
  }, [employeeId, t, tCommon]);

  // Toolbar bên phải: status filter + export
  const renderToolbar = useCallback(
    () => (
      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder={t("filter.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tCommon("all")}</SelectItem>
            {ATTENDANCE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {tEnums(`attendanceStatus.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={handleExportCSV}>
          <Download className="h-4 w-4" />
        </Button>
      </div>
    ),
    [statusFilter, t, tCommon, tEnums, handleExportCSV],
  );

  return (
    <AttendanceMonthView
      fetchRecords={fetchRecords}
      onRecordClick={handleRecordClick}
      onDateClick={handleDateClick}
      mobileEdgeToEdge
      renderToolbar={renderToolbar}
    />
  );
}
