"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendanceStatusBadge } from "@/app/[locale]/_components/_shared/display/_status-badge";
import {
  formatDateWithDayOfWeek,
  formatTime,
  formatMinutesToTime,
} from "@/lib/utils/format-date-time";
import type { AttendanceStatus } from "@/types/attendance-enums";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Types
// ============================================

/** Record tối thiểu cần cho month table (tương thích cả AttendanceRecord và UnifiedAttendanceRecord) */
export interface MonthTableRecord {
  id: number;
  workDate: string;
  originalCheckIn?: string;
  originalCheckOut?: string;
  workingMinutes: number;
  overtimeMinutes: number;
  lateMinutes: number;
  totalBreakMinutes: number;
  status: AttendanceStatus;
}

export interface DayRow {
  date: string;
  record?: MonthTableRecord;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  isDayOff: boolean;
}

interface AttendanceMonthTableProps {
  rows: DayRow[];
  isLoading: boolean;
  locale: SupportedLocale;
  /** Callback khi click vào row có record */
  onRecordClick?: (record: MonthTableRecord) => void;
  /** Callback khi click vào row không có record (dùng cho /me/attendance navigate theo date) */
  onDateClick?: (date: string) => void;
  /** Thêm -mx-4 cho mobile edge-to-edge (dùng cho /me/attendance) */
  mobileEdgeToEdge?: boolean;
}

// ============================================
// Table Component
// ============================================

