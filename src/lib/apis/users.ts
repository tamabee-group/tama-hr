import { apiClient } from "@/lib/utils/fetch-client";
import { User } from "@/types/user";

export interface CreateTamabeeUserRequest {
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

/**
 * Tạo user Tamabee mới
 * @client-only
 */
export async function createTamabeeUser(
  data: CreateTamabeeUserRequest,
): Promise<User> {
  return apiClient.post<User>("/api/admin/users", data);
}
