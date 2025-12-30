import {
  TAMABEE_USER_ROLES,
  COMPANY_USER_ROLES,
  USER_STATUS,
  GENDERS,
} from "./enums";

// Derive types từ constants
type TamabeeRole = (typeof TAMABEE_USER_ROLES)[number]["value"];
type CompanyRole = (typeof COMPANY_USER_ROLES)[number]["value"];
export type UserRole = TamabeeRole | CompanyRole;

export type UserStatus = (typeof USER_STATUS)[number]["value"];
export type Gender = (typeof GENDERS)[number]["value"];

// Label hiển thị cho từng role (derive từ enums)
export const USER_ROLE_LABELS: Record<UserRole, string> = Object.fromEntries([
  ...TAMABEE_USER_ROLES.map((r) => [r.value, r.label]),
  ...COMPANY_USER_ROLES.map((r) => [r.value, r.label]),
]) as Record<UserRole, string>;

// Các role có quyền admin (hiển thị link "Trang quản trị")
export const ADMIN_ROLES: UserRole[] = [
  "ADMIN_TAMABEE",
  "MANAGER_TAMABEE",
  "EMPLOYEE_TAMABEE",
  "ADMIN_COMPANY",
  "MANAGER_COMPANY",
];

export type BankAccountType = "VN" | "JP";
export type BankAccountCategory = "futsu" | "toza"; // 普通 hoặc 当座
export type JapanBankType = "normal" | "yucho"; // Ngân hàng thông thường hoặc ゆうちょ銀行

export interface UserProfile {
  name?: string;
  phone?: string;
  address?: string;
  zipCode?: string;
  dateOfBirth?: string;
  gender?: Gender;
  avatar?: string;
  referralCode?: string;
  // Bank info - Common
  bankAccountType?: BankAccountType;
  japanBankType?: JapanBankType; // Loại ngân hàng Nhật: normal hoặc yucho
  bankName?: string;
  bankAccount?: string;
  bankAccountName?: string;
  // Bank info - Japan specific (ngân hàng thông thường)
  bankCode?: string;
  bankBranchCode?: string;
  bankBranchName?: string;
  bankAccountCategory?: BankAccountCategory;
  // Bank info - Japan Post Bank (ゆうちょ銀行)
  bankSymbol?: string; // 記号
  bankNumber?: string; // 番号
  // Emergency contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  emergencyContactAddress?: string;
}

export interface User {
  id: number;
  employeeCode?: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  locale: string;
  language: string;
  companyId: number;
  companyName?: string;
  profileCompleteness: number;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
}
