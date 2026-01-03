import { apiClient } from "@/lib/utils/fetch-client";
import {
  ShiftTemplate,
  ShiftTemplateInput,
  ShiftAssignment,
  ShiftAssignmentInput,
  ShiftSwapRequest,
  ShiftSwapRequestInput,
} from "@/types/attendance-records";
import { PaginatedResponse } from "@/types/api";

/**
 * Shift Management API functions
 * Quản lý ca làm việc, phân công ca, và đổi ca
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Constants
// ============================================

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 10;

// ============================================
// Request/Response Types
// ============================================

export interface ShiftTemplateFilters {
  isActive?: boolean;
  search?: string;
}

export interface ShiftAssignmentFilters {
  employeeId?: number;
  shiftTemplateId?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface SwapRequestFilters {
  requesterId?: number;
  targetEmployeeId?: number;
  status?: string;
}

export interface SwapApprovalRequest {
  approved: boolean;
  rejectionReason?: string;
}

// ============================================
// Shift Template APIs (Company)
// ============================================

/**
 * Lấy danh sách mẫu ca làm việc
 * @client-only
 */
export async function getShiftTemplates(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
  filters?: ShiftTemplateFilters,
): Promise<PaginatedResponse<ShiftTemplate>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filters?.isActive !== undefined)
    params.append("isActive", filters.isActive.toString());
  if (filters?.search) params.append("search", filters.search);

  return apiClient.get<PaginatedResponse<ShiftTemplate>>(
    `/api/company/shifts/templates?${params.toString()}`,
  );
}

/**
 * Lấy tất cả mẫu ca làm việc (không phân trang, cho dropdown)
 * @client-only
 */
export async function getAllShiftTemplates(): Promise<ShiftTemplate[]> {
  const response = await apiClient.get<PaginatedResponse<ShiftTemplate>>(
    "/api/company/shifts/templates/all",
  );
  return response.content;
}

/**
 * Lấy chi tiết mẫu ca làm việc
 * @client-only
 */
export async function getShiftTemplateById(id: number): Promise<ShiftTemplate> {
  return apiClient.get<ShiftTemplate>(`/api/company/shifts/templates/${id}`);
}

/**
 * Tạo mẫu ca làm việc mới
 * @client-only
 */
export async function createShiftTemplate(
  data: ShiftTemplateInput,
): Promise<ShiftTemplate> {
  return apiClient.post<ShiftTemplate>("/api/company/shifts/templates", data);
}

/**
 * Cập nhật mẫu ca làm việc
 * @client-only
 */
export async function updateShiftTemplate(
  id: number,
  data: ShiftTemplateInput,
): Promise<ShiftTemplate> {
  return apiClient.put<ShiftTemplate>(
    `/api/company/shifts/templates/${id}`,
    data,
  );
}

/**
 * Xóa mẫu ca làm việc
 * @client-only
 */
export async function deleteShiftTemplate(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/company/shifts/templates/${id}`);
}

// ============================================
// Shift Assignment APIs (Company)
// ============================================

/**
 * Lấy danh sách phân công ca
 * @client-only
 */
export async function getShiftAssignments(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
  filters?: ShiftAssignmentFilters,
): Promise<PaginatedResponse<ShiftAssignment>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filters?.employeeId)
    params.append("employeeId", filters.employeeId.toString());
  if (filters?.shiftTemplateId)
    params.append("shiftTemplateId", filters.shiftTemplateId.toString());
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.status) params.append("status", filters.status);

  return apiClient.get<PaginatedResponse<ShiftAssignment>>(
    `/api/company/shifts/assignments?${params.toString()}`,
  );
}

/**
 * Lấy phân công ca theo ngày (cho calendar view)
 * @client-only
 */
export async function getAssignmentsByDateRange(
  startDate: string,
  endDate: string,
): Promise<ShiftAssignment[]> {
  return apiClient.get<ShiftAssignment[]>(
    `/api/company/shifts/assignments/range?startDate=${startDate}&endDate=${endDate}`,
  );
}

/**
 * Lấy chi tiết phân công ca
 * @client-only
 */
export async function getShiftAssignmentById(
  id: number,
): Promise<ShiftAssignment> {
  return apiClient.get<ShiftAssignment>(
    `/api/company/shifts/assignments/${id}`,
  );
}

/**
 * Tạo phân công ca mới
 * @client-only
 */
export async function createShiftAssignment(
  data: ShiftAssignmentInput,
): Promise<ShiftAssignment> {
  return apiClient.post<ShiftAssignment>(
    "/api/company/shifts/assignments",
    data,
  );
}

/**
 * Cập nhật phân công ca
 * @client-only
 */
export async function updateShiftAssignment(
  id: number,
  data: ShiftAssignmentInput,
): Promise<ShiftAssignment> {
  return apiClient.put<ShiftAssignment>(
    `/api/company/shifts/assignments/${id}`,
    data,
  );
}

/**
 * Xóa phân công ca
 * @client-only
 */
export async function deleteShiftAssignment(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/company/shifts/assignments/${id}`);
}

