/**
 * Utility functions để format thông tin người yêu cầu (requester)
 * Sử dụng cho deposit requests và các views liên quan
 */

import { SupportedLocale } from "./format-currency";

/**
 * Thông tin người yêu cầu
 */
export interface RequesterInfo {
  requestedBy: string; // Employee code
  requesterName?: string; // Tên người yêu cầu
  requesterEmail?: string; // Email người yêu cầu
}

/**
 * Format tên người yêu cầu để hiển thị
 * - Nếu có requesterName thì hiển thị requesterName
 * - Nếu không có requesterName thì fallback về requestedBy (employee code)
 *
 * @param info Thông tin người yêu cầu
 * @returns Tên hiển thị
 */
export function formatRequesterName(info: RequesterInfo): string {
  if (info.requesterName && info.requesterName.trim()) {
    return info.requesterName.trim();
  }
  return info.requestedBy || "-";
}

/**
 * Format thông tin đầy đủ của người yêu cầu
 * Bao gồm: name, email, employee code
 *
 * @param info Thông tin người yêu cầu
 * @param locale Ngôn ngữ hiển thị
 * @returns Object chứa các thông tin đã format
 */
export function formatRequesterFullInfo(
  info: RequesterInfo,
  locale: SupportedLocale = "vi",
): {
  displayName: string;
  email: string;
  employeeCode: string;
  labels: {
    name: string;
    email: string;
    employeeCode: string;
  };
} {
  const labels = {
    vi: {
      name: "Tên",
      email: "Email",
      employeeCode: "Mã nhân viên",
    },
    en: {
      name: "Name",
      email: "Email",
      employeeCode: "Employee Code",
    },
    ja: {
      name: "名前",
      email: "メール",
      employeeCode: "社員コード",
    },
  };

  return {
    displayName: formatRequesterName(info),
    email: info.requesterEmail || "-",
    employeeCode: info.requestedBy || "-",
    labels: labels[locale],
  };
}
