import { apiClient } from "@/lib/utils/fetch-client";
import {
  CommissionResponse,
  CommissionSummaryResponse,
  CommissionFilterRequest,
  CommissionSettingsResponse,
} from "@/types/commission";
import {
  PaginatedResponse,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from "@/types/api";

/**
 * Commission API functions
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Employee APIs - Dành cho EMPLOYEE_TAMABEE
// ============================================

/**
 * Lấy danh sách hoa hồng của nhân viên hiện tại
 * @client-only
 */
export async function getMyCommissions(
  filter?: CommissionFilterRequest,
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResponse<CommissionResponse>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filter?.status) {
    params.append("status", filter.status);
  }
  if (filter?.startDate) {
    params.append("startDate", filter.startDate);
  }
  if (filter?.endDate) {
    params.append("endDate", filter.endDate);
  }

  return apiClient.get<PaginatedResponse<CommissionResponse>>(
    `/api/employee/commissions?${params.toString()}`,
  );
}

/**
 * Lấy tổng hợp hoa hồng của nhân viên hiện tại
 * @client-only
 */
export async function getMySummary(): Promise<CommissionSummaryResponse> {
  return apiClient.get<CommissionSummaryResponse>(
    "/api/employee/commissions/summary",
  );
}

/**
 * Lấy thông tin cấu hình hoa hồng (số tiền, điều kiện...)
 * @client-only
 */
export async function getMySettings(): Promise<CommissionSettingsResponse> {
  return apiClient.get<CommissionSettingsResponse>(
    "/api/employee/commissions/settings",
  );
}

// ============================================
// Admin APIs - Dành cho ADMIN_TAMABEE, MANAGER_TAMABEE
// ============================================

/**
 * Lấy danh sách tất cả hoa hồng
 * @client-only
 */
export async function getAll(
  filter?: CommissionFilterRequest,
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResponse<CommissionResponse>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filter?.employeeCode) {
    params.append("employeeCode", filter.employeeCode);
  }
  if (filter?.status) {
    params.append("status", filter.status);
  }
  if (filter?.companyId !== undefined) {
    params.append("companyId", filter.companyId.toString());
  }
  if (filter?.startDate) {
    params.append("startDate", filter.startDate);
  }
  if (filter?.endDate) {
    params.append("endDate", filter.endDate);
  }

  return apiClient.get<PaginatedResponse<CommissionResponse>>(
    `/api/admin/commissions?${params.toString()}`,
  );
}

/**
 * Lấy tổng hợp hoa hồng của tất cả nhân viên
 * @client-only
 */
export async function getSummary(): Promise<CommissionSummaryResponse> {
  return apiClient.get<CommissionSummaryResponse>(
    "/api/admin/commissions/summary",
  );
}

/**
 * Đánh dấu hoa hồng đã thanh toán
 * @client-only
 */
export async function markAsPaid(id: number): Promise<CommissionResponse> {
  return apiClient.post<CommissionResponse>(
    `/api/admin/commissions/${id}/paid`,
  );
}

// ============================================
// Commission API object - Export tất cả functions
// ============================================

export const commissionApi = {
  // Employee APIs
  getMyCommissions,
  getMySummary,
  getMySettings,

  // Admin APIs
  getAll,
  getSummary,
  markAsPaid,
};
