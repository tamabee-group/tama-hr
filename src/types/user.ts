import {
  type TamabeeUserRole,
  type CompanyUserRole,
  type UserStatus as UserStatusType,
  type Gender as GenderType,
} from "./enums";

// Re-export types từ enums
export type UserRole = TamabeeUserRole | CompanyUserRole;
export type UserStatus = UserStatusType;
export type Gender = GenderType;

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
  companyLogo?: string;
  tenantDomain: string; // "tamabee" cho Tamabee users, subdomain cho tenant users
  planId: number;
  profileCompleteness: number;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
}
