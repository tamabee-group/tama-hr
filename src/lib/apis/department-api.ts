import { apiClient } from "@/lib/utils/fetch-client";
import { PaginatedResponse } from "@/types/api";
import {
  Department,
  DepartmentTreeNode,
  DepartmentSummary,
  DefaultApprover,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentEmployee,
} from "@/types/department";

/**
 * Department API functions
 * Quản lý phòng ban
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Query Operations
// ============================================

/**
 * Lấy danh sách phòng ban (có phân trang)
 */
export async function getDepartments(
  page: number = 0,
  size: number = 20,
): Promise<PaginatedResponse<Department>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());
  return apiClient.get<PaginatedResponse<Department>>(
    `/api/company/departments?${params.toString()}`,
  );
}

/**
 * Lấy cây phòng ban (hierarchical)
 */
export async function getDepartmentTree(): Promise<DepartmentTreeNode[]> {
  return apiClient.get<DepartmentTreeNode[]>("/api/company/departments/tree");
}

/**
 * Lấy danh sách phòng ban cho dropdown
 */
export async function getDepartmentsForDropdown(): Promise<
  DepartmentSummary[]
> {
  return apiClient.get<DepartmentSummary[]>(
    "/api/company/departments/dropdown",
  );
}

/**
 * Tìm kiếm phòng ban
 */
export async function searchDepartments(
  keyword: string,
  page: number = 0,
  size: number = 20,
): Promise<PaginatedResponse<Department>> {
  const params = new URLSearchParams();
  params.append("keyword", keyword);
  params.append("page", page.toString());
  params.append("size", size.toString());
  return apiClient.get<PaginatedResponse<Department>>(
    `/api/company/departments/search?${params.toString()}`,
  );
}

/**
 * Lấy chi tiết phòng ban
 */
export async function getDepartment(id: number): Promise<Department> {
  return apiClient.get<Department>(`/api/company/departments/${id}`);
}

// ============================================
// CRUD Operations
// ============================================

/**
 * Tạo phòng ban mới
 */
export async function createDepartment(
  data: CreateDepartmentRequest,
): Promise<Department> {
  return apiClient.post<Department>("/api/company/departments", data);
}

/**
 * Cập nhật phòng ban
 */
export async function updateDepartment(
  id: number,
  data: UpdateDepartmentRequest,
): Promise<Department> {
  return apiClient.put<Department>(`/api/company/departments/${id}`, data);
}

/**
 * Xóa phòng ban
 */
export async function deleteDepartment(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/company/departments/${id}`);
}

// ============================================
// Employee Operations
// ============================================

/**
 * Lấy danh sách nhân viên trong phòng ban
 */
export async function getDepartmentEmployees(
  departmentId: number,
): Promise<DepartmentEmployee[]> {
  return apiClient.get<DepartmentEmployee[]>(
    `/api/company/departments/${departmentId}/employees`,
  );
}

/**
 * Lấy người duyệt mặc định cho nhân viên (department manager)
 */
export async function getDefaultApprover(
  employeeId: number,
): Promise<DefaultApprover | null> {
  return apiClient.get<DefaultApprover | null>(
    `/api/company/employees/${employeeId}/default-approver`,
  );
}

// ============================================
// Export API object
// ============================================

export const departmentApi = {
  getDepartments,
  getDepartmentTree,
  getDepartmentsForDropdown,
  searchDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentEmployees,
  getDefaultApprover,
};
