"use client";

import { toast } from "sonner";

/**
 * Các message thành công mặc định theo loại thao tác
 */
export const SUCCESS_MESSAGES = {
  // CRUD operations
  create: {
    vi: "Tạo mới thành công",
    en: "Created successfully",
    ja: "作成しました",
  },
  update: {
    vi: "Cập nhật thành công",
    en: "Updated successfully",
    ja: "更新しました",
  },
  delete: {
    vi: "Xóa thành công",
    en: "Deleted successfully",
    ja: "削除しました",
  },
  save: {
    vi: "Lưu thành công",
    en: "Saved successfully",
    ja: "保存しました",
  },

  // Wallet operations
  addBalance: {
    vi: "Thêm tiền thành công",
    en: "Balance added successfully",
    ja: "残高が追加されました",
  },
  deductBalance: {
    vi: "Trừ tiền thành công",
    en: "Balance deducted successfully",
    ja: "残高が控除されました",
  },

  // Deposit operations
  approveDeposit: {
    vi: "Duyệt yêu cầu thành công",
    en: "Request approved successfully",
    ja: "リクエストが承認されました",
  },
  rejectDeposit: {
    vi: "Từ chối yêu cầu thành công",
    en: "Request rejected successfully",
    ja: "リクエストが却下されました",
  },
  createDeposit: {
    vi: "Tạo yêu cầu nạp tiền thành công",
    en: "Deposit request created successfully",
    ja: "入金リクエストが作成されました",
  },

  // Commission operations
  markAsPaid: {
    vi: "Đã đánh dấu thanh toán thành công",
    en: "Marked as paid successfully",
    ja: "支払い済みとしてマークしました",
  },

  // Auth operations
  login: {
    vi: "Đăng nhập thành công",
    en: "Login successful",
    ja: "ログインしました",
  },
  logout: {
    vi: "Đăng xuất thành công",
    en: "Logout successful",
    ja: "ログアウトしました",
  },
  register: {
    vi: "Đăng ký thành công",
    en: "Registration successful",
    ja: "登録しました",
  },
  resetPassword: {
    vi: "Đặt lại mật khẩu thành công",
    en: "Password reset successful",
    ja: "パスワードがリセットされました",
  },

  // Generic
  success: {
    vi: "Thao tác thành công",
    en: "Operation successful",
    ja: "操作が成功しました",
  },
} as const;

export type SuccessMessageKey = keyof typeof SUCCESS_MESSAGES;
export type SupportedLocale = "vi" | "en" | "ja";

/**
 * Hiển thị toast thành công với message theo locale
 * @client-only
 *
 * @param messageKey - Key của message trong SUCCESS_MESSAGES
 * @param locale - Locale hiện tại (mặc định: vi)
 * @param customMessage - Message tùy chỉnh (override message mặc định)
 */
export function showSuccessToast(
  messageKey: SuccessMessageKey,
  locale: SupportedLocale = "vi",
  customMessage?: string,
): void {
  const message = customMessage || SUCCESS_MESSAGES[messageKey][locale];
  toast.success(message);
}

/**
 * Hiển thị toast thành công với message tùy chỉnh
 * @client-only
 *
 * @param message - Message hiển thị
 */
export function showSuccess(message: string): void {
  toast.success(message);
}

/**
 * Hiển thị toast info
 * @client-only
 *
 * @param message - Message hiển thị
 */
export function showInfo(message: string): void {
  toast.info(message);
}

/**
 * Hiển thị toast warning
 * @client-only
 *
 * @param message - Message hiển thị
 */
export function showWarning(message: string): void {
  toast.warning(message);
}

/**
 * Hiển thị toast với promise (loading -> success/error)
 * @client-only
 *
 * @param promise - Promise cần theo dõi
 * @param messages - Các message cho từng trạng thái
 */
export function showPromiseToast<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  },
): Promise<T> {
  toast.promise(promise, messages);
  return promise;
}
