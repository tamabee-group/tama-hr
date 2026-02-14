"use client";

import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Time Formatting Utilities
// ============================================

/**
 * Format time string (HH:mm) theo locale
 * - Vietnamese/English: HH:mm (24h format)
 * - Japanese: HH時mm分
 * Hỗ trợ cả datetime string (ISO format) - sẽ extract phần time
 */
export function formatTime(
  time: string | null | undefined,
  locale: SupportedLocale = "en",
): string {
  if (!time) return "-";

  let hours: string;
  let minutes: string;

  // Kiểm tra nếu là ISO datetime string (có chứa "T")
  if (time.includes("T")) {
    const date = new Date(time);
    if (isNaN(date.getTime())) return "-";
    hours = date.getHours().toString().padStart(2, "0");
    minutes = date.getMinutes().toString().padStart(2, "0");
  } else {
    // Xử lý format "HH:mm" hoặc "HH:mm:ss"
    const parts = time.split(":");
    if (parts.length < 2) return "-";
    hours = parts[0];
    minutes = parts[1];
  }

  if (locale === "ja") {
    return `${hours}時${minutes}分`;
  }

  return `${hours}:${minutes}`;
}

/**
 * Format Date object thành time string theo locale
 */
export function formatTimeFromDate(
  date: Date | string | null | undefined,
  locale: SupportedLocale = "en",
): string {
  if (!date) return "-";

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";

  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");

  return formatTime(`${hours}:${minutes}`, locale);
}

/**
 * Format duration từ phút sang chuỗi dễ đọc
 * - null/undefined: "00:00"
 * - Số âm: "--:--"
 * - Vietnamese: 2 giờ 30 phút
 * - English: 2h 30m
 * - Japanese: 2時間30分
 */
export function formatDuration(
  minutes: number | null | undefined,
  locale: SupportedLocale = "en",
): string {
  // Không có dữ liệu -> 00:00
  if (minutes === null || minutes === undefined) return "00:00";

  // Số âm -> --:--
  if (minutes < 0) return "--:--";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (locale === "ja") {
    if (hours === 0) return `${mins}分`;
    if (mins === 0) return `${hours}時間`;
    return `${hours}時間${mins}分`;
  }

  if (locale === "vi") {
    if (hours === 0) return `${mins} phút`;
    if (mins === 0) return `${hours} giờ`;
    return `${hours} giờ ${mins} phút`;
  }

  // English
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Format time range (start - end)
 */
export function formatTimeRange(
  startTime: string | null | undefined,
  endTime: string | null | undefined,
  locale: SupportedLocale = "en",
): string {
  const start = formatTime(startTime, locale);
  const end = formatTime(endTime, locale);

  if (start === "-" && end === "-") return "-";
  if (end === "-") return start;
  if (start === "-") return end;

  return `${start} - ${end}`;
}

// ============================================
// TimeDisplay Component
// ============================================

interface TimeDisplayProps {
  /** Time string format "HH:mm" hoặc "HH:mm:ss" */
  time?: string | null;
  /** Date object để extract time */
  date?: Date | string | null;
  /** Custom className */
  className?: string;
  /** Hiển thị "-" khi không có giá trị */
  showPlaceholder?: boolean;
}

/**
 * Component hiển thị thời gian theo locale
 * Sử dụng time prop hoặc date prop (ưu tiên time)
 */
export function TimeDisplay({
  time,
  date,
  className,
  showPlaceholder = true,
}: TimeDisplayProps) {
  const locale = useLocale() as SupportedLocale;

  let displayTime: string;

  if (time) {
    displayTime = formatTime(time, locale);
  } else if (date) {
    displayTime = formatTimeFromDate(date, locale);
  } else {
    displayTime = showPlaceholder ? "-" : "";
  }

  if (!displayTime && !showPlaceholder) return null;

  return <span className={cn("tabular-nums", className)}>{displayTime}</span>;
}

// ============================================
// DurationDisplay Component
// ============================================

interface DurationDisplayProps {
  /** Duration in minutes */
  minutes?: number | null;
  /** Custom className */
  className?: string;
  /** Hiển thị "-" khi không có giá trị */
  showPlaceholder?: boolean;
}

/**
 * Component hiển thị duration theo locale
 */
export function DurationDisplay({
  minutes,
  className,
  showPlaceholder = true,
}: DurationDisplayProps) {
  const locale = useLocale() as SupportedLocale;

  const displayDuration = formatDuration(minutes, locale);

  if (displayDuration === "00:00" && !showPlaceholder) return null;

  return (
    <span className={cn("tabular-nums", className)}>{displayDuration}</span>
  );
}

// ============================================
// TimeRangeDisplay Component
// ============================================

interface TimeRangeDisplayProps {
  /** Start time string format "HH:mm" */
  startTime?: string | null;
  /** End time string format "HH:mm" */
  endTime?: string | null;
  /** Custom className */
  className?: string;
  /** Hiển thị "-" khi không có giá trị */
  showPlaceholder?: boolean;
}

/**
 * Component hiển thị khoảng thời gian theo locale
 */
export function TimeRangeDisplay({
  startTime,
  endTime,
  className,
  showPlaceholder = true,
}: TimeRangeDisplayProps) {
  const locale = useLocale() as SupportedLocale;

  const displayRange = formatTimeRange(startTime, endTime, locale);

  if (displayRange === "-" && !showPlaceholder) return null;

  return <span className={cn("tabular-nums", className)}>{displayRange}</span>;
}
