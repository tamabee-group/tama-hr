import { apiClient } from "@/lib/utils/fetch-client";
import { User } from "@/types/user";

export interface CreateCompanyEmployeeRequest {
  email: string;
  name: string;
  phone?: string;
  role: string;
  address?: string;
  zipCode?: string;
  dateOfBirth?: string;
  gender?: string;
  language: string;
}

export interface UpdateCompanyEmployeeRequest {
  name?: string;
  email?: string;
  phone?: string;
  language?: string;
  status?: string;
  zipCode?: string;
  address?: string;
  bankName?: string;
  bankAccount?: string;
  bankAccountName?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  emergencyContactAddress?: string;
}

/**
 * Tạo nhân viên công ty mới
 * @client-only
 */
export async function createCompanyEmployee(
  data: CreateCompanyEmployeeRequest,
): Promise<User> {
  return apiClient.post<User>("/api/company/employees", data);
}

/**
 * Cập nhật thông tin nhân viên công ty
 * @client-only
 */
export async function updateCompanyEmployee(
  employeeId: number,
  data: UpdateCompanyEmployeeRequest,
): Promise<User> {
  return apiClient.put<User>(`/api/company/employees/${employeeId}`, data);
}

/**
 * Upload avatar cho nhân viên công ty
 * @client-only
 */
export async function uploadCompanyEmployeeAvatar(
  employeeId: number,
  file: File,
): Promise<string> {
  const formData = new FormData();
  formData.append("avatar", file);
  return apiClient.upload<string>(
    `/api/company/employees/${employeeId}/avatar`,
    formData,
  );
}
