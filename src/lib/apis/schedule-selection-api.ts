import { apiClient } from "@/lib/utils/fetch-client";
import { ScheduleSelection, WorkSchedule } from "@/types/attendance-records";
import { PaginatedResponse } from "@/types/api";

/**
 * Schedule Selection API functions
 * Quản lý việc chọn lịch làm việc của nhân viên
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

export interface SelectScheduleRequest {
  scheduleId: number;
  effectiveFrom: string;
  effectiveTo: string;
}

export interface RejectSelectionRequest {
  reason: string;
}

export interface SelectionFilters {
  status?: string;
  employeeId?: number;
}

// ============================================
// Employee APIs
// ============================================

/**
 * Chọn lịch làm việc
 * @client-only
 */
export async function selectSchedule(
  data: SelectScheduleRequest,
): Promise<ScheduleSelection> {
  return apiClient.post<ScheduleSelection>(
    "/api/employee/schedule-selections",
    data,
  );
}

/**
 * Lấy danh sách lịch làm việc có thể chọn
 * @client-only
 */
export async function getAvailableSchedules(): Promise<WorkSchedule[]> {
  return apiClient.get<WorkSchedule[]>(
    "/api/employee/schedule-selections/available",
  );
}

/**
 * Lấy danh sách lịch làm việc được gợi ý
 * @client-only
 */
export async function getSuggestedSchedules(): Promise<WorkSchedule[]> {
  return apiClient.get<WorkSchedule[]>(
    "/api/employee/schedule-selections/suggested",
  );
}

/**
 * Lấy lịch làm việc hiện tại của nhân viên
 * @client-only
 */
export async function getMyCurrentSchedule(): Promise<ScheduleSelection | null> {
  return apiClient.get<ScheduleSelection | null>(
    "/api/employee/schedule-selections/current",
  );
}

/**
 * Lấy danh sách lịch làm việc sắp tới của nhân viên
 * @client-only
 */
export async function getMyUpcomingSchedules(): Promise<ScheduleSelection[]> {
  return apiClient.get<ScheduleSelection[]>(
    "/api/employee/schedule-selections/upcoming",
  );
}

/**
 * Lấy lịch sử chọn lịch làm việc của nhân viên
 * @client-only
 */
export async function getMySelectionHistory(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
): Promise<PaginatedResponse<ScheduleSelection>> {
  return apiClient.get<PaginatedResponse<ScheduleSelection>>(
    `/api/employee/schedule-selections?page=${page}&size=${size}`,
  );
}

/**
 * Hủy yêu cầu chọn lịch (chỉ khi đang pending)
 * @client-only
 */
export async function cancelMySelection(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/employee/schedule-selections/${id}`);
}

// ============================================
// Company/Manager APIs
// ============================================

/**
 * Lấy danh sách yêu cầu chọn lịch chờ duyệt
 * @client-only
 */
export async function getPendingSelections(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
): Promise<PaginatedResponse<ScheduleSelection>> {
  return apiClient.get<PaginatedResponse<ScheduleSelection>>(
    `/api/company/schedule-selections/pending?page=${page}&size=${size}`,
  );
}

/**
 * Lấy tất cả yêu cầu chọn lịch (có phân trang)
 * @client-only
 */
export async function getAllSelections(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
  filters?: SelectionFilters,
): Promise<PaginatedResponse<ScheduleSelection>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filters?.status) params.append("status", filters.status);
  if (filters?.employeeId)
    params.append("employeeId", filters.employeeId.toString());

  return apiClient.get<PaginatedResponse<ScheduleSelection>>(
    `/api/company/schedule-selections?${params.toString()}`,
  );
}

/**
 * Lấy chi tiết yêu cầu chọn lịch
 * @client-only
 */
export async function getSelectionById(id: number): Promise<ScheduleSelection> {
  return apiClient.get<ScheduleSelection>(
    `/api/company/schedule-selections/${id}`,
  );
}

/**
 * Duyệt yêu cầu chọn lịch
 * @client-only
 */
export async function approveSelection(id: number): Promise<ScheduleSelection> {
  return apiClient.put<ScheduleSelection>(
    `/api/company/schedule-selections/${id}/approve`,
  );
}

/**
 * Từ chối yêu cầu chọn lịch
 * @client-only
 */
export async function rejectSelection(
  id: number,
  data: RejectSelectionRequest,
): Promise<ScheduleSelection> {
  return apiClient.put<ScheduleSelection>(
    `/api/company/schedule-selections/${id}/reject`,
    data,
  );
}

/**
 * Đếm số yêu cầu chọn lịch chờ duyệt
 * @client-only
 */
export async function getPendingSelectionCount(): Promise<number> {
  return apiClient.get<number>(
    "/api/company/schedule-selections/pending/count",
  );
}

// ============================================
// Export API object
// ============================================

export const scheduleSelectionApi = {
  // Employee
  selectSchedule,
  getAvailableSchedules,
  getSuggestedSchedules,
  getMyCurrentSchedule,
  getMyUpcomingSchedules,
  getMySelectionHistory,
  cancelMySelection,
  // Company/Manager
  getPendingSelections,
  getAllSelections,
  getSelectionById,
  approveSelection,
  rejectSelection,
  getPendingSelectionCount,
};
