// Constants cho select/dropdown components
// Chỉ chứa enum values, translations được quản lý trong message files

// ============================================
// User Role Enums
// ============================================

// Các role của nhân viên Tamabee (chỉ giữ values)
export const TAMABEE_USER_ROLES = [
  "ADMIN_TAMABEE",
  "MANAGER_TAMABEE",
  "EMPLOYEE_TAMABEE",
] as const;

export type TamabeeUserRole = (typeof TAMABEE_USER_ROLES)[number];

// Các role của nhân viên công ty khách hàng (chỉ giữ values)
export const COMPANY_USER_ROLES = [
  "ADMIN_COMPANY",
  "MANAGER_COMPANY",
  "EMPLOYEE_COMPANY",
] as const;

export type CompanyUserRole = (typeof COMPANY_USER_ROLES)[number];

// Tất cả user roles
export type UserRole = TamabeeUserRole | CompanyUserRole;

// ============================================
// Language & Locale Enums
// ============================================

// Ngôn ngữ hỗ trợ (giữ flag vì không cần translate)
export const LANGUAGES = [
  { value: "vi", flag: "🇻🇳" },
  { value: "en", flag: "🇺🇸" },
  { value: "ja", flag: "🇯🇵" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["value"];

// Khu vực/Locale values
export const LOCALES = ["vi", "ja"] as const;

export type LocaleCode = (typeof LOCALES)[number];

// Normalize locale value - chuyển timezone về locale code
export const normalizeLocale = (locale: string): string => {
  const timezoneToLocale: Record<string, string> = {
    "Asia/Ho_Chi_Minh": "vi",
    "Asia/Tokyo": "ja",
  };
  return timezoneToLocale[locale] || locale;
};

// ============================================
// User Status Enums
// ============================================

export const USER_STATUSES = ["ACTIVE", "INACTIVE"] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

// ============================================
// Gender Enums
// ============================================

export const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;

export type Gender = (typeof GENDERS)[number];

// ============================================
// Wallet Management Enums
// ============================================

// Loại giao dịch ví
export const TRANSACTION_TYPES = [
  "DEPOSIT",
  "BILLING",
  "BILLING_FAILED",
  "REFUND",
  "COMMISSION",
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

// Trạng thái yêu cầu nạp tiền
export const DEPOSIT_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

export type DepositStatus = (typeof DEPOSIT_STATUSES)[number];

// Màu sắc cho status badge (không cần translate)
export const DEPOSIT_STATUS_COLORS: Record<
  DepositStatus,
  "warning" | "success" | "destructive"
> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
};

// ============================================
// Commission Enums
// ============================================

// Trạng thái hoa hồng (PENDING -> ELIGIBLE -> PAID)
export const COMMISSION_STATUSES = ["PENDING", "ELIGIBLE", "PAID"] as const;

export type CommissionStatus = (typeof COMMISSION_STATUSES)[number];

// Màu sắc cho commission status badge (không cần translate)
export const COMMISSION_STATUS_COLORS: Record<
  CommissionStatus,
  "warning" | "info" | "success"
> = {
  PENDING: "warning",
  ELIGIBLE: "info",
  PAID: "success",
};

// ============================================
// Company Status Enums
// ============================================

export const COMPANY_STATUSES = ["ACTIVE", "INACTIVE"] as const;

export type CompanyStatus = (typeof COMPANY_STATUSES)[number];
