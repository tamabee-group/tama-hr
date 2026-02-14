// Types cho Employee Portal (trang cá nhân nhân viên)
// Dựa trên design document employee-portal-frontend

import { type PayrollItem } from "./attendance-records";
import { type EmployeeDocument, type DocumentType } from "./employee-detail";
import { type Gender } from "./enums";
import {
  type PayrollPeriodStatus,
  type ContractStatus,
  type PayrollItemStatus,
} from "./attendance-enums";

// ============================================
// Status Color Types (Màu sắc cho status badge)
// ============================================

// Màu sắc cho status badge trong Employee Portal
export type PortalStatusColor = "gray" | "yellow" | "blue" | "green" | "red";

// Mapping status sang màu sắc cho Payroll (DRAFT, REVIEWING, APPROVED, PAID)
export const PAYROLL_STATUS_COLORS: Record<
  PayrollPeriodStatus,
  PortalStatusColor
> = {
  DRAFT: "gray",
  REVIEWING: "yellow",
  APPROVED: "blue",
  PAID: "green",
};

// Mapping status sang màu sắc cho Contract (ACTIVE, EXPIRED, TERMINATED)
export const CONTRACT_STATUS_COLORS: Record<ContractStatus, PortalStatusColor> =
  {
    ACTIVE: "green",
    EXPIRED: "gray",
    TERMINATED: "red",
  };

// Mapping status sang màu sắc cho PayrollItem
export const PAYROLL_ITEM_STATUS_COLORS: Record<
  PayrollItemStatus,
  PortalStatusColor
> = {
  CALCULATED: "gray",
  ADJUSTED: "yellow",
  CONFIRMED: "green",
};

// Helper function để lấy màu status
export const getPayrollStatusColor = (
  status: PayrollPeriodStatus,
): PortalStatusColor => {
  return PAYROLL_STATUS_COLORS[status] || "gray";
};

export const getContractStatusColor = (status: string): PortalStatusColor => {
  return CONTRACT_STATUS_COLORS[status as ContractStatus] || "gray";
};

export const getPayrollItemStatusColor = (
  status: PayrollItemStatus,
): PortalStatusColor => {
  return PAYROLL_ITEM_STATUS_COLORS[status] || "gray";
};

// ============================================
// Payslip Types (Phiếu lương)
// ============================================

// MyPayslip extends PayrollItem với các computed fields cho hiển thị
export interface MyPayslip extends PayrollItem {
  // Computed fields cho display
  periodLabel: string; // "January 2025", "Tháng 1 2025", "2025年1月"
  statusColor: PortalStatusColor;
}

// Filters cho danh sách payslip
export interface PayslipFilters {
  year?: number;
  status?: PayrollItemStatus;
}

// ============================================
// Profile Update Types (Cập nhật hồ sơ)
// ============================================

// Request cập nhật profile cá nhân
export interface UpdateProfileRequest {
  // Basic info
  name?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
  zipCode?: string;
  avatar?: string;
  // Bank info - Common
  bankAccountType?: "VN" | "JP";
  japanBankType?: "normal" | "yucho";
  bankName?: string;
  bankAccount?: string;
  bankAccountName?: string;
  // Bank info - Japan specific (ngân hàng thông thường)
  bankCode?: string;
  bankBranchCode?: string;
  bankBranchName?: string;
  bankAccountCategory?: "futsu" | "toza";
  // Bank info - Japan Post Bank (ゆうちょ銀行)
  bankSymbol?: string; // 記号
  bankNumber?: string; // 番号
  // Emergency contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  emergencyContactAddress?: string;
}

// ============================================
// Document Types (Tài liệu cá nhân)
// ============================================

// MyDocument extends EmployeeDocument với các computed fields
export interface MyDocument extends EmployeeDocument {
  thumbnailUrl?: string;
  isImage: boolean;
  isPdf: boolean;
}

// Request upload document
export interface UploadDocumentRequest {
  file: File;
  documentType: DocumentType;
}

// ============================================
// Contract Types (Hợp đồng)
// ============================================

// Contract response từ portal API (khác với EmploymentContract từ company API)
export interface PortalContractResponse {
  id: number;
  contractNumber: string;
  contractType: string;
  startDate: string;
  endDate: string;
  status: string;
  notes?: string;
  terminationDate?: string;
  terminationReason?: string;
  daysUntilExpiry?: number;
}

// MyContract extends PortalContractResponse với các computed fields
export interface MyContract extends PortalContractResponse {
  statusColor: PortalStatusColor;
}

// ============================================
// File Type Helpers
// ============================================

// Các file type được chấp nhận cho upload
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const ACCEPTED_DOCUMENT_TYPES = ["application/pdf"] as const;
export const ACCEPTED_FILE_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  ...ACCEPTED_DOCUMENT_TYPES,
] as const;

// File extensions được chấp nhận
export const ACCEPTED_FILE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".pdf",
] as const;

// Helper function kiểm tra file type
export const isImageFile = (fileType: string): boolean => {
  return ACCEPTED_IMAGE_TYPES.includes(
    fileType as (typeof ACCEPTED_IMAGE_TYPES)[number],
  );
};

export const isPdfFile = (fileType: string): boolean => {
  return fileType === "application/pdf";
};

export const isAcceptedFileType = (fileType: string): boolean => {
  return ACCEPTED_FILE_TYPES.includes(
    fileType as (typeof ACCEPTED_FILE_TYPES)[number],
  );
};

// Helper function để tạo MyDocument từ EmployeeDocument
export const toMyDocument = (doc: EmployeeDocument): MyDocument => {
  return {
    ...doc,
    thumbnailUrl: isImageFile(doc.fileType) ? doc.fileUrl : undefined,
    isImage: isImageFile(doc.fileType),
    isPdf: isPdfFile(doc.fileType),
  };
};

// ============================================
// Profile Completion Types
// ============================================

// Các field được tính vào profile completion
export interface ProfileCompletionFields {
  avatar: boolean;
  name: boolean;
  phone: boolean;
  dateOfBirth: boolean;
  gender: boolean;
  address: boolean;
  bankInfo: boolean;
  emergencyContact: boolean;
}

// Weights cho từng field (tổng = 100)
export const PROFILE_COMPLETION_WEIGHTS: Record<
  keyof ProfileCompletionFields,
  number
> = {
  avatar: 10,
  name: 15,
  phone: 10,
  dateOfBirth: 10,
  gender: 5,
  address: 10,
  bankInfo: 25,
  emergencyContact: 15,
};
