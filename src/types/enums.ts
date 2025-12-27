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
  { value: "USER_COMPANY", label: "Nhân viên" },
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
