import { apiClient } from "@/lib/utils/fetch-client";
import {
  EmploymentContract,
  EmploymentContractInput,
} from "@/types/attendance-records";
import { PaginatedResponse } from "@/types/api";

/**
 * Employment Contract API functions
 * Quản lý hợp đồng lao động
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

export interface ContractFilters {
  employeeId?: number;
  contractType?: string;
  status?: string;
  expiringWithinDays?: number;
}

export interface TerminateContractRequest {
  reason: string;
  terminationDate?: string;
}

export interface ContractValidationResponse {
  isValid: boolean;
  hasOverlap: boolean;
  overlappingContract?: EmploymentContract;
  message?: string;
}

export interface ExpiringContractsSummary {
  totalExpiring: number;
  expiringWithin7Days: number;
  expiringWithin30Days: number;
  contracts: EmploymentContract[];
}

// ============================================
// Company Contract APIs
// ============================================

/**
 * Lấy danh sách hợp đồng
 * @client-only
 */
export async function getContracts(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
  filters?: ContractFilters,
): Promise<PaginatedResponse<EmploymentContract>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filters?.employeeId)
    params.append("employeeId", filters.employeeId.toString());
  if (filters?.contractType)
    params.append("contractType", filters.contractType);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.expiringWithinDays)
    params.append("expiringWithinDays", filters.expiringWithinDays.toString());

  return apiClient.get<PaginatedResponse<EmploymentContract>>(
    `/api/company/contracts?${params.toString()}`,
  );
}

/**
 * Lấy chi tiết hợp đồng theo ID
 * @client-only
 */
export async function getContractById(id: number): Promise<EmploymentContract> {
  return apiClient.get<EmploymentContract>(`/api/company/contracts/${id}`);
}

/**
 * Lấy hợp đồng hiện tại của nhân viên
 * @client-only
 */
export async function getEmployeeCurrentContract(
  employeeId: number,
): Promise<EmploymentContract | null> {
  return apiClient.get<EmploymentContract | null>(
    `/api/company/contracts/employees/${employeeId}/current`,
  );
}

/**
 * Lấy lịch sử hợp đồng của nhân viên
 * @client-only
 */
export async function getEmployeeContractHistory(
  employeeId: number,
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
): Promise<PaginatedResponse<EmploymentContract>> {
  return apiClient.get<PaginatedResponse<EmploymentContract>>(
    `/api/company/contracts/employees/${employeeId}/history?page=${page}&size=${size}`,
  );
}

/**
 * Kiểm tra xem hợp đồng mới có bị trùng không
 * @client-only
 */
export async function validateContract(
  employeeId: number,
  data: EmploymentContractInput,
): Promise<ContractValidationResponse> {
  return apiClient.post<ContractValidationResponse>(
    `/api/company/contracts/employees/${employeeId}/validate`,
    data,
  );
}

/**
 * Tạo hợp đồng mới
 * @client-only
 */
export async function createContract(
  employeeId: number,
  data: EmploymentContractInput,
): Promise<EmploymentContract> {
  return apiClient.post<EmploymentContract>(
    `/api/company/contracts/employees/${employeeId}`,
    data,
  );
}

/**
 * Cập nhật hợp đồng
 * @client-only
 */
export async function updateContract(
  id: number,
  data: EmploymentContractInput,
): Promise<EmploymentContract> {
  return apiClient.put<EmploymentContract>(
    `/api/company/contracts/${id}`,
    data,
  );
}

/**
 * Chấm dứt hợp đồng
 * @client-only
 */
export async function terminateContract(
  id: number,
  data: TerminateContractRequest,
): Promise<EmploymentContract> {
  return apiClient.post<EmploymentContract>(
    `/api/company/contracts/${id}/terminate`,
    data,
  );
}

/**
 * Xóa hợp đồng (chỉ xóa được nếu chưa có hiệu lực)
 * @client-only
 */
export async function deleteContract(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/company/contracts/${id}`);
}

// ============================================
// Expiring Contracts APIs
// ============================================

/**
 * Lấy danh sách hợp đồng sắp hết hạn
 * @client-only
 */
export async function getExpiringContracts(
  days: number = 30,
): Promise<EmploymentContract[]> {
  return apiClient.get<EmploymentContract[]>(
    `/api/company/contracts/expiring?days=${days}`,
  );
}

/**
 * Lấy tổng hợp hợp đồng sắp hết hạn
 * @client-only
 */
export async function getExpiringContractsSummary(): Promise<ExpiringContractsSummary> {
  return apiClient.get<ExpiringContractsSummary>(
    "/api/company/contracts/expiring/summary",
  );
}

/**
 * Đếm số hợp đồng sắp hết hạn (cho notification badge)
 * @client-only
 */
export async function countExpiringContracts(
  days: number = 30,
): Promise<number> {
  const response = await apiClient.get<{ count: number }>(
    `/api/company/contracts/expiring/count?days=${days}`,
  );
  return response.count;
}

// ============================================
// Export API object
// ============================================

export const contractApi = {
  // Contracts
  getContracts,
  getContractById,
  getEmployeeCurrentContract,
  getEmployeeContractHistory,
  validateContract,
  createContract,
  updateContract,
  terminateContract,
  deleteContract,
  // Expiring
  getExpiringContracts,
  getExpiringContractsSummary,
  countExpiringContracts,
};
