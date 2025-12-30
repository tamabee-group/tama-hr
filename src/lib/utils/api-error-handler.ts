"use client";

import { toast } from "sonner";
import { ApiError } from "./fetch-client";

/**
 * Các message lỗi mặc định theo HTTP status code
 */
const DEFAULT_ERROR_MESSAGES: Record<number, string> = {
  400: "Yêu cầu không hợp lệ",
  401: "Phiên đăng nhập hết hạn",
  403: "Bạn không có quyền thực hiện thao tác này",
  404: "Không tìm thấy tài nguyên",
  409: "Dữ liệu đã tồn tại",
  500: "Lỗi server, vui lòng thử lại sau",
};

/**
 * Các message lỗi theo error code từ backend
 */
const ERROR_CODE_MESSAGES: Record<string, string> = {
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này",
  UNAUTHORIZED: "Phiên đăng nhập hết hạn",
  NOT_FOUND: "Không tìm thấy tài nguyên",
  VALIDATION_ERROR: "Dữ liệu không hợp lệ",
  CONFLICT: "Dữ liệu đã tồn tại",
  INTERNAL_ERROR: "Lỗi server, vui lòng thử lại sau",
};

export interface HandleApiErrorOptions {
  /** Message tùy chỉnh cho lỗi 403 */
  forbiddenMessage?: string;
  /** Message tùy chỉnh cho các lỗi khác */
  defaultMessage?: string;
  /** Có hiển thị toast không (mặc định: true) */
  showToast?: boolean;
  /** Callback khi gặp lỗi 403 */
  onForbidden?: () => void;
  /** Callback khi gặp lỗi 401 */
  onUnauthorized?: () => void;
}

/**
 * Xử lý lỗi API và hiển thị toast phù hợp
 * @client-only - Chỉ sử dụng được ở client side
 *
 * @param error - Lỗi từ API call
 * @param options - Các tùy chọn xử lý lỗi
 * @returns Message lỗi đã được xử lý
 */
export function handleApiError(
  error: unknown,
  options: HandleApiErrorOptions = {},
): string {
  const {
    forbiddenMessage = DEFAULT_ERROR_MESSAGES[403],
    defaultMessage = "Có lỗi xảy ra, vui lòng thử lại",
    showToast = true,
    onForbidden,
    onUnauthorized,
  } = options;

  let message = defaultMessage;

  if (error instanceof ApiError) {
    // Xử lý theo status code
    if (error.status === 403) {
      message = forbiddenMessage;
      onForbidden?.();
    } else if (error.status === 401) {
      message = DEFAULT_ERROR_MESSAGES[401];
      onUnauthorized?.();
    } else if (error.errorCode && ERROR_CODE_MESSAGES[error.errorCode]) {
      // Xử lý theo error code từ backend
      message = ERROR_CODE_MESSAGES[error.errorCode];
    } else if (error.message) {
      // Sử dụng message từ API response
      message = error.message;
    } else if (DEFAULT_ERROR_MESSAGES[error.status]) {
      // Fallback theo status code
      message = DEFAULT_ERROR_MESSAGES[error.status];
    }
  } else if (error instanceof Error) {
    message = error.message || defaultMessage;
  }

  if (showToast) {
    toast.error(message);
  }

  return message;
}

/**
 * Kiểm tra lỗi có phải là lỗi 403 (Forbidden) không
 */
export function isForbiddenError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403;
}

/**
 * Kiểm tra lỗi có phải là lỗi 401 (Unauthorized) không
 */
export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

/**
 * Kiểm tra lỗi có phải là lỗi 404 (Not Found) không
 */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}
