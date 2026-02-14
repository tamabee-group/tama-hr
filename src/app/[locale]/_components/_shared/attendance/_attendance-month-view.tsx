"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/app/[locale]/_components/_glass-style";
import { GlassTabs } from "@/app/[locale]/_components/_glass-style";
import { companySettingsApi } from "@/lib/apis/company-settings-api";
import { holidayApi } from "@/lib/apis/holiday-api";
import {
  formatDate,
  formatDateForApi,
  formatMinutesToTime,
} from "@/lib/utils/format-date-time";
import type { Holiday } from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";
import {
  AttendanceMonthTable,
  type DayRow,
  type MonthTableRecord,
} from "./_attendance-month-table";

// ============================================
// Types
// ============================================

type ViewMode = "fullMonth" | "recordsOnly";

export interface AttendanceMonthViewProps {
  /** Fetch records cho tháng được chọn. Trả về array records. */
  fetchRecords: (year: number, month: number) => Promise<MonthTableRecord[]>;
  /** Callback khi click vào record có data */
  onRecordClick?: (record: MonthTableRecord) => void;
  /** Callback khi click vào ngày (dùng cho /me/attendance navigate theo date) */
  onDateClick?: (date: string) => void;
  /** Thêm -mx-4 cho mobile edge-to-edge */
  mobileEdgeToEdge?: boolean;
  /** Tháng ban đầu (default: tháng hiện tại) */
  initialMonth?: Date;
  /** Render thêm toolbar bên phải (status filter, export...) */
  renderToolbar?: () => React.ReactNode;
}

// ============================================
// Helpers
// ============================================

function getCutoffPeriod(selectedMonth: Date, cutoffDay: number) {
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();

  // Clamp ngày cutoff theo số ngày thực tế của tháng (tránh overflow tháng 2, tháng 30 ngày)
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const actualCutoffPrevMonth = Math.min(cutoffDay, daysInPrevMonth);
  const actualCutoffCurrentMonth = Math.min(cutoffDay, daysInCurrentMonth);

  // startDate = ngày sau cutoff của tháng trước
  const startDate = new Date(year, month - 1, actualCutoffPrevMonth + 1);
  const endDate = new Date(year, month, actualCutoffCurrentMonth);
  return { startDate, endDate };
}

