import { formatDateWithDayOfWeek } from "@/lib/utils/format-date-time";
import type { SupportedLocale } from "@/lib/utils/format-currency";

/**
 * Utility functions cho hệ thống thông báo
 * - Dịch notification code với params interpolation
 * - Format thời gian tương đối
 */

/**
 * Type cho translation function từ useTranslations('notifications')
 */
type NotificationTranslationFunction = (
  key: string,
  params?: Record<string, string | number>,
) => string;

/**
 * Dịch notification code sang message với params interpolation
 * Sử dụng next-intl translation function
 *
 * @param code - Notification code (e.g., "LEAVE_APPROVED", "DEPOSIT_REJECTED")
 * @param params - Params để interpolate vào message (e.g., { employeeName: "John" })
 * @param t - Translation function từ useTranslations('notifications')
 * @returns Message đã dịch với params được thay thế, hoặc code nếu không tìm thấy translation
 *
 * @example
 * ```tsx
 * const t = useTranslations('notifications');
 *
 * // Dịch notification code
 * const message = translateNotification('LEAVE_SUBMITTED', { employeeName: 'Nguyễn Văn A' }, t);
 * // Result: "Nguyễn Văn A đã gửi đơn xin nghỉ phép"
 *
 * // Nếu không có params
 * const message = translateNotification('LEAVE_APPROVED', {}, t);
 * // Result: "Đơn xin nghỉ phép của bạn đã được duyệt"
 * ```
 */
export function translateNotification(
  code: string,
  params: Record<string, string | number>,
  t: NotificationTranslationFunction,
  locale?: SupportedLocale,
): string {
  if (!code) return "";

  try {
    // Format tất cả params có dạng date yyyy-MM-dd thành ngày có thứ
    const formattedParams = { ...params };
    if (locale) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      for (const key of Object.keys(formattedParams)) {
        const value = formattedParams[key];
        if (typeof value === "string" && dateRegex.test(value)) {
          formattedParams[key] = formatDateWithDayOfWeek(value, locale);
        }
      }
    }

    // Nếu startDate === endDate (nghỉ 1 ngày), dùng key _SINGLE
    let resolvedCode = code;
    if (
      params.startDate &&
      params.endDate &&
      params.startDate === params.endDate
    ) {
      resolvedCode = `${code}_SINGLE`;
    }

    // Lấy translation từ namespace codes
    let translationKey = `codes.${resolvedCode}`;
    let translated = t(translationKey, formattedParams);

    // Fallback về code gốc nếu không tìm thấy _SINGLE
    if (
      resolvedCode !== code &&
      (translated === translationKey ||
        translated === `notifications.${translationKey}`)
    ) {
      translationKey = `codes.${code}`;
      translated = t(translationKey, formattedParams);
    }

    // next-intl trả về key nếu không tìm thấy translation
    // Kiểm tra xem kết quả có phải là key gốc không
    if (
      translated === translationKey ||
      translated === `notifications.${translationKey}`
    ) {
      return code;
    }

    return translated;
  } catch {
    // Fallback về code nếu có lỗi
    return code;
  }
}

/**
 * Format timestamp thành chuỗi thời gian tương đối
 * - "Vừa xong" cho < 1 phút
 * - "X phút trước" cho < 1 giờ
 * - "X giờ trước" cho < 24 giờ
 * - "X ngày trước" cho >= 24 giờ
 *
 * @param createdAt - Timestamp ISO string (e.g., "2024-01-21T09:00:00")
 * @param t - Translation function từ useTranslations('notifications')
 * @returns Chuỗi thời gian tương đối đã dịch
 *
 * @example
 * ```tsx
 * const t = useTranslations('notifications');
 *
 * // Vừa xong (< 1 phút)
 * formatNotificationTime('2024-01-21T09:59:30', t); // "Vừa xong"
 *
 * // Phút trước (< 1 giờ)
 * formatNotificationTime('2024-01-21T09:30:00', t); // "30 phút trước"
 *
 * // Giờ trước (< 24 giờ)
 * formatNotificationTime('2024-01-21T06:00:00', t); // "4 giờ trước"
 *
 * // Ngày trước (>= 24 giờ)
 * formatNotificationTime('2024-01-19T09:00:00', t); // "2 ngày trước"
 * ```
 */
export function formatNotificationTime(
  createdAt: string,
  t: NotificationTranslationFunction,
): string {
  if (!createdAt) return "";

  try {
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // Tính toán các đơn vị thời gian
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // < 1 phút: "Vừa xong"
    if (diffMinutes < 1) {
      return t("timeAgo.justNow");
    }

    // < 1 giờ: "X phút trước"
    if (diffHours < 1) {
      return t("timeAgo.minutesAgo", { count: diffMinutes });
    }

    // < 24 giờ: "X giờ trước"
    if (diffDays < 1) {
      return t("timeAgo.hoursAgo", { count: diffHours });
    }

    // >= 24 giờ: "X ngày trước"
    return t("timeAgo.daysAgo", { count: diffDays });
  } catch {
    return "";
  }
}
