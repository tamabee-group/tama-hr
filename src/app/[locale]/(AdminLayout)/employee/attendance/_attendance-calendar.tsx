"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarView,
  type CalendarDayData,
} from "@/app/[locale]/_components/_shared/_calendar-view";
import { attendanceApi } from "@/lib/apis/attendance-api";
import { holidayApi } from "@/lib/apis/holiday-api";
import type { AttendanceRecord, Holiday } from "@/types/attendance-records";

// ============================================
// Types
// ============================================

interface AttendanceCalendarProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  hideCard?: boolean;
}

// ============================================
// Utilities
// ============================================

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mapAttendanceToCalendarData(
  records: AttendanceRecord[],
): Record<string, CalendarDayData> {
  const data: Record<string, CalendarDayData> = {};

  for (const record of records) {
    const dateKey = record.workDate;

    let status: CalendarDayData["status"] = undefined;
    switch (record.status) {
      case "PRESENT":
        status = "present";
        break;
      case "ABSENT":
        status = "absent";
        break;
      case "LEAVE":
        status = "leave";
        break;
      case "HOLIDAY":
        status = "holiday";
        break;
    }

    data[dateKey] = {
      status,
      isLate: record.lateMinutes > 0,
      isEarlyLeave: record.earlyLeaveMinutes > 0,
    };
  }

  return data;
}

function mapHolidaysToCalendarFormat(
  holidays: Holiday[],
): { date: string; name: string }[] {
  return holidays.map((h) => ({
    date: h.date,
    name: h.name,
  }));
}

// ============================================
// AttendanceCalendar Component
// ============================================

export function AttendanceCalendar({
  month,
  onMonthChange,
  hideCard = false,
}: AttendanceCalendarProps) {
  const t = useTranslations("attendance");
  const locale = useLocale();
  const router = useRouter();

  const [records, setRecords] = React.useState<AttendanceRecord[]>([]);
  const [holidays, setHolidays] = React.useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  // Fetch attendance records và holidays khi tháng thay đổi
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const year = month.getFullYear();
        const monthNum = month.getMonth() + 1;

        // Fetch attendance records
        const attendanceRecords = await attendanceApi.getMyAttendanceByMonth(
          year,
          monthNum,
        );
        setRecords(attendanceRecords);

        // Fetch holidays - bỏ qua nếu không có quyền
        try {
          const holidayList = await holidayApi.getHolidaysByDateRange(
            `${year}-${monthNum.toString().padStart(2, "0")}-01`,
            `${year}-${monthNum.toString().padStart(2, "0")}-31`,
          );
          setHolidays(holidayList);
        } catch {
          // Employee có thể không có quyền xem holidays
          setHolidays([]);
        }
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [month]);

  // Chuyển đổi dữ liệu cho CalendarView
  const dayData = React.useMemo(
    () => mapAttendanceToCalendarData(records),
    [records],
  );

  const calendarHolidays = React.useMemo(
    () => mapHolidaysToCalendarFormat(holidays),
    [holidays],
  );

  // Xử lý khi click vào ngày
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateStr = formatDateKey(date);
    router.push(`/${locale}/employee/attendance/${dateStr}`);
  };

  if (isLoading) {
    if (hideCard) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-8" />
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 42 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        </div>
      );
    }
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("calendar")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-8" />
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 42 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Nếu hideCard, chỉ render CalendarView
  if (hideCard) {
    return (
      <CalendarView
        month={month}
        selectedDate={selectedDate}
        onDateClick={handleDateClick}
        onMonthChange={onMonthChange}
        holidays={calendarHolidays}
        dayData={dayData}
        showLegend={true}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("calendar")}</CardTitle>
      </CardHeader>
      <CardContent>
        <CalendarView
          month={month}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
          onMonthChange={onMonthChange}
          holidays={calendarHolidays}
          dayData={dayData}
          showLegend={true}
        />
      </CardContent>
    </Card>
  );
}
