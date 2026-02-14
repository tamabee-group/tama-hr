import { apiClient } from "@/lib/utils/fetch-client";
import { LeaveType } from "@/types/attendance-enums";
import { PaginatedResponse } from "@/types/api";

/**
 * Leave Balance API functions
 * Quản lý số ngày nghỉ phép của nhân viên
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Constants
// ============================================

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 20;

// ============================================
// Response Types
// ============================================

/**
 * Thông tin số ngày phép theo loại
 */
export interface LeaveBalanceResponse {
  leaveType: LeaveType;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

/**
 * Tổng hợp số ngày phép của một nhân viên
 */
export interface LeaveBalanceSummaryResponse {
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  balances: LeaveBalanceResponse[];
}

/**
 * Kết quả cấp phát hàng loạt
 */
export interface BulkAllocateResponse {
  updatedCount: number;
}

// ============================================
// Request Types
// ============================================

/**
 * Request cập nhật số ngày phép cho nhân viên
 */
export interface UpdateLeaveBalanceRequest {
  year: number;
  leaveType: LeaveType;
  totalDays: number;
}

/**
 * Request cấp phát số ngày phép hàng loạt
 */
export interface BulkAllocateLeaveRequest {
  year: number;
  leaveType: LeaveType;
  totalDays: number;
  employeeIds?: number[]; // Nếu rỗng = tất cả nhân viên
}

// ============================================
// API Functions
// ============================================

/**
 * Lấy danh sách số ngày phép của tất cả nhân viên (có phân trang)
 * @client-only
 */
export async function getAllLeaveBalances(
  year: number,
  search?: string,
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_SIZE,
): Promise<PaginatedResponse<LeaveBalanceSummaryResponse>> {
  const params = new URLSearchParams();
  params.append("year", year.toString());
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (search) params.append("search", search);

  return apiClient.get<PaginatedResponse<LeaveBalanceSummaryResponse>>(
    `/api/company/leave-balances?${params.toString()}`,
  );
}

/**
 * Cập nhật số ngày phép cho nhân viên
 * @client-only
 */
export async function updateEmployeeLeaveBalance(
  employeeId: number,
  data: UpdateLeaveBalanceRequest,
): Promise<LeaveBalanceResponse> {
  return apiClient.put<LeaveBalanceResponse>(
    `/api/company/employees/${employeeId}/leave-balance`,
    data,
  );
}

/**
 * Cấp phát số ngày phép hàng loạt
 * @client-only
 */
export async function bulkAllocateLeaveBalance(
  data: BulkAllocateLeaveRequest,
): Promise<BulkAllocateResponse> {
  return apiClient.post<BulkAllocateResponse>(
    "/api/company/leave-balances/bulk",
    data,
  );
}

// ============================================
// Export API object
// ============================================

export const leaveBalanceApi = {
  getAllLeaveBalances,
  updateEmployeeLeaveBalance,
  bulkAllocateLeaveBalance,
};
