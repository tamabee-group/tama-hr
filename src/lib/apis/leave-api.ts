import { apiClient } from "@/lib/utils/fetch-client";
import { LeaveRequest, LeaveBalance } from "@/types/attendance-records";
import { LeaveType } from "@/types/attendance-enums";
import { PaginatedResponse } from "@/types/api";

/**
 * Leave API functions
 * Quản lý nghỉ phép
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Constants
// ============================================

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 10;

// ============================================
// Request Types
// ============================================

export interface CreateLeaveRequest {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  approverId?: number;
}

export interface RejectLeaveRequest {
  reason: string;
}

export interface LeaveFilters {
  status?: string;
  leaveType?: LeaveType;
  employeeId?: number;
  startDate?: string;
  endDate?: string;
}

// ============================================
// Employee APIs
// ============================================

/**
 * Tạo yêu cầu nghỉ phép
 * @client-only
 */
export async function createLeaveRequest(
  data: CreateLeaveRequest,
): Promise<LeaveRequest> {
  return apiClient.post<LeaveRequest>("/api/employee/leave-requests", data);
}

/**
 * Lấy số ngày phép còn lại của nhân viên
 * @client-only
 */
export async function getMyLeaveBalance(): Promise<LeaveBalance[]> {
  return apiClient.get<LeaveBalance[]>("/api/employee/leave-balance");
}

/**
 * Lấy số ngày phép còn lại theo loại
 * @client-only
 */
export async function getMyLeaveBalanceByType(
  leaveType: LeaveType,
): Promise<LeaveBalance> {
  return apiClient.get<LeaveBalance>(
    `/api/employee/leave-balance/${leaveType}`,
  );
}

/**
 * Lấy danh sách yêu cầu nghỉ phép của nhân viên (có phân trang)
 * @client-only
 */
export async function getMyLeaveRequests(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
  filters?: LeaveFilters,
): Promise<PaginatedResponse<LeaveRequest>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filters?.status) params.append("status", filters.status);
  if (filters?.leaveType) params.append("leaveType", filters.leaveType);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  return apiClient.get<PaginatedResponse<LeaveRequest>>(
    `/api/employee/leave-requests?${params.toString()}`,
  );
}

/**
 * Lấy chi tiết yêu cầu nghỉ phép của nhân viên
 * @client-only
 */
export async function getMyLeaveRequestById(id: number): Promise<LeaveRequest> {
  return apiClient.get<LeaveRequest>(`/api/employee/leave-requests/${id}`);
}

/**
 * Hủy yêu cầu nghỉ phép (chỉ khi đang pending)
 * @client-only
 */
export async function cancelMyLeaveRequest(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/employee/leave-requests/${id}`);
}

// ============================================
// Company/Manager APIs
// ============================================

/**
 * Lấy danh sách yêu cầu nghỉ phép chờ duyệt
 * @client-only
 */
export async function getPendingLeaveRequests(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
): Promise<PaginatedResponse<LeaveRequest>> {
  return apiClient.get<PaginatedResponse<LeaveRequest>>(
    `/api/company/leave-requests/pending?page=${page}&size=${size}`,
  );
}

/**
 * Lấy tất cả yêu cầu nghỉ phép (có phân trang)
 * @client-only
 */
export async function getAllLeaveRequests(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
  filters?: LeaveFilters,
): Promise<PaginatedResponse<LeaveRequest>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filters?.status) params.append("status", filters.status);
  if (filters?.leaveType) params.append("leaveType", filters.leaveType);
  if (filters?.employeeId)
    params.append("employeeId", filters.employeeId.toString());
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  return apiClient.get<PaginatedResponse<LeaveRequest>>(
    `/api/company/leave-requests?${params.toString()}`,
  );
}

/**
 * Lấy chi tiết yêu cầu nghỉ phép
 * @client-only
 */
export async function getLeaveRequestById(id: number): Promise<LeaveRequest> {
  return apiClient.get<LeaveRequest>(`/api/company/leave-requests/${id}`);
}

/**
 * Duyệt yêu cầu nghỉ phép
 * @client-only
 */
export async function approveLeave(id: number): Promise<LeaveRequest> {
  return apiClient.put<LeaveRequest>(
    `/api/company/leave-requests/${id}/approve`,
  );
}

/**
 * Từ chối yêu cầu nghỉ phép
 * @client-only
 */
export async function rejectLeave(
  id: number,
  data: RejectLeaveRequest,
): Promise<LeaveRequest> {
  return apiClient.put<LeaveRequest>(
    `/api/company/leave-requests/${id}/reject`,
    data,
  );
}

/**
 * Lấy số ngày phép của nhân viên cụ thể
 * @client-only
 */
export async function getEmployeeLeaveBalance(
  employeeId: number,
): Promise<LeaveBalance[]> {
  return apiClient.get<LeaveBalance[]>(
    `/api/company/employees/${employeeId}/leave-balance`,
  );
}

/**
 * Đếm số yêu cầu nghỉ phép chờ duyệt
 * @client-only
 */
export async function getPendingLeaveCount(): Promise<number> {
  return apiClient.get<number>("/api/company/leave-requests/pending/count");
}

// ============================================
// Export API object
// ============================================

export const leaveApi = {
  // Employee
  createLeaveRequest,
  getMyLeaveBalance,
  getMyLeaveBalanceByType,
  getMyLeaveRequests,
  getMyLeaveRequestById,
  cancelMyLeaveRequest,
  // Company/Manager
  getPendingLeaveRequests,
  getAllLeaveRequests,
  getLeaveRequestById,
  approveLeave,
  rejectLeave,
  getEmployeeLeaveBalance,
  getPendingLeaveCount,
};
