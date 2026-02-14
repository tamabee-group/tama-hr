/**
 * Utility để lấy translated label cho enum values
 * Sử dụng với next-intl useTranslations('enums')
 *
 * Pattern: enums.{enumName}.{enumValue}
 * Ví dụ: enums.depositStatus.PENDING -> "Đang chờ" (vi)
 */

import type {
  DepositStatus,
  TransactionType,
  CommissionStatus,
  LanguageCode,
  LocaleCode,
  UserStatus,
  Gender,
} from "@/types/enums";

/**
 * Type cho translation function từ useTranslations('enums')
 */
type EnumTranslationFunction = (key: string) => string;

/**
 * Các enum names được hỗ trợ
 */
export type EnumName =
  | "depositStatus"
  | "transactionType"
  | "userStatus"
  | "userRole"
  | "commissionStatus"
  | "gender"
  | "language"
  | "locale"
  | "scheduleType"
  | "attendanceStatus"
  | "paymentStatus"
  | "adjustmentStatus"
  | "selectionStatus"
  | "allowanceType"
  | "deductionType"
  | "leaveType"
  | "leaveStatus"
  | "breakType"
  | "salaryType"
  | "shiftAssignmentStatus"
  | "swapRequestStatus"
  | "payrollPeriodStatus"
  | "payrollItemStatus"
  | "contractType"
  | "contractStatus"
  | "documentType"
  | "feedbackType"
  | "feedbackStatus"
  | "targetAudience";

/**
 * Lấy translated label cho enum value
 * Pattern: {enumName}.{enumValue}
 *
 * @param enumName - Tên enum (depositStatus, transactionType, etc.)
 * @param value - Giá trị enum (PENDING, APPROVED, etc.)
 * @param t - Translation function từ useTranslations('enums')
 * @returns Translated label
 *
 * @example
 * ```tsx
 * const tEnums = useTranslations('enums');
 * const label = getEnumLabel('depositStatus', 'PENDING', tEnums);
 * // Returns: "Đang chờ" (vi) / "Pending" (en) / "保留中" (ja)
 * ```
 */
export function getEnumLabel<T extends string>(
  enumName: EnumName,
  value: T,
  t: EnumTranslationFunction,
): string {
  const key = `${enumName}.${value}`;
  try {
    const translated = t(key);
    // Fallback to value nếu translation không tồn tại
    if (translated === key || translated === `enums.${key}`) {
      return value;
    }
    return translated;
  } catch {
    return value;
  }
}

/**
 * Lấy translated label cho DepositStatus
 */
export function getDepositStatusLabel(
  status: DepositStatus,
  t: EnumTranslationFunction,
): string {
  return getEnumLabel("depositStatus", status, t);
}

/**
 * Lấy translated label cho TransactionType
 */
export function getTransactionTypeLabel(
  type: TransactionType,
  t: EnumTranslationFunction,
): string {
  return getEnumLabel("transactionType", type, t);
}

/**
 * Lấy translated label cho CommissionStatus
 */
export function getCommissionStatusLabel(
  status: CommissionStatus,
  t: EnumTranslationFunction,
): string {
  return getEnumLabel("commissionStatus", status, t);
}

/**
 * Lấy translated label cho UserStatus
 */
export function getUserStatusLabel(
  status: UserStatus,
  t: EnumTranslationFunction,
): string {
  return getEnumLabel("userStatus", status, t);
}

/**
 * Lấy translated label cho UserRole
 */
export function getUserRoleLabel(
  role: string,
  t: EnumTranslationFunction,
): string {
  return getEnumLabel("userRole", role, t);
}

/**
 * Lấy translated label cho Gender
 */
export function getGenderLabel(
  gender: Gender,
  t: EnumTranslationFunction,
): string {
  return getEnumLabel("gender", gender, t);
}

/**
 * Lấy translated label cho Language
 */
export function getLanguageLabel(
  language: LanguageCode,
  t: EnumTranslationFunction,
): string {
  return getEnumLabel("language", language, t);
}

/**
 * Lấy translated label cho Locale
 */
export function getLocaleLabel(
  locale: LocaleCode,
  t: EnumTranslationFunction,
): string {
  return getEnumLabel("locale", locale, t);
}
