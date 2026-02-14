"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { unifiedAttendanceApi } from "@/lib/apis/unified-attendance-api";
import { AttendanceMonthView } from "@/app/[locale]/_components/_shared/attendance";
import type { MonthTableRecord } from "@/app/[locale]/_components/_shared/attendance/_attendance-month-table";
import type { SupportedLocale } from "@/lib/utils/format-currency";

export function AttendanceMonthContent() {
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lấy year/month từ URL hoặc dùng tháng hiện tại
  const initialMonth = useMemo(() => {
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");
    if (yearParam && monthParam) {
      return new Date(parseInt(yearParam), parseInt(monthParam) - 1, 1);
    }
    return new Date();
  }, [searchParams]);

  // Fetch records cho employee hiện tại
  const fetchRecords = useCallback(
    async (year: number, month: number): Promise<MonthTableRecord[]> => {
      const data = await unifiedAttendanceApi.getAttendanceByMonth(year, month);
      return data as MonthTableRecord[];
    },
    [],
  );

  // Click vào row → navigate theo date
  const handleDateClick = useCallback(
    (date: string) => {
      router.push(`/${locale}/me/attendance/${date}`);
    },
    [router, locale],
  );

  // Click vào record → navigate theo date (dùng workDate)
  const handleRecordClick = useCallback(
    (record: MonthTableRecord) => {
      router.push(`/${locale}/me/attendance/${record.workDate}`);
    },
    [router, locale],
  );

  return (
    <AttendanceMonthView
      fetchRecords={fetchRecords}
      onRecordClick={handleRecordClick}
      onDateClick={handleDateClick}
      mobileEdgeToEdge
      initialMonth={initialMonth}
    />
  );
}
