/**
 * Format tiền tệ theo locale
 * @param amount - Số tiền cần format
 * @param locale - Locale code (vi, en, ja)
 * @returns Chuỗi đã format theo locale
 *
 * Format theo locale:
 * - vi: "1.000.000 ₫" (VND)
 * - en: "$1,000,000" (USD)
 * - ja: "¥1,000,000" (JPY)
 */

export type SupportedLocale = "vi" | "en" | "ja";

// Mapping locale sang currency code và locale string cho Intl
const LOCALE_CURRENCY_MAP: Record<
  SupportedLocale,
  { currency: string; localeString: string }
> = {
  vi: { currency: "VND", localeString: "vi-VN" },
  en: { currency: "USD", localeString: "en-US" },
  ja: { currency: "JPY", localeString: "ja-JP" },
};

/**
 * Format số tiền theo locale
 * @param amount - Số tiền (number)
 * @param locale - Locale code (vi, en, ja)
 * @returns Chuỗi đã format
 */
export function formatCurrency(
  amount: number,
  locale: SupportedLocale = "vi",
): string {
  const config = LOCALE_CURRENCY_MAP[locale];

  if (!config) {
    // Fallback to vi if locale not supported
    return formatCurrency(amount, "vi");
  }

  try {
    const formatter = new Intl.NumberFormat(config.localeString, {
      style: "currency",
      currency: config.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    return formatter.format(amount);
  } catch {
    // Fallback format nếu Intl không hoạt động
    return `${amount.toLocaleString()} ${config.currency}`;
  }
}

/**
 * Kiểm tra format tiền tệ có hợp lệ theo locale không
 * @param formatted - Chuỗi đã format
 * @param locale - Locale code
 * @returns true nếu format hợp lệ
 */
export function isValidCurrencyFormat(
  formatted: string,
  locale: SupportedLocale,
): boolean {
  if (!formatted || typeof formatted !== "string") {
    return false;
  }

  // Kiểm tra có chứa ký hiệu tiền tệ phù hợp
  switch (locale) {
    case "vi":
      // VND format: có thể là "1.000.000 ₫" hoặc "1.000.000 VND"
      return formatted.includes("₫") || formatted.includes("VND");
    case "en":
      // USD format: "$1,000,000"
      return formatted.includes("$");
    case "ja":
      // JPY format: "¥1,000,000" hoặc "￥1,000,000"
      return formatted.includes("¥") || formatted.includes("￥");
    default:
      return false;
  }
}

/**
 * Parse chuỗi tiền tệ về số
 * @param formatted - Chuỗi đã format
 * @returns Số tiền hoặc NaN nếu không parse được
 */
export function parseCurrency(formatted: string): number {
  if (!formatted) return NaN;

  // Loại bỏ tất cả ký tự không phải số và dấu trừ
  const cleaned = formatted.replace(/[^\d-]/g, "");
  return parseInt(cleaned, 10) || 0;
}