export function AttendanceMonthTable({
  rows,
  isLoading,
  locale,
  onRecordClick,
  onDateClick,
  mobileEdgeToEdge = false,
}: AttendanceMonthTableProps) {
  const t = useTranslations("attendance");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const check = () => {
      const el = scrollRef.current;
      if (el) setCanScroll(el.scrollWidth > el.clientWidth);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [rows]);

  const wrapperClass = mobileEdgeToEdge
    ? "-mx-4 md:mx-0 border-y md:border md:rounded-lg"
    : "border rounded-lg";

  if (isLoading) {
    return (
      <div
        className={`${wrapperClass} border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden p-4`}
      >
        <TableSkeleton />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div
        className={`${wrapperClass} border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden`}
      >
        <div className="py-12 text-center text-muted-foreground">
          {t("messages.noRecords")}
        </div>
      </div>
    );
  }

  const stickyClass = canScroll
    ? "after:absolute after:top-0 after:right-0 after:bottom-0 after:w-4 after:translate-x-full after:bg-linear-to-r after:from-black/10 after:to-transparent after:pointer-events-none md:after:hidden"
    : "";

  return (
    <div
      className={`${wrapperClass} border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden`}
    >
      <div className="relative">
        <div ref={scrollRef} className="overflow-x-auto">
          <table
            className="w-full text-sm border-collapse"
            style={{ minWidth: "820px" }}
          >
            <colgroup>
              <col style={{ width: "160px" }} />
              <col style={{ width: "80px" }} />
              <col style={{ width: "80px" }} />
              <col style={{ width: "80px" }} />
              <col style={{ width: "80px" }} />
              <col style={{ width: "80px" }} />
              <col style={{ width: "80px" }} />
              <col style={{ width: "100px" }} />
            </colgroup>
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th
                  className={`sticky left-0 z-10 md:static bg-gray-50 dark:bg-gray-800 py-3 px-3 text-left font-medium text-muted-foreground whitespace-nowrap border-b border-r border-gray-200 dark:border-gray-700 ${stickyClass}`}
                >
                  {t("table.date")}
                </th>
                <th className="py-3 px-2 text-center font-medium text-muted-foreground whitespace-nowrap border-b border-r border-gray-200 dark:border-gray-700">
                  {t("checkIn")}
                </th>
                <th className="py-3 px-2 text-center font-medium text-muted-foreground whitespace-nowrap border-b border-r border-gray-200 dark:border-gray-700">
                  {t("checkOut")}
                </th>
                <th className="py-3 px-2 text-center font-medium text-muted-foreground whitespace-nowrap border-b border-r border-gray-200 dark:border-gray-700">
                  {t("table.totalTime")}
                </th>
                <th className="py-3 px-2 text-center font-medium text-muted-foreground whitespace-nowrap border-b border-r border-gray-200 dark:border-gray-700">
                  {t("workingHours")}
                </th>
                <th className="py-3 px-2 text-center font-medium text-muted-foreground whitespace-nowrap border-b border-r border-gray-200 dark:border-gray-700">
                  {t("breakTime")}
                </th>
                <th className="py-3 px-2 text-center font-medium text-muted-foreground whitespace-nowrap border-b border-r border-gray-200 dark:border-gray-700">
                  {t("overtime")}
                </th>
                <th className="py-3 px-2 text-center font-medium text-muted-foreground whitespace-nowrap border-b border-gray-200 dark:border-gray-700">
                  {t("table.note")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <AttendanceRow
                  key={row.date}
                  row={row}
                  index={index}
                  totalRows={rows.length}
                  stickyClass={stickyClass}
                  locale={locale}
                  t={t}
                  onRecordClick={onRecordClick}
                  onDateClick={onDateClick}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Row Component
// ============================================

interface AttendanceRowProps {
  row: DayRow;
  index: number;
  totalRows: number;
  stickyClass: string;
  locale: SupportedLocale;
  t: ReturnType<typeof useTranslations>;
  onRecordClick?: (record: MonthTableRecord) => void;
  onDateClick?: (date: string) => void;
}

function AttendanceRow({
  row,
  index,
  totalRows,
  stickyClass,
  locale,
  t,
  onRecordClick,
  onDateClick,
}: AttendanceRowProps) {
  const { record } = row;
  const borderBottom =
    index < totalRows - 1
      ? { borderBottom: "1px solid", borderBottomColor: "inherit" }
      : {};
  const rowBg = row.isDayOff ? "bg-gray-50/50 dark:bg-gray-800/30" : "";

  const handleClick = () => {
    if (record && onRecordClick) onRecordClick(record);
    else if (onDateClick) onDateClick(row.date);
  };

  const hasClickHandler = (record && onRecordClick) || onDateClick;

  if (record) {
    const totalMinutes =
      (record.workingMinutes || 0) + (record.totalBreakMinutes || 0);

    return (
      <tr
        className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${rowBg}`}
      >
        <td
          className={`sticky left-0 z-10 md:static ${row.isDayOff ? "bg-gray-50/50 dark:bg-gray-800/30" : "bg-white dark:bg-gray-900"} py-3 px-3 whitespace-nowrap border-r border-gray-200 dark:border-gray-700 ${stickyClass}`}
          style={borderBottom}
        >
          <div className="flex items-center gap-1">
            {hasClickHandler ? (
              <button
                onClick={handleClick}
                className="font-medium text-primary hover:text-primary/80 underline cursor-pointer"
              >
                {formatDateWithDayOfWeek(record.workDate, locale)}
              </button>
            ) : (
              <span className="font-medium">
                {formatDateWithDayOfWeek(record.workDate, locale)}
              </span>
            )}
            {row.isHoliday && row.holidayName && (
              <HolidayDot name={row.holidayName} />
            )}
          </div>
        </td>
        <td
          className="py-3 px-2 text-center tabular-nums border-r border-gray-200 dark:border-gray-700"
          style={borderBottom}
        >
          {record.originalCheckIn ? formatTime(record.originalCheckIn) : "-"}
        </td>
        <td
          className="py-3 px-2 text-center tabular-nums border-r border-gray-200 dark:border-gray-700"
          style={borderBottom}
        >
          {record.originalCheckOut ? formatTime(record.originalCheckOut) : "-"}
        </td>
        <td
          className="py-3 px-2 text-center tabular-nums border-r border-gray-200 dark:border-gray-700"
          style={borderBottom}
        >
          {totalMinutes > 0
            ? formatMinutesToTime(totalMinutes, { locale })
            : "-"}
        </td>
        <td
          className="py-3 px-2 text-center tabular-nums border-r border-gray-200 dark:border-gray-700"
          style={borderBottom}
        >
          {formatMinutesToTime(record.workingMinutes, { locale })}
        </td>
        <td
          className="py-3 px-2 text-center tabular-nums border-r border-gray-200 dark:border-gray-700"
          style={borderBottom}
        >
          {record.totalBreakMinutes > 0
            ? formatMinutesToTime(record.totalBreakMinutes, { locale })
            : "-"}
        </td>
        <td
          className="py-3 px-2 text-center tabular-nums border-r border-gray-200 dark:border-gray-700"
          style={borderBottom}
        >
          {record.overtimeMinutes > 0 ? (
            <span className="text-purple-600">
              {formatMinutesToTime(record.overtimeMinutes, { locale })}
            </span>
          ) : (
            "-"
          )}
        </td>
        <td className="py-3 px-2 text-center" style={borderBottom}>
          {row.isHoliday && row.holidayName ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {row.holidayName}
            </span>
          ) : (
            <AttendanceStatusBadge status={record.status} />
          )}
        </td>
      </tr>
    );
  }

  // Placeholder row (không có record)
  // Chú thích: ngày lễ hiển thị tên, cuối tuần/nghỉ hiển thị label chung
  const noteLabel = row.isHoliday
    ? row.holidayName || t("viewMode.holiday")
    : row.isWeekend
      ? t("viewMode.weekend")
      : row.isDayOff
        ? t("viewMode.dayOff")
        : "";

  return (
    <tr
      className={`${rowBg} ${!row.isDayOff ? "hover:bg-gray-50 dark:hover:bg-gray-800" : ""}`}
    >
      <td
        className={`sticky left-0 z-10 md:static ${row.isDayOff ? "bg-gray-50/50 dark:bg-gray-800/30" : "bg-white dark:bg-gray-900"} py-3 px-3 whitespace-nowrap border-r border-gray-200 dark:border-gray-700 ${stickyClass}`}
        style={borderBottom}
      >
        <div className="flex items-center gap-1">
          {onDateClick && !row.isDayOff ? (
            <button
              onClick={() => onDateClick(row.date)}
              className="font-medium text-primary hover:text-primary/80 underline cursor-pointer"
            >
              {formatDateWithDayOfWeek(row.date, locale)}
            </button>
          ) : (
            <span
              className={`font-medium ${row.isDayOff ? "text-muted-foreground" : ""}`}
            >
              {formatDateWithDayOfWeek(row.date, locale)}
            </span>
          )}
          {row.isHoliday && row.holidayName && (
            <HolidayDot name={row.holidayName} />
          )}
        </div>
      </td>
      {Array.from({ length: 6 }).map((_, i) => (
        <td
          key={i}
          className="py-3 px-2 text-center text-muted-foreground border-r border-gray-200 dark:border-gray-700"
          style={borderBottom}
        >
          -
        </td>
      ))}
      <td className="py-3 px-2 text-center" style={borderBottom}>
        {noteLabel ? (
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              row.isHoliday
                ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {noteLabel}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </td>
    </tr>
  );
}

// ============================================
// Sub Components
// ============================================

function HolidayDot({ name }: { name: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-block h-2 w-2 rounded-full bg-red-500 shrink-0 cursor-help" />
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{name}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="hidden h-4 w-16 sm:block" />
          <Skeleton className="hidden h-4 w-16 md:block" />
          <Skeleton className="ml-auto h-5 w-16" />
        </div>
      ))}
    </div>
  );
}
