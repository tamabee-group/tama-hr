import { apiClient } from "@/lib/utils/fetch-client";
import {
  SalaryItemTemplate,
  CreateSalaryItemTemplateRequest,
  UpdateSalaryItemTemplateRequest,
  SalaryItemType,
} from "@/types/salary-item";

/**
 * Salary Item Template API functions
 * Quản lý template phụ cấp/khấu trừ
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// CRUD Operations
// ============================================

/**
 * Lấy tất cả templates
 * @client-only
 */
export async function getAllTemplates(): Promise<SalaryItemTemplate[]> {
  return apiClient.get<SalaryItemTemplate[]>(
    "/api/company/salary-item-templates",
  );
}

/**
 * Lấy templates theo loại (ALLOWANCE/DEDUCTION)
 * @client-only
 */
export async function getTemplatesByType(
  type: SalaryItemType,
): Promise<SalaryItemTemplate[]> {
  return apiClient.get<SalaryItemTemplate[]>(
    `/api/company/salary-item-templates/type/${type}`,
  );
}

/**
 * Tạo template mới
 * @client-only
 */
export async function createTemplate(
  data: CreateSalaryItemTemplateRequest,
): Promise<SalaryItemTemplate> {
  return apiClient.post<SalaryItemTemplate>(
    "/api/company/salary-item-templates",
    data,
  );
}

/**
 * Cập nhật template
 * @client-only
 */
export async function updateTemplate(
  id: number,
  data: UpdateSalaryItemTemplateRequest,
): Promise<SalaryItemTemplate> {
  return apiClient.put<SalaryItemTemplate>(
    `/api/company/salary-item-templates/${id}`,
    data,
  );
}

/**
 * Xóa template
 * @client-only
 */
export async function deleteTemplate(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/company/salary-item-templates/${id}`);
}

/**
 * Lấy số nhân viên đang sử dụng template
 * @client-only
 */
export async function getEmployeeCountByTemplateId(
  id: number,
): Promise<number> {
  return apiClient.get<number>(
    `/api/company/salary-item-templates/${id}/employee-count`,
  );
}

// ============================================
// Export API object
// ============================================

export const salaryItemTemplateApi = {
  getAllTemplates,
  getTemplatesByType,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getEmployeeCountByTemplateId,
};
