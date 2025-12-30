// Constants cho select/dropdown components

// Các role của nhân viên Tamabee
export const TAMABEE_USER_ROLES = [
  { value: "ADMIN_TAMABEE", label: "Admin Tamabee" },
  { value: "MANAGER_TAMABEE", label: "Quản lý Tamabee" },
  { value: "EMPLOYEE_TAMABEE", label: "Nhân viên Tamabee" },
] as const;

// Các role của nhân viên công ty khách hàng
export const COMPANY_USER_ROLES = [
  { value: "ADMIN_COMPANY", label: "Quản trị doanh nghiệp" },
  { value: "MANAGER_COMPANY", label: "Quản lý" },
  { value: "EMPLOYEE_COMPANY", label: "Nhân viên" },
] as const;

// Ngôn ngữ hỗ trợ
export const LANGUAGES = [
  { value: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "ja", label: "日本語", flag: "🇯🇵" },
] as const;

// Khu vực/Locale - sử dụng locale code (vi, ja) làm value chính
export const LOCALES = [
  { value: "vi", label: "Việt Nam" },
  { value: "ja", label: "Nhật Bản" },
] as const;

// Labels cho locale (dùng để hiển thị) - hỗ trợ cả timezone format và locale code
export const LOCALE_LABELS: Record<string, string> = {
  "Asia/Ho_Chi_Minh": "Việt Nam",
  "Asia/Tokyo": "Nhật Bản",
  vi: "Việt Nam",
  ja: "Nhật Bản",
};

// Normalize locale value - chuyển timezone về locale code
export const normalizeLocale = (locale: string): string => {
  const timezoneToLocale: Record<string, string> = {
    "Asia/Ho_Chi_Minh": "vi",
    "Asia/Tokyo": "ja",
  };
  return timezoneToLocale[locale] || locale;
};

// Trạng thái user
export const USER_STATUS = [
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "INACTIVE", label: "Không hoạt động" },
] as const;

// Giới tính
export const GENDERS = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
] as const;

// ============================================
// Wallet Management Enums
// ============================================

// Loại giao dịch ví
export const TRANSACTION_TYPES = [
  { value: "DEPOSIT", label: "Nạp tiền" },
  { value: "BILLING", label: "Thanh toán" },
  { value: "REFUND", label: "Hoàn tiền" },
  { value: "COMMISSION", label: "Hoa hồng" },
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number]["value"];

// Labels đa ngôn ngữ cho loại giao dịch
export const TRANSACTION_TYPE_LABELS: Record<
  TransactionType,
  { vi: string; en: string; ja: string }
> = {
  DEPOSIT: { vi: "Nạp tiền", en: "Deposit", ja: "入金" },
  BILLING: { vi: "Thanh toán", en: "Billing", ja: "請求" },
  REFUND: { vi: "Hoàn tiền", en: "Refund", ja: "返金" },
  COMMISSION: { vi: "Hoa hồng", en: "Commission", ja: "コミッション" },
};

// Trạng thái yêu cầu nạp tiền
export const DEPOSIT_STATUSES = [
  { value: "PENDING", label: "Đang chờ" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Đã từ chối" },
] as const;

export type DepositStatus = (typeof DEPOSIT_STATUSES)[number]["value"];

// Labels đa ngôn ngữ cho trạng thái deposit
export const DEPOSIT_STATUS_LABELS: Record<
  DepositStatus,
  { vi: string; en: string; ja: string }
> = {
  PENDING: { vi: "Đang chờ", en: "Pending", ja: "保留中" },
  APPROVED: { vi: "Đã duyệt", en: "Approved", ja: "承認済み" },
  REJECTED: { vi: "Đã từ chối", en: "Rejected", ja: "却下" },
};

// Màu sắc cho status badge
export const DEPOSIT_STATUS_COLORS: Record<
  DepositStatus,
  "warning" | "success" | "destructive"
> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
};

// Trạng thái hoa hồng (PENDING -> ELIGIBLE -> PAID)
export const COMMISSION_STATUSES = [
  { value: "PENDING", label: "Chờ đủ điều kiện" },
  { value: "ELIGIBLE", label: "Chờ thanh toán" },
  { value: "PAID", label: "Đã thanh toán" },
] as const;

export type CommissionStatus = (typeof COMMISSION_STATUSES)[number]["value"];

// Labels đa ngôn ngữ cho trạng thái commission
export const COMMISSION_STATUS_LABELS: Record<
  CommissionStatus,
  { vi: string; en: string; ja: string }
> = {
  PENDING: { vi: "Chờ đủ điều kiện", en: "Pending", ja: "条件待ち" },
  ELIGIBLE: { vi: "Chờ thanh toán", en: "Eligible", ja: "支払い可能" },
  PAID: { vi: "Đã thanh toán", en: "Paid", ja: "支払い済み" },
};

// Màu sắc cho commission status badge
export const COMMISSION_STATUS_COLORS: Record<
  CommissionStatus,
  "warning" | "info" | "success"
> = {
  PENDING: "warning",
  ELIGIBLE: "info",
  PAID: "success",
};

// Helper function để lấy label theo locale
export const getTransactionTypeLabel = (
  type: TransactionType,
  locale: "vi" | "en" | "ja" = "vi",
): string => {
  return TRANSACTION_TYPE_LABELS[type]?.[locale] || type;
};

export const getDepositStatusLabel = (
  status: DepositStatus,
  locale: "vi" | "en" | "ja" = "vi",
): string => {
  return DEPOSIT_STATUS_LABELS[status]?.[locale] || status;
};

export const getCommissionStatusLabel = (
  status: CommissionStatus,
  locale: "vi" | "en" | "ja" = "vi",
): string => {
  return COMMISSION_STATUS_LABELS[status]?.[locale] || status;
};
