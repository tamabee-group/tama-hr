import { CommissionStatus } from "./enums";

// Response types cho Employee Referral API

/**
 * Thông tin company được nhân viên giới thiệu
 */
export interface ReferredCompany {
  companyId: number;
  companyName: string;
  ownerName: string;
  planName: string;
  status: string;
  currentBalance: number;
  totalDeposits: number;
  totalBilling: number;
  commissionAmount: number;
  commissionStatus: CommissionStatus;
  commissionPaidAt?: string;
}

/**
 * Tổng hợp thống kê hoa hồng của nhân viên
 * Khớp với CommissionSummaryResponse từ backend
 */
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

// Request types cho Employee Referral API

/**
 * Filter cho danh sách referred companies
 */
export interface ReferralFilterRequest {
  search?: string;
  status?: string;
  commissionStatus?: CommissionStatus;
}
