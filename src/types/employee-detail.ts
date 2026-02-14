// Types cho Employee Detail page
// Dựa trên backend DTOs

// ============================================
// Employee Personal Info Sections
// ============================================

export interface BasicInfoSection {
  avatar?: string;
  name?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  maritalStatus?: string;
  nationalId?: string;
}

export interface WorkInfoSection {
  jobTitle?: string;
  department?: string;
  departmentId?: number;
  directManager?: { id: number; name: string; avatar?: string };
  employmentType?: string;
  joiningDate?: string;
  workLocation?: string;
}

export interface ContactInfoSection {
  phone?: string;
  email?: string;
  address?: string;
  zipCode?: string;
}

export interface BankDetailsSection {
  bankAccountType?: string;
  japanBankType?: string;
  bankName?: string;
  bankAccount?: string;
  bankAccountName?: string;
  bankCode?: string;
  bankBranchCode?: string;
  bankBranchName?: string;
  bankAccountCategory?: string;
  bankSymbol?: string;
  bankNumber?: string;
}

export interface EmergencyContactSection {
  name?: string;
  phone?: string;
  relation?: string;
  address?: string;
}

export interface EmployeePersonalInfo {
  basicInfo?: BasicInfoSection;
  workInfo?: WorkInfoSection;
  contactInfo?: ContactInfoSection;
  bankDetails?: BankDetailsSection;
  emergencyContact?: EmergencyContactSection;
}

// ============================================
// Employee Document
// ============================================

export const DocumentType = {
  CONTRACT: "CONTRACT",
  ID_CARD: "ID_CARD",
  CERTIFICATE: "CERTIFICATE",
  RESUME: "RESUME",
  OTHER: "OTHER",
} as const;

export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export interface EmployeeDocument {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string; // mimeType từ backend
  fileSize: number;
  documentType: DocumentType;
  createdAt: string; // uploadedAt từ backend
}

// ============================================
// Tab Types
// ============================================

export const EmployeeDetailTab = {
  PERSONAL_INFO: "personal-info",
  ATTENDANCE: "attendance",
  SALARY: "salary",
  CONTRACTS: "contracts",
  LEAVE: "leave",
  DOCUMENTS: "documents",
  REFERRALS: "referrals",
} as const;

export type EmployeeDetailTab =
  (typeof EmployeeDetailTab)[keyof typeof EmployeeDetailTab];

// ============================================
// Referral Types (cho nhân viên Tamabee)
// ============================================

import { CommissionStatus, type CompanyStatus } from "./enums";

export interface ReferredCompany {
  companyId: number;
  companyName: string;
  ownerName: string;
  email: string | null;
  phone: string | null;
  planName: string | null;
  planPrice: number | null;
  planExpiryDate: string | null;
  status: CompanyStatus;
  currentBalance: number;
  totalDeposits: number;
  totalBilling: number;
  commissionId: number | null;
  commissionAmount: number | null;
  commissionStatus: CommissionStatus | null;
  commissionPaidAt: string | null;
  companyCreatedAt: string;
}

// ============================================
// Commission Types
// ============================================

export interface CommissionSummary {
  employeeCode: string;
  employeeName: string;
  totalReferrals: number;
  totalCommissions: number;
  totalAmount: number;
  pendingCommissions: number;
  pendingAmount: number;
  eligibleCommissions: number;
  eligibleAmount: number;
  paidCommissions: number;
  paidAmount: number;
}

export interface CommissionSettings {
  commissionAmount: number;
  referralBonusMonths: number;
  freeTrialMonths: number;
}
