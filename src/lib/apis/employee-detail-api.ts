import { apiClient } from "@/lib/utils/fetch-client";
import {
  EmployeePersonalInfo,
  EmployeeDocument,
} from "@/types/employee-detail";
import {
  EmploymentContract,
  EmploymentContractInput,
  LeaveRequest,
  LeaveBalance,
} from "@/types/attendance-records";
import { PaginatedResponse } from "@/types/api";

/**
 * Employee Detail API functions
 * Quản lý thông tin chi tiết nhân viên
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Personal Info APIs
// ============================================

/**
 * Lấy personal info đầy đủ của nhân viên
 * Bao gồm: basic info, work info, contact info, bank details, emergency contact
 * @client-only
 */
export async function getEmployeePersonalInfo(
  employeeId: number,
): Promise<EmployeePersonalInfo> {
  return apiClient.get<EmployeePersonalInfo>(
    `/api/company/employees/${employeeId}/personal-info`,
  );
}

// ============================================
// Document APIs
// ============================================

/**
 * Lấy danh sách documents của nhân viên (phân trang)
 * @client-only
 */
export async function getEmployeeDocuments(
  employeeId: number,
  page: number = 0,
  size: number = 20,
): Promise<PaginatedResponse<EmployeeDocument>> {
  return apiClient.get<PaginatedResponse<EmployeeDocument>>(
    `/api/company/employees/${employeeId}/documents?page=${page}&size=${size}`,
  );
}

/**
 * Upload document mới cho nhân viên
 * @client-only
 */
export async function uploadEmployeeDocument(
  employeeId: number,
  file: File,
  documentType: string = "OTHER",
): Promise<EmployeeDocument> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentType", documentType);
  return apiClient.upload<EmployeeDocument>(
    `/api/company/employees/${employeeId}/documents`,
    formData,
  );
}

/**
 * Xóa document của nhân viên
 * @client-only
 */
export async function deleteEmployeeDocument(
  employeeId: number,
  documentId: number,
): Promise<void> {
  return apiClient.delete<void>(
    `/api/company/employees/${employeeId}/documents/${documentId}`,
  );
}

// ============================================
// Contract APIs
// ============================================

/**
 * Lấy hợp đồng hiện tại của nhân viên
 * @client-only
 */
export async function getEmployeeCurrentContract(
  employeeId: number,
): Promise<EmploymentContract | null> {
  try {
    return await apiClient.get<EmploymentContract>(
      `/api/company/contracts/employees/${employeeId}/current`,
    );
  } catch {
    return null;
  }
}

/**
 * Lấy lịch sử hợp đồng của nhân viên
 * @client-only
 */
export async function getEmployeeContractHistory(
  employeeId: number,
): Promise<EmploymentContract[]> {
  return apiClient.get<EmploymentContract[]>(
    `/api/company/contracts/employees/${employeeId}/history`,
  );
}

/**
 * Tạo hợp đồng mới cho nhân viên
 * @client-only
 */
export async function createEmployeeContract(
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
  contractId: number,
  data: EmploymentContractInput,
): Promise<EmploymentContract> {
  return apiClient.put<EmploymentContract>(
    `/api/company/contracts/${contractId}`,
    data,
  );
}

/**
 * Chấm dứt hợp đồng
 * @client-only
 */
export async function terminateContract(
  contractId: number,
  reason: string,
): Promise<EmploymentContract> {
  return apiClient.post<EmploymentContract>(
    `/api/company/contracts/${contractId}/terminate?reason=${encodeURIComponent(reason)}`,
  );
}

// ============================================
// Leave APIs
// ============================================

/**
 * Lấy danh sách yêu cầu nghỉ phép của nhân viên (phân trang)
 * @client-only
 */
export async function getEmployeeLeaveRequests(
  employeeId: number,
  page: number = 0,
  size: number = 20,
): Promise<PaginatedResponse<LeaveRequest>> {
  return apiClient.get<PaginatedResponse<LeaveRequest>>(
    `/api/company/employees/${employeeId}/leave-requests?page=${page}&size=${size}`,
  );
}

/**
 * Lấy số ngày phép còn lại của nhân viên
 * @client-only
 */
export async function getEmployeeLeaveBalance(
  employeeId: number,
): Promise<LeaveBalance[]> {
  return apiClient.get<LeaveBalance[]>(
    `/api/company/employees/${employeeId}/leave-balance`,
  );
}

// ============================================
// Export API object
// ============================================

export const employeeDetailApi = {
  // Personal Info
  getEmployeePersonalInfo,
  // Documents
  getEmployeeDocuments,
  uploadEmployeeDocument,
  deleteEmployeeDocument,
  // Contracts
  getEmployeeCurrentContract,
  getEmployeeContractHistory,
  createEmployeeContract,
  updateContract,
  terminateContract,
  // Leave
  getEmployeeLeaveRequests,
  getEmployeeLeaveBalance,
};
