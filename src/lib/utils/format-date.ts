import type { SupportedLocale } from "./format-currency";

/**
 * Mapping locale sang locale string cho Intl.RelativeTimeFormat
 */
const LOCALE_STRING_MAP: Record<SupportedLocale, string> = {
  vi: "vi-VN",
  en: "en-US",
  ja: "ja-JP",
};

/**
 * Format ngày theo locale với format cố định
 * - Vietnamese/English: dd/MM/yyyy (e.g., 31/12/2025)
 * - Japanese: yyyy年MM月dd日 (e.g., 2025年12月31日)
 *
 * @param date - Date object, chuỗi ngày ISO, hoặc null/undefined
 * @param locale - Locale code (vi, en, ja)
 * @returns Chuỗi ngày đã format hoặc "-" nếu invalid
 */
export function formatDate(
  date: Date | string | null | undefined,
  locale: SupportedLocale = "en",
): string {
  if (!date) return "-";

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";

  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();

  if (locale === "ja") {
    return `${year}年${month}月${day}日`;
  }

  // Vietnamese và English dùng cùng format
  return `${day}/${month}/${year}`;
}

/**
 * Format ngày giờ theo locale với format cố định
 * - Vietnamese/English: dd/MM/yyyy HH:mm
 * - Japanese: yyyy年MM月dd日 HH:mm
 *
 * @param date - Date object, chuỗi ngày ISO, hoặc null/undefined
 * @param locale - Locale code (vi, en, ja)
 * @returns Chuỗi ngày giờ đã format hoặc "-" nếu invalid
 */
export function formatDateTime(
  date: Date | string | null | undefined,
  locale: SupportedLocale = "en",
): string {
  if (!date) return "-";

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";

  const dateStr = formatDate(d, locale);
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");

  return `${dateStr} ${hours}:${minutes}`;
}

/**
 * Format relative time (e.g., "2 ngày trước", "in 3 hours", "3時間後")
 * Sử dụng Intl.RelativeTimeFormat cho locale-aware formatting
 *
 * @param date - Date object hoặc chuỗi ngày ISO
 * @param locale - Locale code (vi, en, ja)
 * @returns Chuỗi thời gian tương đối
 */
export function formatRelativeTime(
  date: Date | string,
  locale: SupportedLocale = "en",
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";

  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const localeString = LOCALE_STRING_MAP[locale];

  const rtf = new Intl.RelativeTimeFormat(localeString, {
    numeric: "auto",
  });

  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    return rtf.format(diffHours, "hour");
  }

  return rtf.format(diffDays, "day");
}

/**
 * Format tháng từ chuỗi "YYYY-MM"
 * @param monthStr - Chuỗi tháng dạng "YYYY-MM" (ví dụ: "2024-12")
 * @param locale - Locale code (vi, en, ja)
 * @returns Chuỗi tháng đã format (ví dụ: "Tháng 12, 2024")
 */
export function formatMonth(
  monthStr: string | undefined | null,
  locale: SupportedLocale = "vi",
): string {
  if (!monthStr) return "-";

  try {
    const [year, month] = monthStr.split("-");
    if (!year || !month) return "-";

    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    if (isNaN(date.getTime())) return "-";

    const localeString = LOCALE_STRING_MAP[locale] || "vi-VN";

    return date.toLocaleDateString(localeString, {
      year: "numeric",
      month: "long",
    });
  } catch {
    return "-";
  }
}

/**
 * Format ngày cho API request (ISO format: yyyy-MM-dd)
 * Dùng khi gửi date filter đến backend
 *
 * @param date - Date object hoặc null/undefined
 * @returns Chuỗi ngày dạng yyyy-MM-dd hoặc undefined nếu invalid
 */
export function formatDateForApi(
  date: Date | null | undefined,
): string | undefined {
  if (!date) return undefined;
  if (isNaN(date.getTime())) return undefined;

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}
