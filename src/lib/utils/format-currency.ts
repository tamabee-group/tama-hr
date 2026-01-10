/**
 * Format tiền tệ - LUÔN hiển thị JPY (¥)
 * @param amount - Số tiền JPY
 * @returns Chuỗi đã format (¥1,000)
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

// Tỷ giá quy đổi từ JPY
const EXCHANGE_RATES: Record<SupportedLocale, number> = {
  vi: 170, // 1 JPY = 170 VND
  en: 1 / 150, // 150 JPY = 1 USD -> 1 JPY = 0.00667 USD
  ja: 1,
};

/**
 * Format số tiền JPY - luôn hiển thị ¥ bất kể locale
 * @param amount - Số tiền JPY
 * @returns Chuỗi đã format (¥1,000)
 */
export function formatCurrency(amount: number): string {
  try {
    const formatter = new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(amount);
  } catch {
    return `¥${amount.toLocaleString()}`;
  }
}

/**
 * Format tiền theo locale cụ thể (VND, USD, JPY)
 * @param amount - Số tiền
 * @param locale - Locale code (vi, en, ja)
 * @returns Chuỗi đã format theo locale
 */
export function formatCurrencyByLocale(
  amount: number,
  locale: SupportedLocale,
): string {
  const config = LOCALE_CURRENCY_MAP[locale];

  if (!config) {
    return formatCurrency(amount);
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
    return `${amount.toLocaleString()} ${config.currency}`;
  }
}

/**
 * Format giá JPY với quy đổi theo locale
 * - vi: ¥1,000 (~170,000₫)
 * - en: ¥1,000 (~$6)
 * - ja: ¥1,000
 * @param amountJPY - Số tiền JPY
 * @param locale - Locale code
 * @returns Object chứa giá JPY và giá quy đổi
 */
export function formatPriceWithConversion(
  amountJPY: number,
  locale: SupportedLocale,
): { jpy: string; converted: string | null } {
  const jpyFormatted = formatCurrency(amountJPY);

  // Tiếng Nhật không cần quy đổi
  if (locale === "ja") {
    return { jpy: jpyFormatted, converted: null };
  }

  const rate = EXCHANGE_RATES[locale];
  const convertedAmount = Math.floor(amountJPY * rate);
  const convertedFormatted = formatCurrencyByLocale(convertedAmount, locale);

  return { jpy: jpyFormatted, converted: convertedFormatted };
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
      return formatted.includes("¥") || formatted.includes("￥");
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
