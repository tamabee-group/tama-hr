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

// Response type cho approvers
export interface ApproverInfo {
  id: number;
  name: string;
  role: string;
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

/**
 * Lấy danh sách người có quyền duyệt (admin và manager)
 * @client-only
 */
export async function getApprovers(): Promise<ApproverInfo[]> {
  return apiClient.get<ApproverInfo[]>("/api/company/employees/approvers");
}

/**
 * Gửi mã xác thực email cho nhân viên trong tenant
 * Dùng cho: đổi email, xác thực email mới của nhân viên
 * @client-only
 */
export async function sendEmployeeVerificationCode(
  email: string,
  language?: string,
) {
  const params = new URLSearchParams({ email });
  if (language) params.append("language", language);
  return apiClient.post(`/api/company/employees/send-verification?${params}`);
}

/**
 * Xác thực mã OTP cho nhân viên trong tenant
 * @client-only
 */
export async function verifyEmployeeEmail(
  email: string,
  code: string,
): Promise<boolean> {
  const params = new URLSearchParams({ email, code });
  return apiClient.post<boolean>(
    `/api/company/employees/verify-email?${params}`,
  );
}
