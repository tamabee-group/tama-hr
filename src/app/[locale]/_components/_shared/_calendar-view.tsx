"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Types
// ============================================

export interface CalendarDate {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isHoliday: boolean;
  isLeave: boolean;
  isWeekend: boolean;
  data?: CalendarDayData;
}

export interface CalendarDayData {
  /** Trạng thái chấm công */
  status?: "present" | "absent" | "leave" | "holiday";
  /** Có đi muộn không */
  isLate?: boolean;
  /** Có về sớm không */
  isEarlyLeave?: boolean;
  /** Tên ngày lễ */
  holidayName?: string;
  /** Loại nghỉ phép */
  leaveType?: string;
  /** Custom label */
  label?: string;
}

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
}

export interface LeaveDay {
  date: string; // YYYY-MM-DD
  type: string;
}

interface CalendarViewProps {
  /** Tháng hiện tại đang hiển thị */
  month?: Date;
  /** Ngày được chọn */
  selectedDate?: Date | null;
  /** Callback khi chọn ngày */
  onDateClick?: (date: Date) => void;
  /** Callback khi đổi tháng */
  onMonthChange?: (month: Date) => void;
  /** Danh sách ngày lễ */
  holidays?: Holiday[];
  /** Danh sách ngày nghỉ phép */
  leaveDays?: LeaveDay[];
  /** Dữ liệu cho từng ngày (attendance records) */
  dayData?: Record<string, CalendarDayData>;
  /** Custom className */
  className?: string;
  /** Hiển thị legend */
  showLegend?: boolean;
}

// ============================================
// Utilities
// ============================================

const LOCALE_MAP: Record<SupportedLocale, string> = {
  vi: "vi-VN",
  en: "en-US",
  ja: "ja-JP",
};

const WEEKDAY_LABELS: Record<SupportedLocale, string[]> = {
  vi: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  ja: ["日", "月", "火", "水", "木", "金", "土"],
};

function formatMonthYear(date: Date, locale: SupportedLocale): string {
  const localeString = LOCALE_MAP[locale];
  return date.toLocaleDateString(localeString, {
    year: "numeric",
    month: "long",
  });
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function getCalendarDates(
  month: Date,
  holidays: Holiday[],
  leaveDays: LeaveDay[],
  dayData: Record<string, CalendarDayData>,
  selectedDate: Date | null,
): CalendarDate[] {
  const dates: CalendarDate[] = [];
  const today = new Date();

  // Lấy ngày đầu tiên của tháng
  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);

  // Lấy ngày bắt đầu của calendar (có thể là tháng trước)
  const startDay = firstDayOfMonth.getDay(); // 0 = Sunday
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - startDay);

  // Tạo 42 ngày (6 tuần)
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    const dateKey = formatDateKey(currentDate);
    const isCurrentMonth = currentDate.getMonth() === month.getMonth();
    const isToday = isSameDay(currentDate, today);
    const isSelected = selectedDate
      ? isSameDay(currentDate, selectedDate)
      : false;
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

    // Kiểm tra holiday
    const holiday = holidays.find((h) => h.date === dateKey);
    const isHoliday = !!holiday;

    // Kiểm tra leave
    const leave = leaveDays.find((l) => l.date === dateKey);
    const isLeave = !!leave;

    // Lấy data cho ngày
    const data = dayData[dateKey] || {};
    if (holiday) {
      data.holidayName = holiday.name;
      data.status = "holiday";
    }
    if (leave) {
      data.leaveType = leave.type;
      if (!data.status) data.status = "leave";
    }

    dates.push({
      date: currentDate,
      isCurrentMonth,
      isToday,
      isSelected,
      isHoliday,
      isLeave,
      isWeekend,
      data: Object.keys(data).length > 0 ? data : undefined,
    });
  }

  return dates;
}

// ============================================
// CalendarView Component
// ============================================

