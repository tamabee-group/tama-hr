import type { SupportedLocale } from "./format-currency";

/**
 * Mapping locale sang locale string cho Intl.DateTimeFormat
 */
const LOCALE_STRING_MAP: Record<SupportedLocale, string> = {
  vi: "vi-VN",
  en: "en-US",
  ja: "ja-JP",
};

/**
 * Format ngày giờ đầy đủ theo locale
 * @param dateString - Chuỗi ngày ISO hoặc timestamp
 * @param locale - Locale code (vi, en, ja)
 * @returns Chuỗi ngày giờ đã format (ví dụ: "25/12/2024 14:30")
 */
export function formatDateTime(
  dateString: string | undefined | null,
  locale: SupportedLocale = "vi",
): string {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";

    const localeString = LOCALE_STRING_MAP[locale] || "vi-VN";

    return date.toLocaleString(localeString, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
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
 * Format chỉ ngày theo locale
 * @param dateString - Chuỗi ngày ISO hoặc timestamp
 * @param locale - Locale code (vi, en, ja)
 * @returns Chuỗi ngày đã format (ví dụ: "25/12/2024")
 */
export function formatDate(
  dateString: string | undefined | null,
  locale: SupportedLocale = "vi",
): string {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";

    const localeString = LOCALE_STRING_MAP[locale] || "vi-VN";

    return date.toLocaleDateString(localeString, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "-";
  }
}
