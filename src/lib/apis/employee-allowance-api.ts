import { apiClient } from "@/lib/utils/fetch-client";
import {
  EmployeeAllowance,
  EmployeeAllowanceInput,
} from "@/types/attendance-records";
import { PaginatedResponse } from "@/types/api";

/**
 * Employee Allowance API functions
 * Quản lý phụ cấp cá nhân cho từng nhân viên
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

export interface AllowanceFilters {
  employeeId?: number;
  allowanceCode?: string;
  isActive?: boolean;
  isOverride?: boolean;
}

// ============================================
// Company Allowance APIs
// ============================================

/**
 * Lấy danh sách phụ cấp của tất cả nhân viên
 * @client-only
 */
export async function getAllowances(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
  filters?: AllowanceFilters,
): Promise<PaginatedResponse<EmployeeAllowance>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filters?.employeeId)
    params.append("employeeId", filters.employeeId.toString());
  if (filters?.allowanceCode)
    params.append("allowanceCode", filters.allowanceCode);
  if (filters?.isActive !== undefined)
    params.append("isActive", filters.isActive.toString());
  if (filters?.isOverride !== undefined)
    params.append("isOverride", filters.isOverride.toString());

  return apiClient.get<PaginatedResponse<EmployeeAllowance>>(
    `/api/company/employee-allowances?${params.toString()}`,
  );
}

/**
 * Lấy danh sách phụ cấp của nhân viên cụ thể
 * @client-only
 */
export async function getEmployeeAllowances(
  employeeId: number,
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
): Promise<PaginatedResponse<EmployeeAllowance>> {
  return apiClient.get<PaginatedResponse<EmployeeAllowance>>(
    `/api/company/employees/${employeeId}/allowances?page=${page}&size=${size}`,
  );
}

/**
 * Lấy tất cả phụ cấp đang active của nhân viên (không phân trang)
 * @client-only
 */
export async function getEmployeeActiveAllowances(
  employeeId: number,
): Promise<EmployeeAllowance[]> {
  return apiClient.get<EmployeeAllowance[]>(
    `/api/company/employees/${employeeId}/allowances/active`,
  );
}

/**
 * Lấy chi tiết phụ cấp theo ID
 * @client-only
 */
export async function getAllowanceById(id: number): Promise<EmployeeAllowance> {
  return apiClient.get<EmployeeAllowance>(
    `/api/company/employee-allowances/${id}`,
  );
}

/**
 * Tạo phụ cấp mới cho nhân viên
 * @client-only
 */
export async function createAllowance(
  employeeId: number,
  data: EmployeeAllowanceInput,
): Promise<EmployeeAllowance> {
  return apiClient.post<EmployeeAllowance>(
    `/api/company/employees/${employeeId}/allowances`,
    data,
  );
}

/**
 * Cập nhật phụ cấp
 * @client-only
 */
export async function updateAllowance(
  id: number,
  data: EmployeeAllowanceInput,
): Promise<EmployeeAllowance> {
  return apiClient.put<EmployeeAllowance>(
    `/api/company/employee-allowances/${id}`,
    data,
  );
}

/**
 * Vô hiệu hóa phụ cấp (soft delete)
 * @client-only
 */
export async function deactivateAllowance(id: number): Promise<void> {
  return apiClient.post<void>(
    `/api/company/employee-allowances/${id}/deactivate`,
    {},
  );
}

/**
 * Xóa phụ cấp (hard delete - chỉ khi chưa được sử dụng)
 * @client-only
 */
export async function deleteAllowance(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/company/employee-allowances/${id}`);
}

// ============================================
// Export API object
// ============================================

export const employeeAllowanceApi = {
  getAllowances,
  getEmployeeAllowances,
  getEmployeeActiveAllowances,
  getAllowanceById,
  createAllowance,
  updateAllowance,
  deactivateAllowance,
  deleteAllowance,
};
