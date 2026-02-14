import { SupportedLocale } from "./format-currency";

interface PayslipInfo {
  year: number;
  month: number;
  paidAt: string;
  employeeCode?: string;
}

/**
 * Format tên file payslip theo locale
 * @param info - Thông tin payslip
 * @param locale - Locale hiện tại
 * @returns Tên file payslip
 */
export function formatPayslipFilename(
  info: PayslipInfo,
  locale: SupportedLocale,
): string {
  const paidDate = new Date(info.paidAt);
  const day = paidDate.getDate();

  if (locale === "ja") {
    const reiwaYear = info.year - 2018;
    return `${info.year}(令和${String(reiwaYear).padStart(2, "0")})年${info.month}月${day}日支給分 給与明細`;
  } else if (locale === "vi") {
    return `Phieu_luong_thang_${info.month}_${info.year}`;
  } else {
    return `Payslip_${info.month}_${info.year}`;
  }
}

/**
 * Format title payslip (không bao gồm "給与明細")
 * @param info - Thông tin payslip
 * @param locale - Locale hiện tại
 * @returns Title payslip
 */
export function formatPayslipTitle(
  info: PayslipInfo,
  locale: SupportedLocale,
): string {
  const paidDate = new Date(info.paidAt);
  const day = paidDate.getDate();

  if (locale === "ja") {
    const reiwaYear = info.year - 2018;
    return `${info.year}（令和${String(reiwaYear).padStart(2, "0")}）年${info.month}月${day}日支給分`;
  } else if (locale === "vi") {
    const dateStr = paidDate.toLocaleDateString("vi-VN");
    return `Phiếu lương tháng ${info.month}/${info.year} - Trả ngày ${dateStr}`;
  } else {
    const dateStr = paidDate.toLocaleDateString("en-US");
    return `Payslip ${info.month}/${info.year} - Paid on ${dateStr}`;
  }
}

/**
 * Format full payslip title (bao gồm cả document label)
 * Dùng cho list view
 * @param info - Thông tin payslip
 * @param locale - Locale hiện tại
 * @returns Full title với document label
 */
export function formatPayslipFullTitle(
  info: PayslipInfo,
  locale: SupportedLocale,
): string {
  const title = formatPayslipTitle(info, locale);
  const label = getPayslipDocumentLabel(locale);

  if (locale === "ja") {
    return `${title} ${label}`;
  } else {
    return title;
  }
}

/**
 * Format document type label
 * @param locale - Locale hiện tại
 * @returns Document type label
 */
export function getPayslipDocumentLabel(locale: SupportedLocale): string {
  if (locale === "ja") {
    return "給与明細";
  } else if (locale === "vi") {
    return "Phiếu lương";
  } else {
    return "Payslip";
  }
}
