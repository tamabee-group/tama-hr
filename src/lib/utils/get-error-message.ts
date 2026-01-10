/**
 * Utility để lấy translated error message từ error code
 * Sử dụng với next-intl useTranslations('errors')
 */

/**
 * Type cho translation function từ useTranslations('errors')
 * Chấp nhận bất kỳ function nào nhận string và trả về string
 */
type ErrorTranslationFunction = (key: string) => string;

/**
 * Danh sách các error codes đã biết từ backend
 * Dùng để type-check và documentation
 */
export const KNOWN_ERROR_CODES = [
  "INVALID_CREDENTIALS",
  "EMAIL_EXISTS",
  "USER_NOT_FOUND",
  "COMPANY_NOT_FOUND",
  "INVALID_OTP",
  "OTP_EXPIRED",
  "INSUFFICIENT_BALANCE",
  "PLAN_IN_USE",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "VALIDATION_ERROR",
  "INTERNAL_ERROR",
  "TENANT_DOMAIN_EXISTS",
  "TENANT_DOMAIN_RESERVED",
  "TENANT_PROVISIONING_FAILED",
  "USER_CREATION_FAILED",
] as const;

export type KnownErrorCode = (typeof KNOWN_ERROR_CODES)[number];

/**
 * Map backend error code sang translated message
 * Falls back to generic error nếu key không tồn tại
 *
 * @param errorCodeOrError - Error code string hoặc Error object với errorCode property
 * @param t - Translation function từ useTranslations('errors')
 * @param fallbackMessage - Optional fallback message nếu không tìm thấy translation
 * @returns Translated error message
 *
 * @example
 * ```tsx
 * const tErrors = useTranslations('errors');
 *
 * // Với error code string
 * const message = getErrorMessage('INVALID_CREDENTIALS', tErrors);
 *
 * // Với error object
 * try {
 *   await api.login(data);
 * } catch (error) {
 *   const message = getErrorMessage(error, tErrors);
 *   toast.error(message);
 * }
 * ```
 */
export function getErrorMessage(
  errorCodeOrError: unknown,
  t: ErrorTranslationFunction,
  fallbackMessage?: string,
): string {
  // Extract errorCode từ error object nếu cần
  let errorCode: string | undefined | null;
  let originalMessage: string | undefined;

  if (typeof errorCodeOrError === "string") {
    errorCode = errorCodeOrError;
  } else if (errorCodeOrError && typeof errorCodeOrError === "object") {
    // Check if it's an ApiError or API error with errorCode
    const error = errorCodeOrError as {
      errorCode?: string;
      message?: string;
    };
    errorCode = error.errorCode;
    originalMessage = error.message;
  }

  // Log để debug
  console.log("getErrorMessage:", {
    errorCode,
    originalMessage,
    fallbackMessage,
  });

  // Nếu không có errorCode, trả về message gốc hoặc fallback
  if (!errorCode) {
    return originalMessage || fallbackMessage || t("generic");
  }

  // Nếu errorCode chứa khoảng trắng hoặc tiếng Việt, đó là message không phải code
  // Trả về message gốc thay vì cố translate
  if (
    errorCode.includes(" ") ||
    /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
      errorCode,
    )
  ) {
    return errorCode;
  }

  // Thử lấy translation cho error code cụ thể
  try {
    const translated = t(errorCode);
    // next-intl trả về key nếu không tìm thấy translation
    // Kiểm tra xem kết quả có phải là key gốc không
    if (translated === errorCode || translated === `errors.${errorCode}`) {
      return originalMessage || fallbackMessage || t("generic");
    }
    return translated;
  } catch {
    // Fallback to generic nếu có lỗi
    return originalMessage || fallbackMessage || t("generic");
  }
}

/**
 * Kiểm tra xem error code có phải là known error code không
 *
 * @param errorCode - Error code cần kiểm tra
 * @returns true nếu là known error code
 */
export function isKnownErrorCode(
  errorCode: string | undefined | null,
): errorCode is KnownErrorCode {
  if (!errorCode) return false;
  return KNOWN_ERROR_CODES.includes(errorCode as KnownErrorCode);
}
