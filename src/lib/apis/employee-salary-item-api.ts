import { apiClient } from "@/lib/utils/fetch-client";
import {
  EmployeeSalaryItem,
  AssignSalaryItemRequest,
  UpdateSalaryItemRequest,
} from "@/types/salary-item";

/**
 * Employee Salary Item API functions
 * Quản lý phụ cấp/khấu trừ của nhân viên
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Query Operations
// ============================================

/**
 * Lấy tất cả salary items của nhân viên
 * @client-only
 */
export async function getEmployeeSalaryItems(
  employeeId: number,
): Promise<EmployeeSalaryItem[]> {
  return apiClient.get<EmployeeSalaryItem[]>(
    `/api/company/employees/${employeeId}/salary-items`,
  );
}

/**
 * Lấy danh sách phụ cấp của nhân viên
 * @client-only
 */
export async function getEmployeeAllowances(
  employeeId: number,
): Promise<EmployeeSalaryItem[]> {
  return apiClient.get<EmployeeSalaryItem[]>(
    `/api/company/employees/${employeeId}/salary-items/allowances`,
  );
}

/**
 * Lấy danh sách khấu trừ của nhân viên
 * @client-only
 */
export async function getEmployeeDeductions(
  employeeId: number,
): Promise<EmployeeSalaryItem[]> {
  return apiClient.get<EmployeeSalaryItem[]>(
    `/api/company/employees/${employeeId}/salary-items/deductions`,
  );
}

// ============================================
// CRUD Operations
// ============================================

/**
 * Gán salary item cho nhân viên
 * @client-only
 */
export async function assignSalaryItem(
  employeeId: number,
  data: AssignSalaryItemRequest,
): Promise<EmployeeSalaryItem> {
  return apiClient.post<EmployeeSalaryItem>(
    `/api/company/employees/${employeeId}/salary-items`,
    data,
  );
}

/**
 * Cập nhật salary item
 * @client-only
 */
export async function updateSalaryItem(
  employeeId: number,
  itemId: number,
  data: UpdateSalaryItemRequest,
): Promise<EmployeeSalaryItem> {
  return apiClient.put<EmployeeSalaryItem>(
    `/api/company/employees/${employeeId}/salary-items/${itemId}`,
    data,
  );
}

/**
 * Xóa salary item
 * @client-only
 */
export async function deleteSalaryItem(
  employeeId: number,
  itemId: number,
): Promise<void> {
  return apiClient.delete<void>(
    `/api/company/employees/${employeeId}/salary-items/${itemId}`,
  );
}

// ============================================
// Export API object
// ============================================

export const employeeSalaryItemApi = {
  getEmployeeSalaryItems,
  getEmployeeAllowances,
  getEmployeeDeductions,
  assignSalaryItem,
  updateSalaryItem,
  deleteSalaryItem,
};