/**
 * Phân công ca cho nhiều nhân viên cùng lúc
 * @client-only
 */
export async function batchAssignShift(data: {
  employeeIds: number[];
  shiftTemplateId: number;
  workDate: string;
}): Promise<BatchAssignmentResult> {
  return apiClient.post<BatchAssignmentResult>(
    "/api/company/shifts/assignments/batch",
    data,
  );
}

export interface BatchAssignmentResult {
  totalRequested: number;
  successCount: number;
  failedCount: number;
  successfulAssignments: ShiftAssignment[];
  failedAssignments: {
    employeeId: number;
    employeeName?: string;
    reason: string;
  }[];
}

// ============================================
// Shift Swap Request APIs (Company - Manager)
// ============================================

/**
 * Lấy danh sách yêu cầu đổi ca
 * @client-only
 */
export async function getSwapRequests(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
  filters?: SwapRequestFilters,
): Promise<PaginatedResponse<ShiftSwapRequest>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filters?.requesterId)
    params.append("requesterId", filters.requesterId.toString());
  if (filters?.targetEmployeeId)
    params.append("targetEmployeeId", filters.targetEmployeeId.toString());
  if (filters?.status) params.append("status", filters.status);

  return apiClient.get<PaginatedResponse<ShiftSwapRequest>>(
    `/api/company/shifts/swaps?${params.toString()}`,
  );
}

/**
 * Lấy chi tiết yêu cầu đổi ca
 * @client-only
 */
export async function getSwapRequestById(
  id: number,
): Promise<ShiftSwapRequest> {
  return apiClient.get<ShiftSwapRequest>(`/api/company/shifts/swaps/${id}`);
}

/**
 * Duyệt/Từ chối yêu cầu đổi ca
 * @client-only
 */
export async function processSwapRequest(
  id: number,
  data: SwapApprovalRequest,
): Promise<ShiftSwapRequest> {
  return apiClient.post<ShiftSwapRequest>(
    `/api/company/shifts/swaps/${id}/process`,
    data,
  );
}

// ============================================
// Employee Shift APIs
// ============================================

/**
 * Lấy tất cả dữ liệu lịch làm việc (ca + lịch sử đổi ca) trong 1 API call
 * @client-only
 */
export async function getAllScheduleData(
  startDate: string,
  endDate: string,
): Promise<EmployeeScheduleData> {
  return apiClient.get<EmployeeScheduleData>(
    `/api/employee/schedule/all?startDate=${startDate}&endDate=${endDate}`,
  );
}

export interface EmployeeScheduleData {
  shifts: ShiftAssignment[];
  swapRequests: ShiftSwapRequest[];
}

/**
 * Lấy lịch làm việc của nhân viên
 * @client-only
 */
export async function getMySchedule(
  startDate: string,
  endDate: string,
): Promise<ShiftAssignment[]> {
  return apiClient.get<ShiftAssignment[]>(
    `/api/employee/schedule?startDate=${startDate}&endDate=${endDate}`,
  );
}

/**
 * Lấy ca làm việc có thể đổi (từ nhân viên khác)
 * @client-only
 */
export async function getAvailableShiftsForSwap(
  myShiftId: number,
): Promise<ShiftAssignment[]> {
  return apiClient.get<ShiftAssignment[]>(
    `/api/employee/schedule/available-swaps?myShiftId=${myShiftId}`,
  );
}

/**
 * Tạo yêu cầu đổi ca
 * @client-only
 */
export async function createSwapRequest(
  data: ShiftSwapRequestInput,
): Promise<ShiftSwapRequest> {
  return apiClient.post<ShiftSwapRequest>("/api/employee/schedule/swap", data);
}

/**
 * Lấy lịch sử yêu cầu đổi ca của nhân viên
 * @client-only
 */
export async function getMySwapRequests(): Promise<ShiftSwapRequest[]> {
  return apiClient.get<ShiftSwapRequest[]>(
    `/api/employee/schedule/swap-history`,
  );
}

/**
 * Hủy yêu cầu đổi ca (chỉ khi còn PENDING)
 * @client-only
 */
export async function cancelSwapRequest(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/employee/schedule/swap/${id}`);
}

// ============================================
// Export API object
// ============================================

export const shiftApi = {
  // Shift Templates
  getShiftTemplates,
  getAllShiftTemplates,
  getShiftTemplateById,
  createShiftTemplate,
  updateShiftTemplate,
  deleteShiftTemplate,
  // Shift Assignments
  getShiftAssignments,
  getAssignmentsByDateRange,
  getShiftAssignmentById,
  createShiftAssignment,
  updateShiftAssignment,
  deleteShiftAssignment,
  batchAssignShift,
  // Swap Requests (Company)
  getSwapRequests,
  getSwapRequestById,
  processSwapRequest,
  // Employee Schedule
  getAllScheduleData,
  getMySchedule,
  getAvailableShiftsForSwap,
  createSwapRequest,
  getMySwapRequests,
  cancelSwapRequest,
};
