import { User } from "@/types/user";
import { apiClient } from "@/lib/utils/fetch-client";

export interface UpdateUserProfileRequest {
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
 * Cập nhật thông tin profile user
 * @client-only
 */
export async function updateUserProfile(
  userId: number,
  data: UpdateUserProfileRequest,
): Promise<User> {
  return apiClient.put<User>(`/api/admin/users/${userId}`, data);
}

/**
 * Upload avatar cho user
 * @client-only
 */
export async function uploadUserAvatar(
  userId: number,
  file: File,
): Promise<string> {
  const formData = new FormData();
  formData.append("avatar", file);
  return apiClient.upload<string>(
    `/api/admin/users/${userId}/avatar`,
    formData,
  );
}
