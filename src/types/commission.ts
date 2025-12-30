import { CommissionStatus } from "./enums";

// Response types cho Commission API

/**
 * Thông tin hoa hồng
 * Status flow: PENDING -> ELIGIBLE -> PAID
 */
export interface CommissionResponse {
  id: number;
  employeeCode: string;
  employeeName: string;
  companyId: number;
  companyName: string;
  amount: number;
  status: CommissionStatus; // PENDING: chờ đủ điều kiện, ELIGIBLE: chờ thanh toán, PAID: đã thanh toán
  companyBillingAtCreation?: number; // Tổng billing của company tại thời điểm tạo commission
  paidAt?: string;
  paidBy?: string;
  paidByName?: string;
  createdAt: string;
}

/**
 * Thống kê hoa hồng theo tháng
 */
export interface CommissionMonthSummary {
  month: string; // Format: "YYYY-MM"
  totalAmount: number;
  totalPending: number;
  totalPaid: number;
  count: number;
}

/**
 * Thống kê hoa hồng theo nhân viên
 */
export interface CommissionEmployeeSummary {
  employeeCode: string;
  employeeName: string;
  count: number;
  totalPending: number;
  totalEligible: number;
  totalPaid: number;
  totalAmount: number;
}

/**
 * Tổng hợp thống kê hoa hồng (cho employee xem của mình)
 */
export interface CommissionSummaryResponse {
  employeeCode?: string;
  employeeName?: string;
  totalCommissions: number;
  totalAmount: number;
  pendingCommissions: number;
  pendingAmount: number;
  eligibleCommissions?: number;
  eligibleAmount?: number;
  paidCommissions: number;
  paidAmount: number;
  byMonth?: CommissionMonthSummary[];
}

/**
 * Tổng hợp thống kê hoa hồng toàn hệ thống (cho admin)
 */
export interface CommissionOverallSummaryResponse {
  totalPending: number;
  totalEligible: number;
  totalPaid: number;
  totalAmount: number;
  byEmployee?: CommissionEmployeeSummary[];
  byMonth?: CommissionMonthSummary[];
}

// Request types cho Commission API

/**
 * Filter cho danh sách commission
 */
export interface CommissionFilterRequest {
  employeeCode?: string;
  status?: CommissionStatus;
  startDate?: string;
  endDate?: string;
  companyId?: number;
}