function generateDateRange(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    const d = String(current.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function isWeekendDay(
  dateStr: string,
  saturdayOff: boolean,
  sundayOff: boolean,
) {
  const day = new Date(dateStr).getDay();
  return {
    isWeekend: day === 6 || day === 0,
    isDayOff: (day === 6 && saturdayOff) || (day === 0 && sundayOff),
  };
}

// ============================================
// Component
// ============================================

export function AttendanceMonthView({
  fetchRecords,
  onRecordClick,
  onDateClick,
  mobileEdgeToEdge = false,
  initialMonth,
  renderToolbar,
}: AttendanceMonthViewProps) {
  const t = useTranslations("attendance");
  const locale = useLocale() as SupportedLocale;

  // State
  const [records, setRecords] = React.useState<MonthTableRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedMonth, setSelectedMonth] = React.useState(
    initialMonth || new Date(),
  );
  const [viewMode, setViewMode] = React.useState<ViewMode>("fullMonth");
  const [cutoffDay, setCutoffDay] = React.useState(20);
  const [saturdayOff, setSaturdayOff] = React.useState(true);
  const [sundayOff, setSundayOff] = React.useState(true);
  const [holidayOff, setHolidayOff] = React.useState(true);
  const [holidays, setHolidays] = React.useState<Holiday[]>([]);

  // Fetch company settings
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await companySettingsApi.getSettings();
        setCutoffDay(settings.payrollConfig.cutoffDay || 20);
        setSaturdayOff(settings.attendanceConfig.saturdayOff ?? true);
        setSundayOff(settings.attendanceConfig.sundayOff ?? true);
        setHolidayOff(settings.attendanceConfig.holidayOff ?? true);
      } catch {
        // Dùng default values
      }
    };
    fetchSettings();
  }, []);

  // Fetch records và holidays theo tháng
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth() + 1;

        const { startDate: periodStart, endDate: periodEnd } = getCutoffPeriod(
          selectedMonth,
          cutoffDay,
        );
        const startStr = formatDateForApi(periodStart) || "";
        const endStr = formatDateForApi(periodEnd) || "";

        const [recordsData, holidayData] = await Promise.all([
          fetchRecords(year, month),
          holidayApi
            .getHolidaysByDateRange(startStr, endStr)
            .catch(() => [] as Holiday[]),
        ]);

        setRecords(Array.isArray(recordsData) ? recordsData : []);
        setHolidays(holidayData);
      } catch {
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth, cutoffDay, fetchRecords]);

  // Navigation
  const handlePreviousMonth = () => {
    setSelectedMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const canGoNext = React.useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    // Cho phép xem tháng hiện tại và 1 tháng tương lai
    return (
      selectedMonth.getFullYear() < currentYear ||
      (selectedMonth.getFullYear() === currentYear &&
        selectedMonth.getMonth() < currentMonth + 1)
    );
  }, [selectedMonth]);

  const monthYearLabel = selectedMonth.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
  });

  // Holiday map
  const holidayMap = React.useMemo(() => {
    const map = new Map<string, string>();
    holidays.forEach((h) => map.set(h.date, h.name));
    return map;
  }, [holidays]);

  // Display rows
  const displayRows = React.useMemo((): DayRow[] => {
    const recordMap = new Map<string, MonthTableRecord>();
    records.forEach((r) => recordMap.set(r.workDate, r));

    if (viewMode === "recordsOnly") {
      return [...records]
        .sort(
          (a, b) =>
            new Date(b.workDate).getTime() - new Date(a.workDate).getTime(),
        )
        .map((record) => {
          const { isWeekend, isDayOff } = isWeekendDay(
            record.workDate,
            saturdayOff,
            sundayOff,
          );
          const isHol = holidayMap.has(record.workDate);
          return {
            date: record.workDate,
            record,
            isWeekend,
            isHoliday: isHol,
            holidayName: holidayMap.get(record.workDate),
            isDayOff: isDayOff || (isHol && holidayOff),
          };
        });
    }

    const { startDate, endDate } = getCutoffPeriod(selectedMonth, cutoffDay);
    const allDates = generateDateRange(startDate, endDate);

    return allDates.map((dateStr) => {
      const { isWeekend, isDayOff } = isWeekendDay(
        dateStr,
        saturdayOff,
        sundayOff,
      );
      const isHol = holidayMap.has(dateStr);
      return {
        date: dateStr,
        record: recordMap.get(dateStr),
        isWeekend,
        isHoliday: isHol,
        holidayName: holidayMap.get(dateStr),
        isDayOff: isDayOff || (isHol && holidayOff),
      };
    });
  }, [
    records,
    viewMode,
    selectedMonth,
    cutoffDay,
    saturdayOff,
    sundayOff,
    holidayOff,
    holidayMap,
  ]);

  // Cutoff period label
  const cutoffPeriodLabel = React.useMemo(() => {
    const { startDate, endDate } = getCutoffPeriod(selectedMonth, cutoffDay);
    const start = formatDate(formatDateForApi(startDate), locale);
    const end = formatDate(formatDateForApi(endDate), locale);
    return t("viewMode.cutoffPeriod", { start, end });
  }, [selectedMonth, cutoffDay, locale, t]);

  // Summary
  const summary = React.useMemo(() => {
    if (records.length === 0) return null;
    return {
      workingDays: records.filter(
        (r) => r.status === "PRESENT" || r.originalCheckIn,
      ).length,
      totalWorkingMinutes: records.reduce(
        (sum, r) => sum + (r.workingMinutes || 0),
        0,
      ),
      totalOvertimeMinutes: records.reduce(
        (sum, r) => sum + (r.overtimeMinutes || 0),
        0,
      ),
      totalLateMinutes: records.reduce(
        (sum, r) => sum + (r.lateMinutes || 0),
        0,
      ),
    };
  }, [records]);

  return (
    <div className="space-y-4">
      {/* Header: navigation tháng */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
            className="h-10 w-10 rounded-full cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {monthYearLabel}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {cutoffPeriodLabel}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            disabled={!canGoNext}
            className="h-10 w-10 rounded-full cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </GlassCard>

      {/* Toolbar: view mode tabs + custom toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <GlassTabs
          tabs={[
            { value: "fullMonth", label: t("viewMode.fullMonth") },
            { value: "recordsOnly", label: t("viewMode.recordsOnly") },
          ]}
          value={viewMode}
          onChange={(v) => setViewMode(v as ViewMode)}
          className="w-fit"
        />
        {renderToolbar?.()}
      </div>

      {/* Summary Cards */}
      {!isLoading && summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard
            label={t("summary.workingDays")}
            value={`${summary.workingDays}`}
            valueColor="text-blue-600"
          />
          <SummaryCard
            label={t("summary.totalHours")}
            value={formatMinutesToTime(summary.totalWorkingMinutes, { locale })}
            valueColor="text-green-600"
          />
          <SummaryCard
            label={t("summary.overtime")}
            value={formatMinutesToTime(summary.totalOvertimeMinutes, {
              locale,
              zeroAsEmpty: true,
            })}
            valueColor="text-purple-600"
          />
          <SummaryCard
            label={t("summary.lateMinutes")}
            value={formatMinutesToTime(summary.totalLateMinutes, {
              locale,
              zeroAsEmpty: true,
            })}
            valueColor="text-orange-600"
          />
        </div>
      )}

      {/* Table */}
      <AttendanceMonthTable
        rows={displayRows}
        isLoading={isLoading}
        locale={locale}
        onRecordClick={onRecordClick}
        onDateClick={onDateClick}
        mobileEdgeToEdge={mobileEdgeToEdge}
      />
    </div>
  );
}

// ============================================
// Summary Card
// ============================================

function SummaryCard({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <GlassCard className="p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-xl font-semibold tabular-nums ${valueColor || ""}`}>
        {value || "-"}
      </p>
    </GlassCard>
  );
}
