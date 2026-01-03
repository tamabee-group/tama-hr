import { apiClient } from "@/lib/utils/fetch-client";
import {
  EmployeeSalaryConfig,
  EmployeeSalaryConfigInput,
} from "@/types/attendance-records";
import { PaginatedResponse } from "@/types/api";

/**
 * Employee Salary Configuration API functions
 * Quản lý cấu hình lương cá nhân cho từng nhân viên
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

export interface SalaryConfigFilters {
  employeeId?: number;
  salaryType?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface SalaryConfigValidationResponse {
  isValid: boolean;
  affectsCurrentPayroll: boolean;
  currentPayrollPeriod?: string;
  message?: string;
  hasOverlappingConfigs: boolean;
  overlappingConfigsCount: number;
}

// ============================================
// Company Salary Config APIs
// ============================================

/**
 * Lấy danh sách cấu hình lương của tất cả nhân viên
 * @client-only
 */
export async function getSalaryConfigs(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
  filters?: SalaryConfigFilters,
): Promise<PaginatedResponse<EmployeeSalaryConfig>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filters?.employeeId)
    params.append("employeeId", filters.employeeId.toString());
  if (filters?.salaryType) params.append("salaryType", filters.salaryType);
  if (filters?.effectiveFrom)
    params.append("effectiveFrom", filters.effectiveFrom);
  if (filters?.effectiveTo) params.append("effectiveTo", filters.effectiveTo);

  return apiClient.get<PaginatedResponse<EmployeeSalaryConfig>>(
    `/api/company/salary-configs?${params.toString()}`,
  );
}

/**
 * Lấy cấu hình lương hiện tại của nhân viên
 * @client-only
 */
export async function getEmployeeCurrentSalaryConfig(
  employeeId: number,
): Promise<EmployeeSalaryConfig | null> {
  return apiClient.get<EmployeeSalaryConfig | null>(
    `/api/company/employees/${employeeId}/salary-config/current`,
  );
}

/**
 * Lấy lịch sử cấu hình lương của nhân viên
 * @client-only
 */
export async function getEmployeeSalaryConfigHistory(
  employeeId: number,
): Promise<EmployeeSalaryConfig[]> {
  // API trả về List, không phải PaginatedResponse
  return apiClient.get<EmployeeSalaryConfig[]>(
    `/api/company/employees/${employeeId}/salary-config/history`,
  );
}

/**
 * Lấy chi tiết cấu hình lương theo ID
 * @client-only
 */
export async function getSalaryConfigById(
  id: number,
): Promise<EmployeeSalaryConfig> {
  return apiClient.get<EmployeeSalaryConfig>(
    `/api/company/salary-configs/${id}`,
  );
}

/**
 * Kiểm tra xem cấu hình lương mới có ảnh hưởng đến kỳ lương hiện tại không
 * @client-only
 */
export async function validateSalaryConfig(
  employeeId: number,
  data: EmployeeSalaryConfigInput,
): Promise<SalaryConfigValidationResponse> {
  return apiClient.post<SalaryConfigValidationResponse>(
    `/api/company/employees/${employeeId}/salary-config/validate`,
    data,
  );
}

/**
 * Tạo cấu hình lương mới cho nhân viên
 * @client-only
 */
export async function createSalaryConfig(
  employeeId: number,
  data: EmployeeSalaryConfigInput,
): Promise<EmployeeSalaryConfig> {
  return apiClient.post<EmployeeSalaryConfig>(
    `/api/company/employees/${employeeId}/salary-config`,
    data,
  );
}

/**
 * Cập nhật cấu hình lương
 * @client-only
 */
export async function updateSalaryConfig(
  employeeId: number,
  configId: number,
  data: EmployeeSalaryConfigInput,
): Promise<EmployeeSalaryConfig> {
  return apiClient.put<EmployeeSalaryConfig>(
    `/api/company/employees/${employeeId}/salary-config/${configId}`,
    data,
  );
}

/**
 * Xóa cấu hình lương
 * @client-only
 */
export async function deleteSalaryConfig(
  employeeId: number,
  configId: number,
): Promise<void> {
  return apiClient.delete<void>(
    `/api/company/employees/${employeeId}/salary-config/${configId}`,
  );
}

// ============================================
// Export API object
// ============================================

export const salaryConfigApi = {
  getSalaryConfigs,
  getEmployeeCurrentSalaryConfig,
  getEmployeeSalaryConfigHistory,
  getSalaryConfigById,
  validateSalaryConfig,
  createSalaryConfig,
  updateSalaryConfig,
  deleteSalaryConfig,
};
