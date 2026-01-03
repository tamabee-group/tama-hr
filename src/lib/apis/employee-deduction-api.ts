import { apiClient } from "@/lib/utils/fetch-client";
import {
  EmployeeDeduction,
  EmployeeDeductionInput,
} from "@/types/attendance-records";
import { PaginatedResponse } from "@/types/api";

/**
 * Employee Deduction API functions
 * Quản lý khấu trừ cá nhân cho từng nhân viên
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

export interface DeductionFilters {
  employeeId?: number;
  deductionCode?: string;
  isActive?: boolean;
  isOverride?: boolean;
}

// ============================================
// Company Deduction APIs
// ============================================

/**
 * Lấy danh sách khấu trừ của tất cả nhân viên
 * @client-only
 */
export async function getDeductions(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
  filters?: DeductionFilters,
): Promise<PaginatedResponse<EmployeeDeduction>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filters?.employeeId)
    params.append("employeeId", filters.employeeId.toString());
  if (filters?.deductionCode)
    params.append("deductionCode", filters.deductionCode);
  if (filters?.isActive !== undefined)
    params.append("isActive", filters.isActive.toString());
  if (filters?.isOverride !== undefined)
    params.append("isOverride", filters.isOverride.toString());

  return apiClient.get<PaginatedResponse<EmployeeDeduction>>(
    `/api/company/employee-deductions?${params.toString()}`,
  );
}

/**
 * Lấy danh sách khấu trừ của nhân viên cụ thể
 * @client-only
 */
export async function getEmployeeDeductions(
  employeeId: number,
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
): Promise<PaginatedResponse<EmployeeDeduction>> {
  return apiClient.get<PaginatedResponse<EmployeeDeduction>>(
    `/api/company/employees/${employeeId}/deductions?page=${page}&size=${size}`,
  );
}

/**
 * Lấy tất cả khấu trừ đang active của nhân viên (không phân trang)
 * @client-only
 */
export async function getEmployeeActiveDeductions(
  employeeId: number,
): Promise<EmployeeDeduction[]> {
  return apiClient.get<EmployeeDeduction[]>(
    `/api/company/employees/${employeeId}/deductions/active`,
  );
}

/**
 * Lấy chi tiết khấu trừ theo ID
 * @client-only
 */
export async function getDeductionById(id: number): Promise<EmployeeDeduction> {
  return apiClient.get<EmployeeDeduction>(
    `/api/company/employee-deductions/${id}`,
  );
}

/**
 * Tạo khấu trừ mới cho nhân viên
 * @client-only
 */
export async function createDeduction(
  employeeId: number,
  data: EmployeeDeductionInput,
): Promise<EmployeeDeduction> {
  return apiClient.post<EmployeeDeduction>(
    `/api/company/employees/${employeeId}/deductions`,
    data,
  );
}

/**
 * Cập nhật khấu trừ
 * @client-only
 */
export async function updateDeduction(
  id: number,
  data: EmployeeDeductionInput,
): Promise<EmployeeDeduction> {
  return apiClient.put<EmployeeDeduction>(
    `/api/company/employee-deductions/${id}`,
    data,
  );
}

/**
 * Vô hiệu hóa khấu trừ (soft delete)
 * @client-only
 */
export async function deactivateDeduction(id: number): Promise<void> {
  return apiClient.post<void>(
    `/api/company/employee-deductions/${id}/deactivate`,
    {},
  );
}

/**
 * Xóa khấu trừ (hard delete - chỉ khi chưa được sử dụng)
 * @client-only
 */
export async function deleteDeduction(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/company/employee-deductions/${id}`);
}

// ============================================
// Export API object
// ============================================

export const employeeDeductionApi = {
  getDeductions,
  getEmployeeDeductions,
  getEmployeeActiveDeductions,
  getDeductionById,
  createDeduction,
  updateDeduction,
  deactivateDeduction,
  deleteDeduction,
};
