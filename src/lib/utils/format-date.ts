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
  locale: SupportedLocale = "vi",
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
  locale: SupportedLocale = "vi",
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
  locale: SupportedLocale = "vi",
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
 * Format thời gian theo locale
 * Format: HH:mm
 *
 * @param time - Date object, chuỗi thời gian ISO, hoặc null/undefined
 * @returns Chuỗi thời gian đã format hoặc "-" nếu invalid
 */
export function formatTime(time: Date | string | null | undefined): string {
  if (!time) return "-";

  const d = typeof time === "string" ? new Date(time) : time;
  if (isNaN(d.getTime())) return "-";

  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

/**
 * Format số phút thành chuỗi thời lượng theo locale
 * - Vietnamese/English: HH:mm (e.g., 01:30, 00:45)
 * - Japanese: X時YY分 (e.g., 1時30分, 45分)
 * Nếu không có dữ liệu hoặc giá trị âm -> "--:--"
 *
 * @param minutes - Số phút
 * @param options - Tùy chọn format
 * @param options.zeroAsEmpty - Nếu true, giá trị 0 sẽ hiển thị "--:--"
 * @param options.locale - Locale code (vi, en, ja). Mặc định "vi"
 * @returns Chuỗi thời gian dạng HH:mm hoặc X時YY分 hoặc "--:--" nếu invalid/âm
 */
export function formatMinutesToTime(
  minutes: number | undefined | null,
  options?: { zeroAsEmpty?: boolean; locale?: SupportedLocale },
): string {
  if (
    minutes === undefined ||
    minutes === null ||
    isNaN(minutes) ||
    minutes < 0
  ) {
    return "--:--";
  }
  if (options?.zeroAsEmpty && minutes === 0) {
    return "--:--";
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const locale = options?.locale || "vi";

  if (locale === "ja") {
    return hours > 0
      ? `${hours}時${mins.toString().padStart(2, "0")}分`
      : `${mins}分`;
  }

  // Vietnamese và English dùng format HH:mm
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
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

/**
 * Lấy tên ngày trong tuần theo locale
 * - Vietnamese: T2, T3, T4, T5, T6, T7, CN
 * - English: Mon, Tue, Wed, Thu, Fri, Sat, Sun
 * - Japanese: 月, 火, 水, 木, 金, 土, 日
 *
 * @param date - Date object hoặc chuỗi ngày ISO
 * @param locale - Locale code (vi, en, ja)
 * @returns Tên ngày trong tuần viết tắt
 */
export function getDayOfWeek(
  date: Date | string | null | undefined,
  locale: SupportedLocale = "vi",
): string {
  if (!date) return "-";

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";

  const dayIndex = d.getDay(); // 0 = Sunday, 1 = Monday, ...

  const dayNames: Record<SupportedLocale, string[]> = {
    vi: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    ja: ["日", "月", "火", "水", "木", "金", "土"],
  };

  return dayNames[locale][dayIndex];
}

/**
 * Format ngày với ngày trong tuần
 * - Vietnamese: T2, 31/12/2025
 * - English: Mon, 31/12/2025
 * - Japanese: 月, 2025年12月31日
 *
 * @param date - Date object hoặc chuỗi ngày ISO
 * @param locale - Locale code (vi, en, ja)
 * @returns Chuỗi ngày với ngày trong tuần
 */
export function formatDateWithDayOfWeek(
  date: Date | string | null | undefined,
  locale: SupportedLocale = "vi",
): string {
  if (!date) return "-";

  const dayOfWeek = getDayOfWeek(date, locale);
  const dateStr = formatDate(date, locale);

  if (dayOfWeek === "-" || dateStr === "-") return "-";

  return `${dayOfWeek}, ${dateStr}`;
}
