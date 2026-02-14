import { apiClient } from "@/lib/utils/fetch-client";
import { User } from "@/types/user";
import { UpdateProfileRequest } from "@/types/employee-portal";

/**
 * My Profile API functions
 * API cho nhân viên quản lý thông tin cá nhân
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Types
// ============================================

// Response từ API /api/users/me/profile
export interface MyProfileResponse {
  // Thông tin cơ bản
  id: number;
  employeeCode: string;
  email: string;
  name: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  zipCode?: string;
  avatar?: string;

  // Thông tin công việc (readonly)
  department?: string;
  jobTitle?: string;
  joiningDate?: string;
  contractType?: string;
  managerName?: string;

  // Thông tin ngân hàng
  bankAccountType?: string;
  japanBankType?: string;
  bankName?: string;
  bankAccount?: string;
  bankAccountName?: string;
  bankCode?: string;
  bankBranchCode?: string;
  bankBranchName?: string;
  bankAccountCategory?: string;
  bankSymbol?: string;
  bankNumber?: string;

  // Liên hệ khẩn cấp
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  emergencyContactAddress?: string;

  // Tính toán
  profileCompletionPercentage?: number;
}

// Response từ API upload avatar
export interface UploadAvatarResponse {
  avatarUrl: string;
}

// ============================================
// Constants
// ============================================

const BASE_URL = "/api/users/me";

// ============================================
// API Functions
// ============================================

/**
 * Lấy thông tin profile của nhân viên đang đăng nhập
 * Sử dụng endpoint /api/users/me/profile để lấy thông tin đầy đủ
 * @client-only
 */
export async function getMyProfile(): Promise<MyProfileResponse> {
  return apiClient.get<MyProfileResponse>(`${BASE_URL}/profile`);
}

/**
 * Cập nhật thông tin profile của nhân viên
 * @client-only
 */
export async function updateMyProfile(
  data: UpdateProfileRequest,
): Promise<MyProfileResponse> {
  return apiClient.put<MyProfileResponse>(`${BASE_URL}/profile`, data);
}

/**
 * Upload avatar cho nhân viên
 * Compress ảnh sang WebP trước khi upload
 * @client-only
 */
export async function uploadAvatar(file: File): Promise<UploadAvatarResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient.upload<UploadAvatarResponse>(
    `${BASE_URL}/profile/avatar`,
    formData,
  );
}

/**
 * Lấy thông tin user hiện tại (sử dụng endpoint /api/users/me có sẵn)
 * Endpoint này trả về User object cơ bản
 * @client-only
 */
export async function getCurrentUser(): Promise<User> {
  return apiClient.get<User>(`${BASE_URL}`);
}

// ============================================
// Export API object
// ============================================

export const myProfileApi = {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  getCurrentUser,
};
