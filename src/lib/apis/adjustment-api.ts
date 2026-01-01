import { apiClient } from "@/lib/utils/fetch-client";
import { AdjustmentRequest } from "@/types/attendance-records";
import { PaginatedResponse } from "@/types/api";

/**
 * Adjustment API functions
 * Quản lý yêu cầu điều chỉnh chấm công
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

export interface CreateAdjustmentRequest {
  attendanceRecordId?: number; // Optional - có thể không có record
  workDate?: string; // Ngày cần điều chỉnh (khi không có record)
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  // Break adjustment fields
  breakRecordId?: number; // ID của break record cần điều chỉnh
  requestedBreakStart?: string;
  requestedBreakEnd?: string;
  reason: string;
  assignedTo: number; // ID người được gán xử lý (manager/admin)
}

export interface ApproveAdjustmentRequest {
  comment?: string;
}

export interface RejectAdjustmentRequest {
  reason: string;
}

export interface AdjustmentFilters {
  status?: string;
  employeeId?: number;
  startDate?: string;
  endDate?: string;
}

// ============================================
// Employee APIs
// ============================================

/**
 * Tạo yêu cầu điều chỉnh chấm công
 * @client-only
 */
export async function createAdjustmentRequest(
  data: CreateAdjustmentRequest,
): Promise<AdjustmentRequest> {
  return apiClient.post<AdjustmentRequest>(
    "/api/employee/attendance-adjustments",
    data,
  );
}

/**
 * Lấy danh sách yêu cầu điều chỉnh của nhân viên (có phân trang)
 * @client-only
 */
export async function getMyAdjustments(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
  filters?: AdjustmentFilters,
): Promise<PaginatedResponse<AdjustmentRequest>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filters?.status) params.append("status", filters.status);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  return apiClient.get<PaginatedResponse<AdjustmentRequest>>(
    `/api/employee/attendance-adjustments?${params.toString()}`,
  );
}

/**
 * Lấy chi tiết yêu cầu điều chỉnh của nhân viên
 * @client-only
 */
export async function getMyAdjustmentById(
  id: number,
): Promise<AdjustmentRequest> {
  return apiClient.get<AdjustmentRequest>(
    `/api/employee/attendance-adjustments/${id}`,
  );
}

/**
 * Lấy danh sách yêu cầu điều chỉnh theo ngày làm việc
 * @client-only
 */
export async function getMyAdjustmentsByDate(
  date: string,
): Promise<AdjustmentRequest[]> {
  return apiClient.get<AdjustmentRequest[]>(
    `/api/employee/attendance-adjustments/by-date/${date}`,
  );
}

/**
 * Hủy yêu cầu điều chỉnh (chỉ khi đang pending)
 * @client-only
 */
export async function cancelMyAdjustment(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/employee/attendance-adjustments/${id}`);
}

// ============================================
// Company/Manager APIs
// ============================================

/**
 * Lấy danh sách yêu cầu điều chỉnh chờ duyệt
 * @client-only
 */
export async function getPendingRequests(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
): Promise<PaginatedResponse<AdjustmentRequest>> {
  return apiClient.get<PaginatedResponse<AdjustmentRequest>>(
    `/api/company/attendance-adjustments/pending?page=${page}&size=${size}`,
  );
}

/**
 * Lấy tất cả yêu cầu điều chỉnh (có phân trang)
 * @client-only
 */
export async function getAllAdjustments(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
  filters?: AdjustmentFilters,
): Promise<PaginatedResponse<AdjustmentRequest>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filters?.status) params.append("status", filters.status);
  if (filters?.employeeId)
    params.append("employeeId", filters.employeeId.toString());
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  return apiClient.get<PaginatedResponse<AdjustmentRequest>>(
    `/api/company/attendance-adjustments?${params.toString()}`,
  );
}

/**
 * Lấy chi tiết yêu cầu điều chỉnh
 * @client-only
 */
export async function getAdjustmentById(
  id: number,
): Promise<AdjustmentRequest> {
  return apiClient.get<AdjustmentRequest>(
    `/api/company/attendance-adjustments/${id}`,
  );
}

/**
 * Duyệt yêu cầu điều chỉnh
 * @client-only
 */
export async function approveAdjustment(
  id: number,
  data?: ApproveAdjustmentRequest,
): Promise<AdjustmentRequest> {
  const params = data?.comment
    ? `?comment=${encodeURIComponent(data.comment)}`
    : "";
  return apiClient.put<AdjustmentRequest>(
    `/api/company/attendance-adjustments/${id}/approve${params}`,
    {},
  );
}

/**
 * Từ chối yêu cầu điều chỉnh
 * @client-only
 */
export async function rejectAdjustment(
  id: number,
  data: RejectAdjustmentRequest,
): Promise<AdjustmentRequest> {
  return apiClient.put<AdjustmentRequest>(
    `/api/company/attendance-adjustments/${id}/reject`,
    { rejectionReason: data.reason },
  );
}

/**
 * Duyệt nhiều yêu cầu điều chỉnh cùng lúc
 * @client-only
 */
export async function bulkApproveAdjustments(
  ids: number[],
  comment?: string,
): Promise<AdjustmentRequest[]> {
  return apiClient.put<AdjustmentRequest[]>(
    "/api/company/attendance-adjustments/bulk-approve",
    { ids, comment },
  );
}

/**
 * Từ chối nhiều yêu cầu điều chỉnh cùng lúc
 * @client-only
 */
export async function bulkRejectAdjustments(
  ids: number[],
  reason: string,
): Promise<AdjustmentRequest[]> {
  return apiClient.put<AdjustmentRequest[]>(
    "/api/company/attendance-adjustments/bulk-reject",
    { ids, reason },
  );
}

/**
 * Đếm số yêu cầu điều chỉnh chờ duyệt
 * @client-only
 */
export async function getPendingCount(): Promise<number> {
  return apiClient.get<number>(
    "/api/company/attendance-adjustments/pending/count",
  );
}

// ============================================
// Export API object
// ============================================

export const adjustmentApi = {
  // Employee
  createAdjustmentRequest,
  getMyAdjustments,
  getMyAdjustmentById,
  getMyAdjustmentsByDate,
  cancelMyAdjustment,
  // Company/Manager
  getPendingRequests,
  getAllAdjustments,
  getAdjustmentById,
  approveAdjustment,
  rejectAdjustment,
  bulkApproveAdjustments,
  bulkRejectAdjustments,
  getPendingCount,
};