export function CalendarView({
  month: initialMonth,
  selectedDate = null,
  onDateClick,
  onMonthChange,
  holidays = [],
  leaveDays = [],
  dayData = {},
  className,
  showLegend = true,
}: CalendarViewProps) {
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("common");

  const [currentMonth, setCurrentMonth] = React.useState(
    initialMonth || new Date(),
  );

  // Sync với prop month
  React.useEffect(() => {
    if (initialMonth) {
      setCurrentMonth(initialMonth);
    }
  }, [initialMonth]);

  const calendarDates = React.useMemo(
    () =>
      getCalendarDates(
        currentMonth,
        holidays,
        leaveDays,
        dayData,
        selectedDate,
      ),
    [currentMonth, holidays, leaveDays, dayData, selectedDate],
  );

  const weekdays = WEEKDAY_LABELS[locale] || WEEKDAY_LABELS.en;

  const handlePrevMonth = () => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1,
    );
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1,
    );
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const handleDateClick = (calendarDate: CalendarDate) => {
    if (!calendarDate.isCurrentMonth) return;
    onDateClick?.(calendarDate.date);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Header với navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevMonth}
          aria-label={t("previous")}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        <h2 className="text-lg font-semibold">
          {formatMonthYear(currentMonth, locale)}
        </h2>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMonth}
          aria-label={t("next")}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day, index) => (
          <div
            key={day}
            className={cn(
              "text-center text-sm font-medium py-2",
              index === 0 || index === 6
                ? "text-red-500 dark:text-red-400"
                : "text-muted-foreground",
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDates.map((calendarDate, index) => (
          <CalendarDay
            key={index}
            calendarDate={calendarDate}
            onClick={() => handleDateClick(calendarDate)}
          />
        ))}
      </div>

      {/* Legend */}
      {showLegend && <CalendarLegend />}
    </div>
  );
}

// ============================================
// CalendarDay Component
// ============================================

interface CalendarDayProps {
  calendarDate: CalendarDate;
  onClick: () => void;
}

function CalendarDay({ calendarDate, onClick }: CalendarDayProps) {
  const t = useTranslations("attendance");
  const {
    date,
    isCurrentMonth,
    isToday,
    isSelected,
    isHoliday,
    isLeave,
    isWeekend,
    data,
  } = calendarDate;

  const dayNumber = date.getDate();

  // Xác định màu nền và text
  let bgClass = "";
  let textClass = "";

  if (!isCurrentMonth) {
    textClass = "text-muted-foreground/50";
  } else if (isSelected) {
    bgClass = "bg-primary";
    textClass = "text-primary-foreground";
  } else if (isToday) {
    bgClass = "bg-accent";
    textClass = "text-accent-foreground";
  } else if (isHoliday) {
    bgClass = "bg-blue-100 dark:bg-blue-900/30";
    textClass = "text-blue-700 dark:text-blue-300";
  } else if (isLeave) {
    bgClass = "bg-yellow-100 dark:bg-yellow-900/30";
    textClass = "text-yellow-700 dark:text-yellow-300";
  } else if (isWeekend) {
    textClass = "text-red-500 dark:text-red-400";
  }

  // Xác định status label và màu
  let statusLabel = "";
  let statusClass = "";

  if (isCurrentMonth && data?.status) {
    if (data.isLate) {
      statusLabel = t("legend.late");
      statusClass = "text-orange-600 dark:text-orange-400";
    } else if (data.isEarlyLeave) {
      statusLabel = t("legend.earlyLeave");
      statusClass = "text-yellow-600 dark:text-yellow-400";
    } else if (data.status === "present") {
      statusLabel = t("legend.present");
      statusClass = "text-green-600 dark:text-green-400";
    } else if (data.status === "absent") {
      statusLabel = t("legend.absent");
      statusClass = "text-red-600 dark:text-red-400";
    } else if (data.status === "leave") {
      statusLabel = t("legend.leave");
      statusClass = "text-purple-600 dark:text-purple-400";
    } else if (data.status === "holiday") {
      statusLabel = t("legend.holiday");
      statusClass = "text-blue-600 dark:text-blue-400";
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isCurrentMonth}
      className={cn(
        "relative aspect-square p-1 rounded-md transition-colors flex flex-col items-center justify-center gap-0.5",
        "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
        "disabled:cursor-default disabled:hover:bg-transparent",
        isCurrentMonth && "cursor-pointer",
        bgClass,
      )}
      title={data?.holidayName || data?.leaveType || undefined}
    >
      <span className={cn("text-sm font-medium", textClass)}>{dayNumber}</span>

      {/* Status text label */}
      {statusLabel && (
        <span
          className={cn("text-[10px] font-medium leading-none", statusClass)}
        >
          {statusLabel}
        </span>
      )}
    </button>
  );
}

// ============================================
// CalendarLegend Component
// ============================================

function CalendarLegend() {
  const t = useTranslations("attendance");

  const legends = [
    { color: "text-green-600", label: t("legend.present") },
    { color: "text-red-600", label: t("legend.absent") },
    { color: "text-orange-600", label: t("legend.late") },
    { color: "text-yellow-600", label: t("legend.earlyLeave") },
    { color: "text-purple-600", label: t("legend.leave") },
    { color: "text-blue-600", label: t("legend.holiday") },
  ];

  return (
    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
      {legends.map((legend) => (
        <div key={legend.label} className="flex items-center gap-1.5">
          <span className={cn("text-xs font-medium", legend.color)}>
            {legend.label}
          </span>
        </div>
      ))}
    </div>
  );
}
